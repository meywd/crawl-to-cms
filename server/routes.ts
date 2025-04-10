import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { WebCrawler } from "./crawler";
import { ReactConverter } from "./react-converter";
import { getPreviewServer } from "./preview-server";
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

// Helper function to build a file tree structure from a flat list of files
function buildFileTree(fileList: Array<{ path: string; size: number; type: string }>) {
  const root: Record<string, any> = { type: 'directory', name: '/', children: {} };
  
  for (const file of fileList) {
    const parts = file.path.split('/');
    let current = root;
    
    // Build the directory structure
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!part) continue; // Skip empty parts
      
      if (!current.children[part]) {
        current.children[part] = { type: 'directory', name: part, children: {} };
      }
      current = current.children[part];
    }
    
    // Add the file to the current directory
    const fileName = parts[parts.length - 1];
    if (fileName) {
      current.children[fileName] = {
        type: 'file',
        name: fileName,
        size: file.size,
        fileType: file.type,
        path: file.path
      };
    }
  }
  
  // Convert the nested objects to arrays for easier rendering
  function convertToArray(node: Record<string, any>) {
    if (node.type === 'directory') {
      const children = Object.values(node.children).map((child: any) => convertToArray(child));
      // Sort directories first, then files
      children.sort((a, b) => {
        if (a.type === b.type) return a.name.localeCompare(b.name);
        return a.type === 'directory' ? -1 : 1;
      });
      return { ...node, children };
    }
    return node;
  }
  
  return convertToArray(root).children;
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
  // API endpoint to preview a converted site's file structure
  app.get("/api/sites/preview/:id", isAuthenticated, async (req: Request, res: Response) => {
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
      
      // Check if this is a converted site ID first
      const convertedSite = await storage.getConvertedSite(id);
      
      // If this is a converted site
      if (convertedSite) {
        // Verify the converted site belongs to the authenticated user
        if (convertedSite.userId !== userId) {
          return res.status(403).json({ message: "You don't have permission to preview this converted site" });
        }
        
        // Check if the conversion is still in progress
        if (convertedSite.status === 'in_progress') {
          return res.status(202).json({ message: "Conversion is still in progress", status: "in_progress" });
        }
        
        // Check if the conversion failed
        if (convertedSite.status === 'failed') {
          return res.status(400).json({ message: "Conversion failed", error: convertedSite.error });
        }
        
        console.log(`Previewing converted site ${id} structure`);
        
        // Use the React converter to generate or fetch the React application structure
        const converter = new ReactConverter(storage);
        const zip = await converter.convertToReact(convertedSite.crawlId);
        
        // Get all file entries from the zip
        const fileList: { path: string; size: number; type: string }[] = [];
        
        // Process each file in the zip
        zip.forEach((relativePath, zipEntry) => {
          if (!zipEntry.dir) {
            // Determine the file type
            let type = "other";
            if (relativePath.endsWith(".js") || relativePath.endsWith(".jsx") || 
                relativePath.endsWith(".ts") || relativePath.endsWith(".tsx")) {
              type = "script";
            } else if (relativePath.endsWith(".css")) {
              type = "style";
            } else if (relativePath.endsWith(".html")) {
              type = "html";
            } else if (relativePath.endsWith(".json")) {
              type = "json";
            } else if (relativePath.match(/\.(jpg|jpeg|png|gif|svg|webp)$/i)) {
              type = "image";
            }
            
            fileList.push({
              path: relativePath,
              size: zipEntry._data ? zipEntry._data.uncompressedSize : 0,
              type
            });
          }
        });
        
        // Organize files into directory structure
        const fileTree = buildFileTree(fileList);
        
        // Return the file structure
        return res.json({
          name: convertedSite.name || "React Application",
          files: fileTree,
          totalFiles: fileList.length,
          totalSize: fileList.reduce((sum, file) => sum + file.size, 0)
        });
      } else {
        return res.status(404).json({ message: "Converted site not found" });
      }
    } catch (error) {
      console.error("Error previewing converted site:", error);
      res.status(500).json({ message: "Error previewing converted site", error: (error as Error).message });
    }
  });

  // API endpoint to get the content of a specific file in a converted site
  app.get("/api/sites/preview/:id/file", isAuthenticated, async (req: Request, res: Response) => {
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
      
      const filePath = req.query.path as string;
      if (!filePath) {
        return res.status(400).json({ message: "File path is required" });
      }
      
      // Check if this is a converted site ID first
      const convertedSite = await storage.getConvertedSite(id);
      
      // If this is a converted site
      if (convertedSite) {
        // Verify the converted site belongs to the authenticated user
        if (convertedSite.userId !== userId) {
          return res.status(403).json({ message: "You don't have permission to preview this converted site" });
        }
        
        console.log(`Retrieving file content for ${filePath} from converted site ${id}`);
        
        // Use the React converter to generate or fetch the React application
        const converter = new ReactConverter(storage);
        const zip = await converter.convertToReact(convertedSite.crawlId);
        
        // Get the content of the specific file
        const fileEntry = zip.file(filePath);
        if (!fileEntry) {
          return res.status(404).json({ message: "File not found in the converted site" });
        }
        
        // Get the file content as text or base64 for binary files
        const fileContent = await fileEntry.async('string');
        
        // Determine content type based on file extension
        const fileExtension = filePath.split('.').pop()?.toLowerCase();
        let contentType = 'text/plain';
        
        if (fileExtension === 'js' || fileExtension === 'jsx' || fileExtension === 'ts' || fileExtension === 'tsx') {
          contentType = 'application/javascript';
        } else if (fileExtension === 'html') {
          contentType = 'text/html';
        } else if (fileExtension === 'css') {
          contentType = 'text/css';
        } else if (fileExtension === 'json') {
          contentType = 'application/json';
        } else if (['jpg', 'jpeg', 'png', 'gif', 'svg'].includes(fileExtension || '')) {
          contentType = `image/${fileExtension}`;
        }
        
        // Return the file content with appropriate content type
        return res.json({
          path: filePath,
          content: fileContent,
          contentType
        });
      } else {
        return res.status(404).json({ message: "Converted site not found" });
      }
    } catch (error) {
      console.error("Error retrieving file content:", error);
      res.status(500).json({ message: "Error retrieving file content", error: (error as Error).message });
    }
  });

  app.get("/api/sites/download/:id", isAuthenticated, async (req: Request, res: Response) => {
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

      // Check if we're filtering by asset type
      const assetType = req.query.type as string | undefined;
      
      // Check if this is a converted site ID first
      const convertedSite = await storage.getConvertedSite(id);
      
      // If this is a converted site, download the React application
      if (convertedSite) {
        // Verify the converted site belongs to the authenticated user
        if (convertedSite.userId !== userId) {
          return res.status(403).json({ message: "You don't have permission to download this converted site" });
        }
        
        console.log(`Downloading converted site ${id} (React application)`);
        
        // Use the React converter to generate or fetch the React application
        const converter = new ReactConverter(storage);
        const zip = await converter.convertToReact(convertedSite.crawlId);
        
        // Generate the binary zip file data
        const zipContent = await zip.generateAsync({ type: 'nodebuffer' });
        
        // Prepare a safe filename
        const siteName = convertedSite.name || convertedSite.url || 'react-app';
        const cleanSiteName = siteName.replace(/^https?:\/\//, '');
        const safeFilename = cleanSiteName.replace(/[^a-z0-9]/gi, '_').toLowerCase() + '_react_app.zip';
        
        // Send the React application as a zip file
        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', `attachment; filename=${safeFilename}`);
        res.send(zipContent);
        return;
      }
      
      // If not a converted site, check if it's a saved site
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
          return res.status(404).json({ message: "Crawl, saved site, or converted site not found" });
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

      console.log(`Fetching converted sites for user ID: ${userId}`);
      
      // Debug authentication data
      console.log(`User info in request:`, req.user);
      console.log(`Is authenticated: ${req.isAuthenticated()}`);

      // Get all converted sites for this user
      const convertedSites = await storage.getConvertedSites(userId);
      console.log(`Found ${convertedSites.length} converted sites for user ${userId}`);
      
      // Debug first site if available
      if (convertedSites.length > 0) {
        console.log(`First site: userId=${convertedSites[0].userId}, id=${convertedSites[0].id}`);
      }
      
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

        // Create a placeholder converted site entry with started status
        const siteName = savedSite ? savedSite.name : crawl.url.replace(/^https?:\/\//, '');
        const inProgressConversion = await storage.createConvertedSite({
          userId,
          crawlId,
          savedSiteId: savedSite ? savedSite.id : null,
          url: crawl.url,
          name: siteName,
          framework: "react",
          status: "started", // Initial status is "started"
          progressPercent: 0,
          pageCount: 0,
          componentCount: 0,
          size: 0
        });

        // Start the conversion process in the background
        (async () => {
          try {
            console.log(`Starting background conversion for crawl ID ${crawlId}...`);
            
            // Update status to "processing" and progress to 10%
            await storage.updateConvertedSite(inProgressConversion.id, {
              status: "processing",
              progressPercent: 10
            });
            
            // Use the React converter to generate the React application
            const converter = new ReactConverter(storage);
            
            // Get pages and assets to calculate component count and report progress
            const pages = await storage.getPagesByCrawlId(crawlId);
            
            // Update to "in_progress" status and 30% progress
            await storage.updateConvertedSite(inProgressConversion.id, {
              status: "in_progress",
              progressPercent: 30,
              pageCount: pages.length
            });
            
            // Start the actual conversion (this can take some time)
            const zip = await converter.convertToReact(crawlId);
            
            // Update progress to 75%
            await storage.updateConvertedSite(inProgressConversion.id, {
              progressPercent: 75
            });
            
            // Generate the ZIP file
            const zipBlob = await zip.generateAsync({ type: "nodebuffer" });
            const zipSize = zipBlob.length;
            
            // Update progress to 90%
            await storage.updateConvertedSite(inProgressConversion.id, {
              progressPercent: 90
            });
            
            // Update the converted site with complete information
            await storage.updateConvertedSite(inProgressConversion.id, {
              status: "completed",
              progressPercent: 100,
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
          progressPercent: 100,
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
  
  // Debug route for authentication debugging
  app.get('/api/auth/debug', (req: Request, res: Response) => {
    // Print out details about the session
    console.log("Session:", req.session);
    console.log("isAuthenticated:", req.isAuthenticated());
    console.log("req.user:", req.user);
    
    return res.status(200).json({
      isAuthenticated: req.isAuthenticated(),
      session: req.session,
      user: req.user,
      sessionID: req.sessionID,
      cookies: req.cookies
    });
  });

  // Live Preview Routes
  
  // Initialize the preview server
  const previewServer = getPreviewServer(storage);
  
  // Mount the preview server middleware
  app.use(previewServer.getApp());
  
  // Extract a site for preview
  app.post("/api/sites/live-preview/:id/extract", isAuthenticated, async (req: Request, res: Response) => {
    try {
      // Get user ID from the request
      const userId = getUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid site ID" });
      }
      
      const convertedSite = await storage.getConvertedSite(id);
      if (!convertedSite) {
        return res.status(404).json({ message: "Converted site not found" });
      }
      
      // Verify the site belongs to the authenticated user
      if (convertedSite.userId !== userId) {
        return res.status(403).json({ message: "You don't have permission to preview this site" });
      }
      
      // Extract the site
      const siteDir = await previewServer.extractSite(id);
      
      return res.status(200).json({
        message: "Site extracted successfully",
        siteId: id.toString(),
        path: siteDir
      });
    } catch (error) {
      console.error("Error extracting site for preview:", error);
      return res.status(500).json({ message: `Internal server error: ${error instanceof Error ? error.message : String(error)}` });
    }
  });
  
  // Build a site for preview
  app.post("/api/sites/live-preview/:id/build", isAuthenticated, async (req: Request, res: Response) => {
    try {
      // Get user ID from the request
      const userId = getUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid site ID" });
      }
      
      const convertedSite = await storage.getConvertedSite(id);
      if (!convertedSite) {
        return res.status(404).json({ message: "Converted site not found" });
      }
      
      // Verify the site belongs to the authenticated user
      if (convertedSite.userId !== userId) {
        return res.status(403).json({ message: "You don't have permission to preview this site" });
      }
      
      // Start the build process (this runs asynchronously)
      previewServer.buildSite(id.toString()).catch(err => {
        console.error(`Error building site ${id}:`, err);
      });
      
      return res.status(200).json({
        message: "Build started",
        siteId: id.toString(),
        status: "building"
      });
    } catch (error) {
      console.error("Error building site for preview:", error);
      return res.status(500).json({ message: `Internal server error: ${error instanceof Error ? error.message : String(error)}` });
    }
  });
  
  // Get build status
  app.get("/api/sites/live-preview/:id/status", isAuthenticated, async (req: Request, res: Response) => {
    try {
      // Get user ID from the request
      const userId = getUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid site ID" });
      }
      
      const convertedSite = await storage.getConvertedSite(id);
      if (!convertedSite) {
        return res.status(404).json({ message: "Converted site not found" });
      }
      
      // Verify the site belongs to the authenticated user
      if (convertedSite.userId !== userId) {
        return res.status(403).json({ message: "You don't have permission to preview this site" });
      }
      
      // Get the build status (now includes error information)
      const buildStatus = previewServer.getBuildStatus(id.toString());
      
      // Get the preview URL if the build is complete
      const previewUrl = previewServer.getPreviewUrl(id.toString(), req);
      
      return res.status(200).json({
        siteId: id.toString(),
        status: buildStatus.status,
        error: buildStatus.error, // Include the error message from the build process
        previewUrl
      });
    } catch (error) {
      console.error("Error getting build status:", error);
      return res.status(500).json({ message: `Internal server error: ${error instanceof Error ? error.message : String(error)}` });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
