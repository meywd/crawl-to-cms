import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage_new";
import { WebCrawler } from "./crawler";
import { z } from "zod";
import fs from "fs";
import path from "path";
import { 
  crawlOptionsSchema, 
  insertCrawlSchema, 
  insertPageSchema,
  insertAssetSchema,
  insertSavedSiteSchema
} from "@shared/schema";

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
  app.post("/api/crawl", async (req: Request, res: Response) => {
    try {
      console.log("Starting crawl with data:", req.body);
      
      // Validate the request data
      const schema = insertCrawlSchema.extend({
        options: crawlOptionsSchema
      });
      
      let { url, depth, options } = schema.parse(req.body);
      
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
      const existingCrawl = await storage.getCrawlByUrl(normalizedUrl);
      
      if (existingCrawl && existingCrawl.status === "in_progress") {
        return res.status(409).json({ 
          message: `A crawl for ${url} is already in progress` 
        });
      }

      // Create a new crawl with the normalized URL
      const crawl = await storage.createCrawl({
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

  app.get("/api/crawl/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid crawl ID" });
      }

      const crawl = await storage.getCrawl(id);
      if (!crawl) {
        return res.status(404).json({ message: "Crawl not found" });
      }

      return res.status(200).json(crawl);
    } catch (error) {
      console.error("Error fetching crawl:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/crawl/:id/pause", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid crawl ID" });
      }

      const crawl = await storage.getCrawl(id);
      if (!crawl) {
        return res.status(404).json({ message: "Crawl not found" });
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

  app.post("/api/crawl/:id/resume", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid crawl ID" });
      }

      const crawl = await storage.getCrawl(id);
      if (!crawl) {
        return res.status(404).json({ message: "Crawl not found" });
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

  app.post("/api/crawl/:id/cancel", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid crawl ID" });
      }

      const crawl = await storage.getCrawl(id);
      if (!crawl) {
        return res.status(404).json({ message: "Crawl not found" });
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

  app.get("/api/crawl/history", async (req: Request, res: Response) => {
    try {
      console.log("Fetching crawl history");
      const crawls = await storage.getCrawlHistory();
      console.log("Crawl history results:", crawls);
      return res.status(200).json(crawls);
    } catch (error) {
      console.error("Error fetching crawl history:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Route to delete crawl history
  app.delete("/api/crawl/history/:id", async (req: Request, res: Response) => {
    try {
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
      
      await storage.updateCrawlStatus(id, "cancelled");
      return res.status(204).end();
    } catch (error) {
      console.error("Error deleting crawl:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Page routes
  app.get("/api/pages/:crawlId/:path(*)", async (req: Request, res: Response) => {
    try {
      const crawlId = parseInt(req.params.crawlId);
      const pagePath = req.params.path;
      
      if (isNaN(crawlId)) {
        return res.status(400).json({ message: "Invalid crawl ID" });
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

  app.get("/api/pages", async (req: Request, res: Response) => {
    try {
      const { crawlId } = req.query;
      
      if (!crawlId || isNaN(parseInt(crawlId as string))) {
        return res.status(400).json({ message: "Invalid or missing crawl ID" });
      }

      const pages = await storage.getPagesByCrawlId(parseInt(crawlId as string));
      return res.status(200).json(pages);
    } catch (error) {
      console.error("Error fetching pages:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Asset routes
  app.get("/api/assets/:crawlId/:path(*)", async (req: Request, res: Response) => {
    try {
      const crawlId = parseInt(req.params.crawlId);
      const assetPath = req.params.path;
      
      if (isNaN(crawlId)) {
        return res.status(400).json({ message: "Invalid crawl ID" });
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
  app.post("/api/sites/save", async (req: Request, res: Response) => {
    try {
      const { crawlId, name } = insertSavedSiteSchema.parse(req.body);

      const crawl = await storage.getCrawl(crawlId);
      if (!crawl) {
        return res.status(404).json({ message: "Crawl not found" });
      }

      const pages = await storage.getPagesByCrawlId(crawlId);
      const assets = await storage.getAssetsByCrawlId(crawlId);
      
      // Calculate the total size (in bytes, converted to MB)
      const totalSizeBytes = 
        pages.reduce((sum, page) => sum + page.content.length, 0) +
        assets.reduce((sum, asset) => sum + asset.content.length, 0);
      const totalSizeMB = Math.round(totalSizeBytes / (1024 * 1024));

      const savedSite = await storage.createSavedSite({
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

  app.get("/api/sites/saved", async (req: Request, res: Response) => {
    try {
      const savedSites = await storage.getSavedSites();
      return res.status(200).json(savedSites);
    } catch (error) {
      console.error("Error fetching saved sites:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/sites/saved/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid saved site ID" });
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
  app.get("/api/preview/:crawlId/:path(*)", async (req: Request, res: Response) => {
    try {
      const crawlId = parseInt(req.params.crawlId);
      let pagePath = req.params.path || "index.html";
      
      if (isNaN(crawlId)) {
        return res.status(400).json({ message: "Invalid crawl ID" });
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
          /(href=['"])(?!http|\/\/|data:|#|\/)([^'"]+\.css)(['"])/gi,
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
          /(src=['"])(?!http|\/\/|data:|#|\/)([^'"]+\.js)(['"])/gi,
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
          /(src=['"])(?!http|\/\/|data:|#|\/)([^'"]+\.(jpg|jpeg|png|gif|svg|webp|ico))(['"])/gi,
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
          /(background(-image)?:[\s]*url\(['"]?)(?!http|\/\/|data:|#|\/)([^'")]+)(['"]?\))/gi,
          `$1/api/assets/${crawlId}/$3$4`
        );
        
        // 9. Rewrite internal links to use our preview API
        content = content.replace(
          /(href=['"])(?!http|\/\/|data:|#|mailto:|tel:)([^'"]+)(['"])/gi,
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
          /url\(['"]?(?!data:|http|\/\/)([^'")]+)['"]?\)/gi,
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
  app.get("/api/structure/:crawlId", async (req: Request, res: Response) => {
    try {
      const crawlId = parseInt(req.params.crawlId);
      
      if (isNaN(crawlId)) {
        return res.status(400).json({ message: "Invalid crawl ID" });
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
  app.get("/api/sites/download/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid saved site ID" });
      }

      const savedSite = await storage.getSavedSite(id);
      if (!savedSite) {
        return res.status(404).json({ message: "Saved site not found" });
      }

      // Get all pages and assets for this crawl
      const pages = await storage.getPagesByCrawlId(savedSite.crawlId);
      const assets = await storage.getAssetsByCrawlId(savedSite.crawlId);

      // This would normally generate a zip file with all content
      // For this demo, we'll just return a simple HTML listing
      let html = `<!DOCTYPE html>
      <html>
      <head>
        <title>Downloaded Site: ${savedSite.url}</title>
        <style>
          body { font-family: sans-serif; padding: 20px; }
          h1 { color: #2563eb; }
          ul { list-style-type: none; padding: 0; }
          li { margin: 8px 0; padding: 8px; border-bottom: 1px solid #eee; }
        </style>
      </head>
      <body>
        <h1>Downloaded Site: ${savedSite.url}</h1>
        <h2>Pages (${pages.length})</h2>
        <ul>
          ${pages.map(page => `<li>${page.path}</li>`).join('')}
        </ul>
        <h2>Assets (${assets.length})</h2>
        <ul>
          ${assets.map(asset => `<li>${asset.path} (${asset.type})</li>`).join('')}
        </ul>
      </body>
      </html>`;

      res.setHeader('Content-Type', 'text/html');
      res.setHeader('Content-Disposition', `attachment; filename="${savedSite.url.replace(/[^a-z0-9]/gi, '_')}.html"`);
      return res.status(200).send(html);
    } catch (error) {
      console.error("Error downloading site:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
