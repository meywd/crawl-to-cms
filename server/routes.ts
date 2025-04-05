import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
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

export async function registerRoutes(app: Express): Promise<Server> {
  // Crawl routes
  app.post("/api/crawl", async (req: Request, res: Response) => {
    try {
      const { url, depth, options } = insertCrawlSchema
        .extend({
          options: crawlOptionsSchema
        })
        .parse(req.body);

      // Normalize URL for consistency (protocol handling is done in WebCrawler now)
      let normalizedUrl = url;
      if (normalizedUrl.startsWith('http://')) {
        normalizedUrl = normalizedUrl.substring(7);
      } else if (normalizedUrl.startsWith('https://')) {
        normalizedUrl = normalizedUrl.substring(8);
      }

      // Check if there's already an active crawl for this URL
      const existingCrawl = await storage.getCrawlByUrl(normalizedUrl);
      if (existingCrawl) {
        return res.status(409).json({ 
          message: `A crawl for ${normalizedUrl} is already ${existingCrawl.status}` 
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
      const crawls = await storage.getCrawlHistory();
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

      const asset = await storage.getAssetByPath(crawlId, assetPath);
      if (!asset) {
        return res.status(404).json({ message: "Asset not found" });
      }

      // Set the appropriate content type based on asset type
      if (asset.type === "image") {
        res.setHeader("Content-Type", "image/jpeg"); // Default to JPEG, but in reality would be more dynamic
      } else if (asset.type === "css") {
        res.setHeader("Content-Type", "text/css");
      } else if (asset.type === "js") {
        res.setHeader("Content-Type", "application/javascript");
      }

      return res.status(200).send(asset.content);
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
      const pagePath = req.params.path || "index.html";
      
      if (isNaN(crawlId)) {
        return res.status(400).json({ message: "Invalid crawl ID" });
      }

      const page = await storage.getPageByPath(crawlId, pagePath);
      if (!page) {
        return res.status(404).json({ message: "Page not found" });
      }

      // Set content type based on the file extension
      if (pagePath.endsWith(".html") || pagePath.endsWith(".htm")) {
        res.setHeader("Content-Type", "text/html");
      } else if (pagePath.endsWith(".css")) {
        res.setHeader("Content-Type", "text/css");
      } else if (pagePath.endsWith(".js")) {
        res.setHeader("Content-Type", "application/javascript");
      }

      return res.status(200).send(page.content);
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
