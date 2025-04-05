import { IStorage } from "./storage_new";
import { type CrawlOptions } from "@shared/schema";
import fetch from "node-fetch";
import * as cheerio from "cheerio";
import { URL } from "url";
import path from "path";

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

export class WebCrawler {
  private storage: IStorage;
  private crawlQueue: Map<number, Set<string>>;
  private crawledUrls: Map<number, Set<string>>;
  private paused: Set<number>;
  private cancelled: Set<number>;

  constructor(storage: IStorage) {
    this.storage = storage;
    this.crawlQueue = new Map();
    this.crawledUrls = new Map();
    this.paused = new Set();
    this.cancelled = new Set();
  }

  async startCrawl(
    crawlId: number, 
    url: string, 
    depth: number, 
    options: CrawlOptions
  ): Promise<void> {
    try {
      // Ensure URL has a protocol
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }
      
      // Initialize the crawl data structures
      this.crawlQueue.set(crawlId, new Set([url]));
      this.crawledUrls.set(crawlId, new Set());
      
      // Update the crawl status to in_progress
      await this.storage.updateCrawlStatus(crawlId, "in_progress");
      
      // Start the crawl
      await this.processCrawl(crawlId, url, depth, options);
      
      // Mark the crawl as completed when done
      const crawledPages = this.crawledUrls.get(crawlId)?.size || 0;
      await this.storage.completeCrawl(crawlId, crawledPages);
      
      // Clean up
      this.crawlQueue.delete(crawlId);
      this.crawledUrls.delete(crawlId);
    } catch (error) {
      console.error(`Error in crawl ${crawlId}:`, error);
      await this.storage.failCrawl(crawlId, error instanceof Error ? error.message : "Unknown error");
      
      // Clean up
      this.crawlQueue.delete(crawlId);
      this.crawledUrls.delete(crawlId);
    }
  }

  async resumeCrawl(crawlId: number): Promise<void> {
    // Remove from paused set
    this.paused.delete(crawlId);
    
    // Update the crawl status
    await this.storage.updateCrawlStatus(crawlId, "in_progress");
    
    // Get the crawl data
    const crawl = await this.storage.getCrawl(crawlId);
    if (!crawl) {
      throw new Error(`Crawl ${crawlId} not found`);
    }
    
    // Ensure URL has a protocol
    let url = crawl.url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    
    // Resume the crawl
    await this.processCrawl(crawlId, url, crawl.depth, crawl.options as CrawlOptions);
  }

  private async processCrawl(
    crawlId: number, 
    baseUrl: string, 
    maxDepth: number, 
    options: CrawlOptions,
    currentDepth: number = 0
  ): Promise<void> {
    // Get the current queue
    const queue = this.crawlQueue.get(crawlId);
    const crawled = this.crawledUrls.get(crawlId);
    
    if (!queue || !crawled) {
      throw new Error(`Crawl ${crawlId} not initialized properly`);
    }
    
    // Continue processing until the queue is empty or we reach max depth
    while (queue.size > 0 && currentDepth <= maxDepth) {
      // Check if the crawl has been paused or cancelled
      if (this.paused.has(crawlId)) {
        console.log(`Crawl ${crawlId} is paused`);
        return;
      }
      
      if (this.cancelled.has(crawlId)) {
        console.log(`Crawl ${crawlId} is cancelled`);
        return;
      }
      
      // Get the next URL from the queue
      const currentUrl = Array.from(queue)[0];
      queue.delete(currentUrl);
      
      // Skip if already crawled
      if (crawled.has(currentUrl)) {
        continue;
      }
      
      try {
        // Mark this URL as crawled
        crawled.add(currentUrl);
        
        // Fetch the page
        const response = await fetch(currentUrl);
        if (!response.ok) {
          console.warn(`Failed to fetch ${currentUrl}: ${response.status} ${response.statusText}`);
          continue;
        }
        
        // Parse as HTML
        const contentType = response.headers.get("content-type") || "";
        
        if (contentType.includes("text/html")) {
          // Process HTML page
          const htmlContent = await response.text();
          await this.processHtmlPage(crawlId, currentUrl, baseUrl, htmlContent, options);
          
          // Extract and queue links if not at max depth
          if (currentDepth < maxDepth) {
            const links = this.extractLinks(currentUrl, baseUrl, htmlContent);
            for (const link of links) {
              // Only add if not already crawled
              if (!crawled.has(link)) {
                queue.add(link);
              }
            }
          }
        } else if (options.downloadImages && contentType.includes("image/")) {
          // Process image
          const buffer = await response.buffer();
          const assetPath = this.getAssetPath(currentUrl, baseUrl);
          
          await this.storage.createAsset({
            crawlId,
            url: currentUrl,
            path: assetPath,
            type: "image",
            content: buffer.toString("base64") // Store as base64
          });
        } else if (options.preserveCss && contentType.includes("text/css")) {
          // Process CSS
          const cssContent = await response.text();
          const assetPath = this.getAssetPath(currentUrl, baseUrl);
          
          await this.storage.createAsset({
            crawlId,
            url: currentUrl,
            path: assetPath,
            type: "css",
            content: cssContent
          });
        } else if (contentType.includes("application/javascript") || 
                  contentType.includes("text/javascript")) {
          // Process JavaScript
          const jsContent = await response.text();
          const assetPath = this.getAssetPath(currentUrl, baseUrl);
          
          await this.storage.createAsset({
            crawlId,
            url: currentUrl,
            path: assetPath,
            type: "js",
            content: jsContent
          });
        }
        
        // Update the crawl progress
        await this.storage.updateCrawlProgress(crawlId, crawled.size);
      } catch (error) {
        console.error(`Error processing ${currentUrl}:`, error);
        // Continue with next URL
      }
    }
    
    // If there are still items in the queue, continue with the next depth level
    if (queue.size > 0 && currentDepth < maxDepth) {
      await this.processCrawl(crawlId, baseUrl, maxDepth, options, currentDepth + 1);
    }
  }

  private async processHtmlPage(
    crawlId: number, 
    url: string, 
    baseUrl: string,
    html: string,
    options: CrawlOptions
  ): Promise<void> {
    const $ = cheerio.load(html);
    const pagePath = this.getPagePath(url, baseUrl);
    
    // Extract page title
    const title = $('title').text() || pagePath;
    
    // If preserving CSS is enabled, replace CSS URLs
    if (options.preserveCss) {
      $('link[rel="stylesheet"]').each((i, el) => {
        const href = $(el).attr('href');
        if (href) {
          const absoluteUrl = new URL(href, url).toString();
          const assetPath = this.getAssetPath(absoluteUrl, baseUrl);
          $(el).attr('href', `/api/assets/${crawlId}/${assetPath}`);
        }
      });
    }
    
    // If downloading images is enabled, replace image URLs
    if (options.downloadImages) {
      $('img').each((i, el) => {
        const src = $(el).attr('src');
        if (src) {
          const absoluteUrl = new URL(src, url).toString();
          const assetPath = this.getAssetPath(absoluteUrl, baseUrl);
          $(el).attr('src', `/api/assets/${crawlId}/${assetPath}`);
        }
      });
    }
    
    // If preserving navigation is enabled, rewrite links
    if (options.preserveNav) {
      $('a').each((i, el) => {
        const href = $(el).attr('href');
        if (href) {
          try {
            const absoluteUrl = new URL(href, url).toString();
            // Only rewrite links that are part of the same domain
            if (absoluteUrl.startsWith(baseUrl)) {
              const targetPath = this.getPagePath(absoluteUrl, baseUrl);
              $(el).attr('href', `/preview/${crawlId}?path=${encodeURIComponent(targetPath)}`);
            }
          } catch (error) {
            // Invalid URL or other error, just leave it alone
          }
        }
      });
    }
    
    // Save the processed HTML
    const processedHtml = $.html();
    
    await this.storage.createPage({
      crawlId,
      url,
      path: pagePath,
      content: processedHtml,
      title
    });
  }

  private extractLinks(url: string, baseUrl: string, html: string): string[] {
    const $ = cheerio.load(html);
    const links = new Set<string>();
    
    $('a').each((i, el) => {
      const href = $(el).attr('href');
      if (href) {
        try {
          const absoluteUrl = new URL(href, url).toString();
          // Only include links from the same domain
          if (absoluteUrl.startsWith(baseUrl)) {
            links.add(absoluteUrl);
          }
        } catch (error) {
          // Invalid URL, skip
        }
      }
    });
    
    return Array.from(links);
  }

  private getPagePath(url: string, baseUrl: string): string {
    try {
      // Remove the base URL to get the path
      const urlObj = new URL(url);
      const baseUrlObj = new URL(baseUrl);
      
      // If it's the homepage, use index.html
      if (urlObj.pathname === '/' || urlObj.pathname === '') {
        return 'index.html';
      }
      
      // Remove trailing slash
      let pathname = urlObj.pathname;
      if (pathname.endsWith('/')) {
        pathname = pathname.slice(0, -1);
      }
      
      // If the path doesn't have an extension, treat it as a directory and append index.html
      if (!path.extname(pathname)) {
        return `${pathname.substring(1)}/index.html`;
      }
      
      // Otherwise, return the path without the leading slash
      return pathname.substring(1);
    } catch (error) {
      // Fallback
      return 'index.html';
    }
  }

  private getAssetPath(url: string, baseUrl: string): string {
    try {
      // Parse the URL
      const urlObj = new URL(url);
      
      // Get the pathname
      let pathname = urlObj.pathname;
      
      // Remove leading slash
      if (pathname.startsWith('/')) {
        pathname = pathname.substring(1);
      }
      
      // Add assets/ prefix
      return `assets/${pathname}`;
    } catch (error) {
      // Fallback for invalid URLs
      return `assets/unknown-${Date.now()}`;
    }
  }
}
