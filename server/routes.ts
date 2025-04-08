import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { WebCrawler } from "./crawler";
import { ReactConverter } from "./react-converter";
import { z } from "zod";
import fs from "fs";
import path from "path";
import passport from "passport";
import JSZip from "jszip";
import { 
  crawlOptionsSchema, 
  insertCrawlSchema, 
  insertPageSchema,
  insertAssetSchema,
  insertSavedSiteSchema,
  insertConvertedSiteSchema,
  loginSchema, 
  registerSchema 
} from "@shared/schema";
import { registerUser, isAuthenticated, getUserId } from "./auth";

// Helper function to ensure URLs have a protocol
function ensureHttpProtocol(url: string): string {
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return 'https://' + url;
  }
  return url;
}

// Helper function to validate if a URL is valid
function isValidUrl(urlString: string): boolean {
  try {
    new URL(urlString);
    return true;
  } catch (e) {
    return false;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Crawl routes
  app.post("/api/crawl", isAuthenticated, async (req: Request, res: Response) => {
    try {
      console.log("Starting crawl with data:", req.body);
      
      // Get user ID from the request
      const userId = getUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      // Validate the request data
      const clientSchema = z.object({
        url: z.string(),
        depth: z.number(),
        options: crawlOptionsSchema
      });
      
      // Parse the client request first
      const { url: clientUrl, depth, options } = clientSchema.parse(req.body);
      
      // This is the URL that will be used in our validation
      let url = clientUrl;
      
      // Ensure URL has protocol
      url = ensureHttpProtocol(url);
      
      // Validate URL format
      if (!isValidUrl(url)) {
        return res.status(400).json({ 
          message: "Invalid URL format. Please provide a valid URL." 
        });
      }
      
      console.log(`Processing crawl for URL: ${url}, depth: ${depth}`);

      // Check if there's already an active crawl for this URL
      const normalizedUrl = url.replace(/^https?:\/\//, '');
      const existingCrawl = await storage.getCrawlByUrl(normalizedUrl, userId);
      
      if (existingCrawl && existingCrawl.status === "in_progress") {
        return res.status(409).json({ 
          message: `A crawl for ${url} is already in progress` 
        });
      }

      // Create a new crawl with the normalized URL and user ID
      const crawl = await storage.createCrawl({
        userId,
        url: normalizedUrl,
        depth,
        options
      });

      // Start the crawl process asynchronously
      const crawler = new WebCrawler(storage);
      crawler.startCrawl(crawl.id, normalizedUrl, depth, options).catch(err => {
        console.error("Crawl error:", err);
      });

      return res.status(201).json(crawl);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.message });
      }
      console.error("Error starting crawl:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/crawl/:id/pause", isAuthenticated, async (req: Request, res: Response) => {
    try {
      // Get user ID from the request
      const userId = getUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid crawl ID" });
      }

      const crawl = await storage.getCrawl(id);
      if (!crawl) {
        return res.status(404).json({ message: "Crawl not found" });
      }
      
      // Verify the crawl belongs to the authenticated user
      if (crawl.userId !== userId) {
        return res.status(403).json({ message: "You don't have permission to pause this crawl" });
      }

      if (crawl.status !== "in_progress") {
        return res.status(400).json({ message: `Cannot pause crawl with status: ${crawl.status}` });
      }

      const updatedCrawl = await storage.updateCrawlStatus(id, "paused");
      return res.status(200).json(updatedCrawl);
    } catch (error) {
      console.error("Error pausing crawl:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/crawl/:id/resume", isAuthenticated, async (req: Request, res: Response) => {
    try {
      // Get user ID from the request
      const userId = getUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid crawl ID" });
      }

      const crawl = await storage.getCrawl(id);
      if (!crawl) {
        return res.status(404).json({ message: "Crawl not found" });
      }
      
      // Verify the crawl belongs to the authenticated user
      if (crawl.userId !== userId) {
        return res.status(403).json({ message: "You don't have permission to resume this crawl" });
      }

      if (crawl.status !== "paused") {
        return res.status(400).json({ message: `Cannot resume crawl with status: ${crawl.status}` });
      }

      const updatedCrawl = await storage.updateCrawlStatus(id, "in_progress");
      
      // Resume the crawl process
      const crawler = new WebCrawler(storage);
      crawler.resumeCrawl(id).catch(err => {
        console.error("Crawl resume error:", err);
      });

      return res.status(200).json(updatedCrawl);
    } catch (error) {
      console.error("Error resuming crawl:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/crawl/:id/cancel", isAuthenticated, async (req: Request, res: Response) => {
    try {
      // Get user ID from the request
      const userId = getUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid crawl ID" });
      }

      const crawl = await storage.getCrawl(id);
      if (!crawl) {
        return res.status(404).json({ message: "Crawl not found" });
      }
      
      // Verify the crawl belongs to the authenticated user
      if (crawl.userId !== userId) {
        return res.status(403).json({ message: "You don't have permission to cancel this crawl" });
      }

      if (!["in_progress", "paused"].includes(crawl.status)) {
        return res.status(400).json({ message: `Cannot cancel crawl with status: ${crawl.status}` });
      }

      const updatedCrawl = await storage.updateCrawlStatus(id, "cancelled");
      return res.status(200).json(updatedCrawl);
    } catch (error) {
      console.error("Error cancelling crawl:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // This route needs to be before the /api/crawl/:id route to avoid conflict
  app.get("/api/crawl/history", isAuthenticated, async (req: Request, res: Response) => {
    try {
      // Get user ID from the request
      const userId = getUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      console.log("Fetching crawl history for user:", userId);
      const crawls = await storage.getCrawlHistory(userId);
      console.log("Crawl history results:", crawls);
      return res.status(200).json(crawls);
    } catch (error) {
      console.error("Error fetching crawl history:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // This route must be after the /api/crawl/history route
  app.get("/api/crawl/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      // Get user ID from the request
      const userId = getUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid crawl ID" });
      }

      const crawl = await storage.getCrawl(id);
      if (!crawl) {
        return res.status(404).json({ message: "Crawl not found" });
      }
      
      // Verify the crawl belongs to the authenticated user
      if (crawl.userId !== userId) {
        return res.status(403).json({ message: "You don't have permission to access this crawl" });
      }

      return res.status(200).json(crawl);
    } catch (error) {
      console.error("Error fetching crawl:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Route to delete crawl history
  app.delete("/api/crawl/history/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      // Get user ID from the request
      const userId = getUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
    
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid crawl ID" });
      }

      // There's no explicit delete method in our storage interface,
      // so we'll just mark it as cancelled
      const crawl = await storage.getCrawl(id);
      
      if (!crawl) {
        return res.status(404).json({ message: "Crawl not found" });
      }
      
      // Verify the crawl belongs to the authenticated user
      if (crawl.userId !== userId) {
        return res.status(403).json({ message: "You don't have permission to delete this crawl" });
      }
      
      await storage.updateCrawlStatus(id, "cancelled");
      return res.status(204).end();
    } catch (error) {
      console.error("Error deleting crawl:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Page routes
  app.get("/api/pages/:crawlId/:path(*)", isAuthenticated, async (req: Request, res: Response) => {
    try {
      // Get user ID from the request
      const userId = getUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
    
      const crawlId = parseInt(req.params.crawlId);
      const pagePath = req.params.path;
      
      if (isNaN(crawlId)) {
        return res.status(400).json({ message: "Invalid crawl ID" });
      }
      
      // Get the crawl to verify ownership
      const crawl = await storage.getCrawl(crawlId);
      if (!crawl) {
        return res.status(404).json({ message: "Crawl not found" });
      }
      
      // Verify the crawl belongs to the authenticated user
      if (crawl.userId !== userId) {
        return res.status(403).json({ message: "You don't have permission to access pages from this crawl" });
      }

      const page = await storage.getPageByPath(crawlId, pagePath);
      if (!page) {
        return res.status(404).json({ message: "Page not found" });
      }

      return res.status(200).json(page);
    } catch (error) {
      console.error("Error fetching page:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/pages", isAuthenticated, async (req: Request, res: Response) => {
    try {
      // Get user ID from the request
      const userId = getUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const { crawlId } = req.query;
      
      if (!crawlId || isNaN(parseInt(crawlId as string))) {
        return res.status(400).json({ message: "Invalid or missing crawl ID" });
      }
      
      // Get the crawl to verify ownership
      const parsedCrawlId = parseInt(crawlId as string);
      const crawl = await storage.getCrawl(parsedCrawlId);
      if (!crawl) {
        return res.status(404).json({ message: "Crawl not found" });
      }
      
      // Verify the crawl belongs to the authenticated user
      if (crawl.userId !== userId) {
        return res.status(403).json({ message: "You don't have permission to access pages from this crawl" });
      }

      const pages = await storage.getPagesByCrawlId(parseInt(crawlId as string));
      return res.status(200).json(pages);
    } catch (error) {
      console.error("Error fetching pages:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Asset routes
  app.get("/api/assets/:crawlId/:path(*)", isAuthenticated, async (req: Request, res: Response) => {
    try {
      // Get user ID from the request
      const userId = getUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
    
      const crawlId = parseInt(req.params.crawlId);
      let assetPath = req.params.path;
      
      if (isNaN(crawlId)) {
        return res.status(400).json({ message: "Invalid crawl ID" });
      }
      
      // Get the crawl to verify ownership
      const crawl = await storage.getCrawl(crawlId);
      if (!crawl) {
        return res.status(404).json({ message: "Crawl not found" });
      }
      
      // Verify the crawl belongs to the authenticated user
      if (crawl.userId !== userId) {
        return res.status(403).json({ message: "You don't have permission to access assets from this crawl" });
      }
      
      // Fix duplicated API paths recursively - handle multiple levels of duplication
      const apiPathPrefix = `api/assets/${crawlId}/`;
      while (assetPath.startsWith(apiPathPrefix)) {
        assetPath = assetPath.substring(apiPathPrefix.length);
        console.log(`Fixed duplicated API path, new path: ${assetPath}`);
      }

      console.log(`Looking for asset with crawlId: ${crawlId}, path: ${assetPath}`);
      
      // Try to find the asset directly
      let asset = await storage.getAssetByPath(crawlId, assetPath);
      
      // If asset not found, try again with 'assets/' prefix if it's not already there
      if (!asset && !assetPath.startsWith('assets/')) {
        const altPath = `assets/${assetPath}`;
        console.log(`Asset not found, trying with assets/ prefix: ${altPath}`);
        asset = await storage.getAssetByPath(crawlId, altPath);
      }
      
      // If still not found, try with various variations
      if (!asset) {
        // Try without any prefix 
        const pathParts = assetPath.split('/');
        if (pathParts.length > 1) {
          const cleanPath = pathParts[pathParts.length - 1];
          console.log(`Asset not found, trying with just the filename: ${cleanPath}`);
          asset = await storage.getAssetByPath(crawlId, cleanPath);
        }
      }

      if (!asset) {
        console.log(`Asset not found for path: ${assetPath}`);
        return res.status(404).json({ message: "Asset not found" });
      }

      console.log(`Asset found: ${asset.url}`);

      // Set the appropriate content type based on asset type or file extension
      if (asset.type === "image") {
        // Determine more specific image type based on extension
        const fileExt = asset.path.split('.').pop()?.toLowerCase();
        switch (fileExt) {
          case 'jpg':
          case 'jpeg':
            res.setHeader("Content-Type", "image/jpeg");
            break;
          case 'png':
            res.setHeader("Content-Type", "image/png");
            break;
          case 'gif':
            res.setHeader("Content-Type", "image/gif");
            break;
          case 'svg':
            res.setHeader("Content-Type", "image/svg+xml");
            break;
          case 'webp':
            res.setHeader("Content-Type", "image/webp");
            break;
          case 'ico':
            res.setHeader("Content-Type", "image/x-icon");
            break;
          default:
            res.setHeader("Content-Type", "image/jpeg"); // Default fallback
        }
      } else if (asset.type === "css") {
        res.setHeader("Content-Type", "text/css");
      } else if (asset.type === "js") {
        res.setHeader("Content-Type", "application/javascript");
      } else {
        // For other types, try to guess from extension
        const fileExt = asset.path.split('.').pop()?.toLowerCase();
        switch (fileExt) {
          case 'json':
            res.setHeader("Content-Type", "application/json");
            break;
          case 'xml':
            res.setHeader("Content-Type", "application/xml");
            break;
          case 'html':
          case 'htm':
            res.setHeader("Content-Type", "text/html");
            break;
          case 'txt':
            res.setHeader("Content-Type", "text/plain");
            break;
          case 'pdf':
            res.setHeader("Content-Type", "application/pdf");
            break;
          case 'woff':
            res.setHeader("Content-Type", "font/woff");
            break;
          case 'woff2':
            res.setHeader("Content-Type", "font/woff2");
            break;
          case 'ttf':
            res.setHeader("Content-Type", "font/ttf");
            break;
        }
      }

      // For base64-encoded images, decode before sending
      if (asset.type === "image" && asset.content.startsWith("data:image")) {
        // Already in data URI format, send as is
        return res.status(200).send(asset.content);
      } else if (asset.type === "image" && !asset.content.includes("data:image")) {
        // Plain base64, reconstruct data URI
        try {
          // Try to decode base64 content (make sure it's a string)
          const buffer = Buffer.from(asset.content, 'base64');
          return res.status(200).send(buffer);
        } catch (error) {
          console.error("Error decoding image content:", error);
          return res.status(200).send(asset.content); // Send as is if decoding fails
        }
      } else {
        // For non-image content
        return res.status(200).send(asset.content);
      }
    } catch (error) {
      console.error("Error fetching asset:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Saved sites routes
  app.post("/api/sites/save", isAuthenticated, async (req: Request, res: Response) => {
    try {
      // Get user ID from the request
      const userId = getUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      // Parse the crawlId as a number since it might come as a string from the client
      let { crawlId, name } = req.body;
      crawlId = parseInt(crawlId, 10);
      
      if (isNaN(crawlId)) {
        return res.status(400).json({ message: "Invalid crawlId, must be a number" });
      }

      const crawl = await storage.getCrawl(crawlId);
      if (!crawl) {
        return res.status(404).json({ message: "Crawl not found" });
      }
      
      // Verify the crawl belongs to the authenticated user
      if (crawl.userId !== userId) {
        return res.status(403).json({ message: "You don't have permission to save this crawl" });
      }

      const pages = await storage.getPagesByCrawlId(crawlId);
      const assets = await storage.getAssetsByCrawlId(crawlId);
      
      // Calculate the total size (in bytes, converted to MB)
      const totalSizeBytes = 
        pages.reduce((sum, page) => sum + page.content.length, 0) +
        assets.reduce((sum, asset) => sum + asset.content.length, 0);
      const totalSizeMB = Math.round(totalSizeBytes / (1024 * 1024));

      const savedSite = await storage.createSavedSite({
        userId,
        crawlId,
        url: crawl.url,
        name: name || crawl.url,
        pageCount: pages.length,
        size: totalSizeMB
      });

      return res.status(201).json(savedSite);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.message });
      }
      console.error("Error saving site:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/sites/saved", isAuthenticated, async (req: Request, res: Response) => {
    try {
      // Get user ID from the request
      const userId = getUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const savedSites = await storage.getSavedSites(userId);
      return res.status(200).json(savedSites);
    } catch (error) {
      console.error("Error fetching saved sites:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/sites/saved/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      // Get user ID from the request
      const userId = getUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid saved site ID" });
      }

      // Get the saved site to check ownership
      const savedSite = await storage.getSavedSite(id);
      if (!savedSite) {
        return res.status(404).json({ message: "Saved site not found" });
      }

      // Verify ownership
      if (savedSite.userId !== userId) {
        return res.status(403).json({ message: "You don't have permission to delete this saved site" });
      }

      const success = await storage.deleteSavedSite(id);
      if (!success) {
        return res.status(404).json({ message: "Saved site not found" });
      }

      return res.status(204).end();
    } catch (error) {
      console.error("Error deleting saved site:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Preview routes
  app.get("/api/preview/:crawlId/:path(*)", isAuthenticated, async (req: Request, res: Response) => {
    try {
      // Get user ID from the request
      const userId = getUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
    
      const crawlId = parseInt(req.params.crawlId);
      let pagePath = req.params.path || "index.html";
      
      if (isNaN(crawlId)) {
        return res.status(400).json({ message: "Invalid crawl ID" });
      }
      
      // Get the crawl to verify ownership
      const crawl = await storage.getCrawl(crawlId);
      if (!crawl) {
        return res.status(404).json({ message: "Crawl not found" });
      }
      
      // Verify the crawl belongs to the authenticated user
      if (crawl.userId !== userId) {
        return res.status(403).json({ message: "You don't have permission to preview this crawl" });
      }
      
      // Fix duplicated API paths recursively - handle multiple levels of duplication
      const apiPathPrefix = `api/preview/${crawlId}/`;
      while (pagePath.startsWith(apiPathPrefix)) {
        pagePath = pagePath.substring(apiPathPrefix.length);
        console.log(`Fixed duplicated API path, new path: ${pagePath}`);
      }

      console.log(`Looking for page with crawlId: ${crawlId}, path: ${pagePath}`);
      
      // If we're requesting a directory path ending with /, append index.html
      if (pagePath.endsWith('/')) {
        pagePath += 'index.html';
      }
      
      // If there's no extension, assume it's a directory and look for index.html
      if (!pagePath.includes('.')) {
        pagePath = `${pagePath}/index.html`;
      }

      // Try to get the page
      const page = await storage.getPageByPath(crawlId, pagePath);
      
      if (!page) {
        console.log(`Page not found at path: ${pagePath}. Trying alternative paths.`);
        
        // If not found, try without index.html
        if (pagePath.endsWith('/index.html')) {
          const alternativePath = pagePath.substring(0, pagePath.length - 11);
          const alternativePage = await storage.getPageByPath(crawlId, alternativePath);
          
          if (alternativePage) {
            console.log(`Found page at alternative path: ${alternativePath}`);
            return res.status(200).send(alternativePage.content);
          }
        }
        
        return res.status(404).json({ 
          message: "Page not found", 
          requestedPath: pagePath 
        });
      }

      // Set content type based on the file extension
      if (pagePath.endsWith(".html") || pagePath.endsWith(".htm")) {
        res.setHeader("Content-Type", "text/html");
        
        // For HTML content, update resource paths to use our API endpoints
        let content = page.content;
        
        // First, clean up any duplicate asset or preview paths that might already exist
        const assetPathPattern = new RegExp(`/api/assets/${crawlId}/api/assets/${crawlId}/`, 'g');
        const previewAssetPathPattern = new RegExp(`/api/preview/${crawlId}/api/assets/${crawlId}/`, 'g');
        const previewPathPattern = new RegExp(`/api/preview/${crawlId}/preview/${crawlId}`, 'g');
        
        if (content.includes(`/api/assets/${crawlId}/api/assets/${crawlId}/`)) {
          console.log(`Found duplicate asset paths, cleaning them up`);
          content = content.replace(assetPathPattern, `/api/assets/${crawlId}/`);
        }
        
        if (content.includes(`/api/preview/${crawlId}/api/assets/${crawlId}/`)) {
          console.log(`Found preview-asset path mix, cleaning them up`);
          content = content.replace(previewAssetPathPattern, `/api/assets/${crawlId}/`);
        }
        
        if (content.includes(`/api/preview/${crawlId}/preview/${crawlId}`)) {
          console.log(`Found duplicate preview paths, cleaning them up`);
          content = content.replace(previewPathPattern, `/api/preview/${crawlId}`);
        }
        
        // Get the crawl to extract original URL for path correction
        const crawl = await storage.getCrawl(crawlId);
        if (!crawl) {
          return res.status(404).json({ message: "Crawl not found" });
        }
        
        // Parse the URL to get the domain and path
        // Ensure URL has proper protocol for parsing
        let baseUrl = '';
        try {
          // Make sure the URL has a valid protocol
          let urlForParsing = crawl.url;
          if (!urlForParsing.match(/^https?:\/\//)) {
            urlForParsing = 'https://' + urlForParsing;
          }
          const originalUrlObj = new URL(urlForParsing);
          baseUrl = `${originalUrlObj.protocol}//${originalUrlObj.host}`;
          console.log(`Successfully parsed URL: ${baseUrl} from ${crawl.url}`);
        } catch (error) {
          console.error(`Error parsing URL ${crawl.url}:`, error);
          // Use a fallback approach for the baseUrl
          // Extract domain from URL more robustly
          if (crawl.url) {
            // Try to extract domain by removing protocol and path
            const domainMatch = crawl.url.match(/^(?:https?:\/\/)?(?:www\.)?([^\/]+)/i);
            if (domainMatch && domainMatch[1]) {
              baseUrl = `https://${domainMatch[1]}`;
            } else {
              // Last resort fallback
              baseUrl = '';
            }
          } else {
            baseUrl = '';
          }
          console.log(`Using fallback baseUrl: ${baseUrl}`);
        }
        
        // Rewrite resource URLs in the HTML content to use our API endpoints
        
        // 1. Rewrite relative CSS urls (href="styles.css" -> href="/api/assets/{crawlId}/styles.css")
        content = content.replace(
          /(href=['"])(?!http|\/\/|data:|#|\/api\/assets\/|\/)([^'"]+\.css)(['"])/gi,
          `$1/api/assets/${crawlId}/$2$3`
        );
        
        // 2. Rewrite absolute CSS urls that match the original domain 
        // (href="https://example.com/styles.css" -> href="/api/assets/{crawlId}/styles.css")
        if (baseUrl) {
          const escapedBaseUrl = baseUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          content = content.replace(
            new RegExp(`(href=['"])(${escapedBaseUrl})?/([^'"]+\\.css)(['"])`, 'gi'),
            `$1/api/assets/${crawlId}/$3$4`
          );
        }
        
        // 3. Rewrite relative JS urls
        content = content.replace(
          /(src=['"])(?!http|\/\/|data:|#|\/api\/assets\/|\/)([^'"]+\.js)(['"])/gi,
          `$1/api/assets/${crawlId}/$2$3`
        );
        
        // 4. Rewrite absolute JS urls that match the original domain
        if (baseUrl) {
          const escapedBaseUrl = baseUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          content = content.replace(
            new RegExp(`(src=['"])(${escapedBaseUrl})?/([^'"]+\\.js)(['"])`, 'gi'),
            `$1/api/assets/${crawlId}/$3$4`
          );
        }
        
        // 5. Rewrite relative image urls
        content = content.replace(
          /(src=['"])(?!http|\/\/|data:|#|\/api\/assets\/|\/)([^'"]+\.(jpg|jpeg|png|gif|svg|webp|ico))(['"])/gi,
          `$1/api/assets/${crawlId}/$2$4`
        );
        
        // 6. Rewrite absolute image urls that match the original domain
        if (baseUrl) {
          const escapedBaseUrl = baseUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          content = content.replace(
            new RegExp(`(src=['"])(${escapedBaseUrl})?/([^'"]+\\.(jpg|jpeg|png|gif|svg|webp|ico))(['"])`, 'gi'),
            `$1/api/assets/${crawlId}/$3$5`
          );
        }
        
        // 7. Rewrite image urls in srcset attributes
        content = content.replace(
          /(srcset=['"])([^'"]+)(['"])/gi,
          (match, p1, srcset, p3) => {
            const newSrcset = srcset.split(',').map((src: string) => {
              const parts = src.trim().split(/\s+/);
              const url = parts[0];
              const descriptor = parts.slice(1).join(' ');
              
              if (url.startsWith('http')) {
                // If baseUrl is empty, or it's an external URL
                if (!baseUrl || !url.startsWith(baseUrl)) {
                  // External URL, leave as is
                  return `${url} ${descriptor || ''}`.trim();
                }
              } else if (url.startsWith('/')) {
                // Absolute path
                return `/api/assets/${crawlId}/${url.slice(1)} ${descriptor || ''}`.trim();
              } else if (!url.startsWith('data:')) {
                // Relative path
                return `/api/assets/${crawlId}/${url} ${descriptor || ''}`.trim();
              }
              return src.trim();
            }).join(', ');
            
            return `${p1}${newSrcset}${p3}`;
          }
        );
        
        // 8. Rewrite background image urls in inline styles
        content = content.replace(
          /(background(-image)?:[\s]*url\(['"]?)(?!http|\/\/|data:|#|\/api\/assets\/|\/)([^'")]+)(['"]?\))/gi,
          `$1/api/assets/${crawlId}/$3$4`
        );
        
        // 9. Rewrite internal links to use our preview API
        content = content.replace(
          /(href=['"])(?!http|\/\/|data:|#|mailto:|tel:|\/api\/preview\/)([^'"]+)(['"])/gi,
          (match: string, p1: string, path: string, p3: string) => {
            // Skip CSS files as they're handled separately
            if (path.endsWith('.css')) return match;
            
            // Clean the path - remove leading slash if present
            const cleanPath = path.startsWith('/') ? path.slice(1) : path;
            
            return `${p1}/api/preview/${crawlId}/${cleanPath}${p3}`;
          }
        );
        
        // 10. Rewrite absolute internal links to use our preview API
        if (baseUrl) {
          const escapedBaseUrl = baseUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          content = content.replace(
            new RegExp(`(href=['"])(${escapedBaseUrl})(/[^'"]+)(['"])`, 'gi'),
            (match: string, p1: string, domain: string, path: string, p4: string) => {
              // Skip CSS files 
              if (path.endsWith('.css')) return match;
              
              // Clean the path - remove leading slash if present
              const cleanPath = path.startsWith('/') ? path.slice(1) : path;
              
              return `${p1}/api/preview/${crawlId}/${cleanPath}${p4}`;
            }
          );
        }
        
        // Inject a base tag to help with relative paths 
        if (!content.includes('<base ')) {
          content = content.replace(
            '<head>',
            `<head>\n<base href="/api/preview/${crawlId}/">`
          );
        }
        
        // Final cleanup to catch any duplicated paths that might have been introduced
        const finalAssetCleanupPattern = new RegExp(`/api/assets/${crawlId}/api/assets/${crawlId}/`, 'g');
        const finalPreviewAssetCleanupPattern = new RegExp(`/api/preview/${crawlId}/api/assets/${crawlId}/`, 'g');
        const finalPreviewCleanupPattern = new RegExp(`/api/preview/${crawlId}/preview/${crawlId}`, 'g');
        
        if (content.includes(`/api/assets/${crawlId}/api/assets/${crawlId}/`)) {
          console.log(`Performing final cleanup of duplicate asset paths`);
          while (content.includes(`/api/assets/${crawlId}/api/assets/${crawlId}/`)) {
            content = content.replace(finalAssetCleanupPattern, `/api/assets/${crawlId}/`);
          }
        }
        
        if (content.includes(`/api/preview/${crawlId}/api/assets/${crawlId}/`)) {
          console.log(`Performing final cleanup of preview-asset path mix`);
          while (content.includes(`/api/preview/${crawlId}/api/assets/${crawlId}/`)) {
            content = content.replace(finalPreviewAssetCleanupPattern, `/api/assets/${crawlId}/`);
          }
        }
        
        if (content.includes(`/api/preview/${crawlId}/preview/${crawlId}`)) {
          console.log(`Performing final cleanup of duplicate preview paths`);
          while (content.includes(`/api/preview/${crawlId}/preview/${crawlId}`)) {
            content = content.replace(finalPreviewCleanupPattern, `/api/preview/${crawlId}`);
          }
        }
        
        console.log(`Serving rewritten preview for ${pagePath}`);
        return res.status(200).send(content);
      } else if (pagePath.endsWith(".css")) {
        res.setHeader("Content-Type", "text/css");
        
        // For CSS content, rewrite urls inside the CSS
        let content = page.content;
        
        // Get the crawl to extract original URL for path correction
        const crawl = await storage.getCrawl(crawlId);
        if (!crawl) {
          return res.status(404).json({ message: "Crawl not found" });
        }
        
        // Rewrite url() references in CSS
        content = content.replace(
          /url\(['"]?(?!data:|http|\/\/|\/api\/assets\/)([^'")]+)['"]?\)/gi,
          `url('/api/assets/${crawlId}/$1')`
        );
        
        // Rewrite absolute URLs that reference the original domain
        // Ensure URL has proper protocol for parsing
        let baseUrl = '';
        try {
          // Make sure the URL has a valid protocol
          let urlForParsing = crawl.url;
          if (!urlForParsing.match(/^https?:\/\//)) {
            urlForParsing = 'https://' + urlForParsing;
          }
          const originalUrlObj = new URL(urlForParsing);
          baseUrl = `${originalUrlObj.protocol}//${originalUrlObj.host}`;
          console.log(`Successfully parsed URL in CSS handler: ${baseUrl} from ${crawl.url}`);
        } catch (error) {
          console.error(`Error parsing URL in CSS handler ${crawl.url}:`, error);
          // Use a fallback approach for the baseUrl
          // Extract domain from URL more robustly
          if (crawl.url) {
            // Try to extract domain by removing protocol and path
            const domainMatch = crawl.url.match(/^(?:https?:\/\/)?(?:www\.)?([^\/]+)/i);
            if (domainMatch && domainMatch[1]) {
              baseUrl = `https://${domainMatch[1]}`;
            } else {
              // Last resort fallback
              baseUrl = '';
            }
          } else {
            baseUrl = '';
          }
          console.log(`Using fallback baseUrl in CSS handler: ${baseUrl}`);
        }
        
        if (baseUrl) {
          const escapedBaseUrl = baseUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          content = content.replace(
            new RegExp(`url\\(['"](${escapedBaseUrl})?/([^'"\\)]+)['"\\)]`, 'gi'),
            `url('/api/assets/${crawlId}/$2')`
          );
        }
        
        // Final cleanup for any duplicated asset paths in CSS
        const cssAssetCleanupPattern = new RegExp(`/api/assets/${crawlId}/api/assets/${crawlId}/`, 'g');
        const cssPreviewAssetCleanupPattern = new RegExp(`/api/preview/${crawlId}/api/assets/${crawlId}/`, 'g');
        
        if (content.includes(`/api/assets/${crawlId}/api/assets/${crawlId}/`)) {
          console.log(`Performing final cleanup of duplicate asset paths in CSS`);
          while (content.includes(`/api/assets/${crawlId}/api/assets/${crawlId}/`)) {
            content = content.replace(cssAssetCleanupPattern, `/api/assets/${crawlId}/`);
          }
        }
        
        if (content.includes(`/api/preview/${crawlId}/api/assets/${crawlId}/`)) {
          console.log(`Performing final cleanup of preview-asset path mix in CSS`);
          while (content.includes(`/api/preview/${crawlId}/api/assets/${crawlId}/`)) {
            content = content.replace(cssPreviewAssetCleanupPattern, `/api/assets/${crawlId}/`);
          }
        }
        
        console.log(`Serving rewritten CSS for ${pagePath}`);
        return res.status(200).send(content);
      } else if (pagePath.endsWith(".js")) {
        res.setHeader("Content-Type", "application/javascript");
        console.log(`Serving JavaScript for ${pagePath}`);
        return res.status(200).send(page.content);
      } else {
        // Other content types
        const extension = pagePath.split('.').pop()?.toLowerCase();
        switch (extension) {
          case 'json':
            res.setHeader("Content-Type", "application/json");
            break;
          case 'xml':
            res.setHeader("Content-Type", "application/xml");
            break;
          case 'txt':
            res.setHeader("Content-Type", "text/plain");
            break;
          case 'svg':
            res.setHeader("Content-Type", "image/svg+xml");
            break;
        }
        
        console.log(`Serving ${extension} file for ${pagePath}`);
        return res.status(200).send(page.content);
      }
    } catch (error) {
      console.error("Error serving preview:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Site structure routes
  app.get("/api/structure/:crawlId", isAuthenticated, async (req: Request, res: Response) => {
    try {
      // Get user ID from the request
      const userId = getUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
    
      const crawlId = parseInt(req.params.crawlId);
      
      if (isNaN(crawlId)) {
        return res.status(400).json({ message: "Invalid crawl ID" });
      }
      
      // Get the crawl to verify ownership
      const crawl = await storage.getCrawl(crawlId);
      if (!crawl) {
        return res.status(404).json({ message: "Crawl not found" });
      }
      
      // Verify the crawl belongs to the authenticated user
      if (crawl.userId !== userId) {
        return res.status(403).json({ message: "You don't have permission to access structure for this crawl" });
      }

      const pages = await storage.getPagesByCrawlId(crawlId);
      const assets = await storage.getAssetsByCrawlId(crawlId);
      
      // Build directory structure
      const structure: any = {};
      
      console.log(`Found ${pages.length} pages for crawl ID ${crawlId}`);
      
      // Add pages to structure
      for (const page of pages) {
        const parts = page.path.split('/');
        let current = structure;
        
        for (let i = 0; i < parts.length; i++) {
          const part = parts[i];
          if (i === parts.length - 1) {
            // This is a file
            current[part] = { type: 'file', path: page.path };
          } else {
            // This is a directory
            if (!current[part]) {
              current[part] = {};
            }
            current = current[part];
          }
        }
      }
      
      // Add assets to structure
      for (const asset of assets) {
        const parts = asset.path.split('/');
        let current = structure;
        
        for (let i = 0; i < parts.length; i++) {
          const part = parts[i];
          if (i === parts.length - 1) {
            // This is a file
            current[part] = { type: 'file', path: asset.path, assetType: asset.type };
          } else {
            // This is a directory
            if (!current[part]) {
              current[part] = {};
            }
            current = current[part];
          }
        }
      }

      return res.status(200).json(structure);
    } catch (error) {
      console.error("Error fetching site structure:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Download routes
  app.get("/api/sites/download/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      // Get user ID from the request
      const userId = getUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
    
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid crawl ID" });
      }

      // Check if we're filtering by asset type
      const assetType = req.query.type as string | undefined;
      
      // Check if this is a saved site ID first
      const savedSite = await storage.getSavedSite(id);
      let crawl;
      let crawlId;
      
      if (savedSite) {
        // Verify the saved site belongs to the authenticated user
        if (savedSite.userId !== userId) {
          return res.status(403).json({ message: "You don't have permission to download this saved site" });
        }
        
        // Use the crawl ID from the saved site
        crawlId = savedSite.crawlId;
        crawl = await storage.getCrawl(crawlId);
        if (!crawl) {
          return res.status(404).json({ message: "Crawl not found for saved site" });
        }
        
        console.log(`Using crawlId ${crawlId} from savedSite ${id}`);
      } else {
        // Try to get the crawl directly
        crawlId = id;
        crawl = await storage.getCrawl(id);
        
        if (!crawl) {
          return res.status(404).json({ message: "Crawl or saved site not found" });
        }
        
        // Verify the crawl belongs to the authenticated user
        if (crawl.userId !== userId) {
          return res.status(403).json({ message: "You don't have permission to download this crawl" });
        }
      }

      // Get all pages for this crawl
      const pages = await storage.getPagesByCrawlId(crawlId);
      
      // Get assets, potentially filtered by type
      let assets = await storage.getAssetsByCrawlId(crawlId);
      
      // Filter assets by type if requested
      if (assetType) {
        assets = assets.filter(asset => asset.type === assetType);
      }

      // Get site URL from crawl or from a page
      const siteUrl = crawl ? crawl.url : (pages.length > 0 ? new URL(pages[0].url).hostname : 'site');
      
      // Create zip file
      const zip = new JSZip();
      
      // Add an info.html file with basic information
      const typeTitle = assetType 
        ? `${assetType.charAt(0).toUpperCase() + assetType.slice(1)} Files` 
        : 'Complete Site';
      
      let infoHtml = `<!DOCTYPE html>
      <html>
      <head>
        <title>Downloaded ${typeTitle}: ${siteUrl}</title>
        <style>
          body { font-family: sans-serif; padding: 20px; }
          h1 { color: #2563eb; }
          ul { list-style-type: none; padding: 0; }
          li { margin: 8px 0; padding: 8px; border-bottom: 1px solid #eee; }
          .asset-type { display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 12px; margin-right: 8px; }
          .css { background: #e6f2ff; color: #0066cc; }
          .js { background: #fff9e6; color: #cc9900; }
          .image { background: #e6ffec; color: #00994d; }
          .other { background: #f2f2f2; color: #666666; }
        </style>
      </head>
      <body>
        <h1>Downloaded ${typeTitle}: ${siteUrl}</h1>
        ${!assetType ? `<h2>Pages (${pages.length})</h2>
        <ul>
          ${pages.map(page => `<li>${page.path}</li>`).join('')}
        </ul>` : ''}
        <h2>Assets (${assets.length})</h2>
        <ul>
          ${assets.map(asset => `
            <li>
              <span class="asset-type ${asset.type}">${asset.type}</span>
              ${asset.path}
            </li>`).join('')}
        </ul>
      </body>
      </html>`;
      
      // Add info.html to the zip
      zip.file("info.html", infoHtml);
      
      // Create folders for different asset types - JSZip.folder() should never return null with valid inputs
      // Using non-null assertion to tell TypeScript these will always exist
      const pagesFolder = zip.folder("pages")!;
      const cssFolder = zip.folder("css")!;
      const jsFolder = zip.folder("js")!;
      const imagesFolder = zip.folder("images")!;
      const otherFolder = zip.folder("other")!;
      
      // Add HTML pages to the zip
      if (!assetType) {
        for (const page of pages) {
          // Clean up path for folder structure
          const pagePath = page.path.replace(/^\//, ''); // Remove leading slash
          pagesFolder.file(pagePath || "index.html", page.content);
        }
      }
      
      // Add assets to the zip based on their type
      for (const asset of assets) {
        // Clean up path for folder structure
        const assetPath = asset.path.replace(/^\//, ''); // Remove leading slash
        const fileName = assetPath.split('/').pop() || 'file';
        
        // Skip assets without content
        if (!asset.content) {
          console.log(`Skipping asset without content: ${assetPath}`);
          continue;
        }
        
        // Handle different asset types properly
        try {
          switch (asset.type) {
            case 'css':
              cssFolder.file(fileName, asset.content);
              break;
            case 'js':
              jsFolder.file(fileName, asset.content);
              break;
            case 'image':
              // For images, content is stored as base64 string
              // JSZip accepts Buffer, base64 string, or Uint8Array directly
              imagesFolder.file(fileName, asset.content, { base64: true });
              break;
            default:
              otherFolder.file(fileName, asset.content);
          }
        } catch (error) {
          console.error(`Error adding file ${assetPath} to ZIP:`, error);
          // Continue to the next asset if there's an error
        }
      }
      
      try {
        // Generate the zip file
        const zipContent = await zip.generateAsync({ type: 'nodebuffer' });
        
        // Prepare file name for download
        const filename = assetType 
          ? `${siteUrl.replace(/[^a-z0-9]/gi, '_')}_${assetType}.zip` 
          : `${siteUrl.replace(/[^a-z0-9]/gi, '_')}.zip`;
        
        // Send the zip file as response
        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        return res.status(200).send(zipContent);
      } catch (zipError) {
        console.error("Error generating ZIP file:", zipError);
        
        // If ZIP generation fails, fall back to HTML download
        let html = `<!DOCTYPE html>
        <html>
        <head>
          <title>Downloaded ${typeTitle}: ${siteUrl}</title>
          <style>
            body { font-family: sans-serif; padding: 20px; }
            h1 { color: #2563eb; }
            ul { list-style-type: none; padding: 0; }
            li { margin: 8px 0; padding: 8px; border-bottom: 1px solid #eee; }
            .asset-type { display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 12px; margin-right: 8px; }
            .css { background: #e6f2ff; color: #0066cc; }
            .js { background: #fff9e6; color: #cc9900; }
            .image { background: #e6ffec; color: #00994d; }
            .other { background: #f2f2f2; color: #666666; }
          </style>
        </head>
        <body>
          <h1>Downloaded ${typeTitle}: ${siteUrl}</h1>
          <p>ZIP generation failed, showing file listing instead.</p>
          ${!assetType ? `<h2>Pages (${pages.length})</h2>
          <ul>
            ${pages.map(page => `<li>${page.path}</li>`).join('')}
          </ul>` : ''}
          <h2>Assets (${assets.length})</h2>
          <ul>
            ${assets.map(asset => `
              <li>
                <span class="asset-type ${asset.type}">${asset.type}</span>
                ${asset.path}
              </li>`).join('')}
          </ul>
        </body>
        </html>`;
  
        const filename = assetType 
          ? `${siteUrl.replace(/[^a-z0-9]/gi, '_')}_${assetType}.html` 
          : `${siteUrl.replace(/[^a-z0-9]/gi, '_')}.html`;
        
        res.setHeader('Content-Type', 'text/html');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        return res.status(200).send(html);
      }
    } catch (error: any) {
      console.error("Error downloading site:", error);
      return res.status(500).json({ 
        message: "Internal server error", 
        error: error?.message || "Unknown error" 
      });
    }
  });
  
  // Get Converted Sites Route
  app.get("/api/sites/converted", isAuthenticated, async (req: Request, res: Response) => {
    try {
      // Get user ID from the request
      const userId = getUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Get all converted sites for this user
      const convertedSites = await storage.getConvertedSites(userId);
      return res.status(200).json(convertedSites);
    } catch (error) {
      console.error("Error fetching converted sites:", error);
      return res.status(500).json({ 
        message: "Error fetching converted sites", 
        error: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });
  
  // Delete Converted Site Route
  app.delete("/api/sites/converted/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      // Get user ID from the request
      const userId = getUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }
      
      // Check if the converted site exists and belongs to the user
      const convertedSite = await storage.getConvertedSite(id);
      if (!convertedSite) {
        return res.status(404).json({ message: "Converted site not found" });
      }
      
      if (convertedSite.userId !== userId) {
        return res.status(403).json({ message: "You don't have permission to delete this converted site" });
      }
      
      // Delete the converted site
      await storage.deleteConvertedSite(id);
      
      return res.status(204).end();
    } catch (error) {
      console.error("Error deleting converted site:", error);
      return res.status(500).json({ 
        message: "Error deleting converted site", 
        error: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });

  // React Conversion Route
  app.get("/api/sites/convert/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      // Get user ID from the request
      const userId = getUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }

      // Check if this is a background conversion request
      const isBackgroundConversion = req.query.background === 'true';

      // Get the saved site or crawl
      const savedSite = await storage.getSavedSite(id);
      
      let crawlId: number;
      if (savedSite) {
        // Verify the site belongs to the authenticated user
        if (savedSite.userId !== userId) {
          return res.status(403).json({ message: "You don't have permission to convert this site" });
        }
        crawlId = savedSite.crawlId;
      } else {
        // Check if it's a direct crawl ID
        const crawl = await storage.getCrawl(id);
        if (!crawl) {
          return res.status(404).json({ message: "Site or crawl not found" });
        }
        // Verify the crawl belongs to the authenticated user
        if (crawl.userId !== userId) {
          return res.status(403).json({ message: "You don't have permission to convert this crawl" });
        }
        crawlId = id;
      }
      
      // Get the crawl data to verify it's complete
      const crawl = await storage.getCrawl(crawlId);
      if (!crawl) {
        return res.status(404).json({ message: "Crawl data not found" });
      }
      
      // Ensure the crawl is complete
      if (crawl.status !== "completed") {
        return res.status(400).json({ 
          message: `Cannot convert crawl with status: ${crawl.status}. Crawl must be completed.` 
        });
      }
      
      // Check if a conversion already exists for this crawl
      const existingConversion = await storage.getConvertedSiteByCrawlId(crawlId);
      
      // If this is a background conversion request, start the conversion in the background
      if (isBackgroundConversion) {
        if (existingConversion) {
          // If a conversion already exists, return it immediately
          return res.status(200).json({
            message: "Conversion already exists",
            convertedSite: existingConversion
          });
        }

        // Create a placeholder converted site entry with in-progress status
        const siteName = savedSite ? savedSite.name : crawl.url.replace(/^https?:\/\//, '');
        const inProgressConversion = await storage.createConvertedSite({
          userId,
          crawlId,
          savedSiteId: savedSite ? savedSite.id : null,
          url: crawl.url,
          name: siteName,
          framework: "react",
          status: "in_progress", // Add a status field to the schema if needed
          pageCount: 0,
          componentCount: 0,
          size: 0
        });

        // Start the conversion process in the background
        (async () => {
          try {
            console.log(`Starting background conversion for crawl ID ${crawlId}...`);
            
            // Use the React converter to generate the React application
            const converter = new ReactConverter(storage);
            const zip = await converter.convertToReact(crawlId);
            
            // Get pages to calculate component count
            const pages = await storage.getPagesByCrawlId(crawlId);
            
            // Generate the ZIP file
            const zipBlob = await zip.generateAsync({ type: "nodebuffer" });
            const zipSize = zipBlob.length;
            
            // Update the converted site with complete information
            await storage.updateConvertedSite(inProgressConversion.id, {
              status: "completed",
              pageCount: pages.length,
              componentCount: pages.length + 4, // Pages plus Header, Footer, Layout, Navigation
              size: zipSize
            });
            
            console.log(`Background conversion for crawl ID ${crawlId} completed successfully.`);
          } catch (error) {
            console.error(`Error in background conversion for crawl ID ${crawlId}:`, error);
            // Update the converted site entry with error status
            await storage.updateConvertedSite(inProgressConversion.id, {
              status: "failed"
            });
          }
        })();

        // Return the in-progress conversion immediately
        return res.status(202).json({
          message: "Conversion started in background",
          convertedSite: inProgressConversion
        });
      }
      
      // If this is a direct download request (not background), handle synchronously
      console.log(`Converting crawl ID ${crawlId} to React application...`);
      
      // Use the React converter to generate the React application
      const converter = new ReactConverter(storage);
      const zip = await converter.convertToReact(crawlId);
      
      // Get pages to calculate component count
      const pages = await storage.getPagesByCrawlId(crawlId);
      
      // Generate the ZIP file
      const zipBlob = await zip.generateAsync({ type: "nodebuffer" });
      const zipSize = zipBlob.length;
      
      // Create a name for the converted site
      const siteName = savedSite ? savedSite.name : crawl.url.replace(/^https?:\/\//, '');
      
      if (!existingConversion) {
        // Save the conversion information to the database
        await storage.createConvertedSite({
          userId,
          crawlId,
          savedSiteId: savedSite ? savedSite.id : null,
          url: crawl.url,
          name: siteName,
          framework: "react",
          status: "completed",
          pageCount: pages.length,
          componentCount: pages.length + 4, // Pages plus Header, Footer, Layout, Navigation
          size: zipSize
        });
      }
      
      // Use the converter to create a filename
      // Set response headers
      res.setHeader('Content-Disposition', `attachment; filename="${crawl.url.replace(/^https?:\/\//, '').replace(/[^a-z0-9]/gi, '_')}_react.zip"`);
      res.setHeader('Content-Type', 'application/zip');
      
      // Send the ZIP file
      return res.send(zipBlob);
    } catch (error) {
      console.error("Error converting site to React:", error);
      return res.status(500).json({ 
        message: "Error generating React conversion", 
        error: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });

  // Authentication routes
  app.post('/api/auth/register', async (req: Request, res: Response) => {
    try {
      const userData = registerSchema.parse(req.body);

      const result = await registerUser(userData);
      
      // Log in the user automatically after registration
      req.login(result.user, (err) => {
        if (err) {
          console.error('Login error after registration:', err);
          return res.status(500).json({ message: 'Error logging in after registration' });
        }
        return res.status(201).json(result);
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.message });
      }
      console.error('Registration error:', error);
      return res.status(400).json({ 
        message: error instanceof Error ? error.message : 'Registration failed' 
      });
    }
  });

  app.post('/api/auth/login', (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate request data
      loginSchema.parse(req.body);
      
      passport.authenticate('local', (err: Error, user: any, info: { message: string }) => {
        if (err) {
          console.error('Login error:', err);
          return next(err);
        }
        
        if (!user) {
          return res.status(401).json({ 
            success: false,
            message: info.message || 'Invalid credentials' 
          });
        }
        
        req.login(user, (loginErr) => {
          if (loginErr) {
            console.error('Login error after authentication:', loginErr);
            return next(loginErr);
          }
          
          return res.status(200).json({ 
            success: true,
            user: {
              id: user.id,
              username: user.username,
              email: user.email,
              createdAt: user.createdAt || new Date().toISOString(),
              lastLogin: user.lastLogin
            } 
          });
        });
      })(req, res, next);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          success: false,
          message: error.message
        });
      }
      return res.status(400).json({ 
        success: false,
        message: error instanceof Error ? error.message : 'Login validation failed' 
      });
    }
  });

  app.post('/api/auth/logout', (req: Request, res: Response) => {
    req.logout((err) => {
      if (err) {
        console.error('Logout error:', err);
        return res.status(500).json({ message: 'Error during logout' });
      }
      req.session.destroy((err) => {
        if (err) {
          console.error('Session destruction error:', err);
          return res.status(500).json({ message: 'Error destroying session' });
        }
        res.clearCookie('connect.sid');
        return res.status(200).json({ message: 'Logged out successfully' });
      });
    });
  });

  app.get('/api/auth/user', (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(200).json({ user: null });
    }
    
    const user = req.user as any;
    return res.status(200).json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });
  });
  
  // Add alias route for /api/auth/me that matches the client API call
  app.get('/api/auth/me', (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(200).json(null);
    }
    
    const user = req.user as any;
    // Return the user object directly, not wrapped in a 'user' property
    return res.status(200).json({
      id: user.id,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt || new Date().toISOString(),
      lastLogin: user.lastLogin
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}
