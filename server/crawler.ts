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
  
  // Helper method to get full-sized image URLs by removing format/size parameters
  private getFullSizeImageUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      
      // Remove common image resizing parameters from various CDNs
      
      // Squarespace and related CDNs
      if (url.includes('squarespace-cdn.com') || url.includes('sqspcdn.com') || url.includes('squarespace.com')) {
        // Remove format parameter that often limits size
        urlObj.searchParams.delete('format');
        
        // If there's a size indicator like "=100w", "=1000w", etc., remove it
        const path = urlObj.pathname;
        if (path.match(/=\d+w$/)) {
          urlObj.pathname = path.replace(/=\d+w$/, '');
        }
      }
      
      // WordPress and similar platforms
      if (url.includes('wp-content') || url.includes('wordpress')) {
        // Remove common sizing parameters like -150x150, -300x200, etc.
        const path = urlObj.pathname;
        urlObj.pathname = path.replace(/-\d+x\d+(\.[a-zA-Z]+)$/, '$1');
      }
      
      // Shopify
      if (url.includes('shopify.com') || url.includes('cdn.shopify.com')) {
        // Remove _100x, _large, _medium, etc. parts
        const path = urlObj.pathname;
        urlObj.pathname = path.replace(/(_small|_medium|_large|_grande|_\d+x)/, '');
      }
      
      // Cloudinary
      if (url.includes('cloudinary.com') || url.includes('res.cloudinary.com')) {
        // Remove transformation parameters like w_100,h_100,c_fit/
        const path = urlObj.pathname;
        urlObj.pathname = path.replace(/\/[^\/]*(w_\d+|h_\d+|c_\w+)[^\/]*\//, '/');
      }
      
      return urlObj.toString();
    } catch (error) {
      // If any error occurs, return the original URL
      console.warn(`Error cleaning image URL ${url}:`, error);
      return url;
    }
  }

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
      url = ensureHttpProtocol(url);
      
      console.log(`Starting crawl ${crawlId} for URL: ${url}, depth: ${depth}, options:`, options);
      
      // Initialize the crawl data structures
      this.crawlQueue.set(crawlId, new Set([url]));
      this.crawledUrls.set(crawlId, new Set());
      
      // Remove from paused or cancelled if it was there
      this.paused.delete(crawlId);
      this.cancelled.delete(crawlId);
      
      // Update the crawl status to in_progress
      await this.storage.updateCrawlStatus(crawlId, "in_progress");
      
      // Start the crawl
      await this.processCrawl(crawlId, url, depth, options);
      
      // Mark the crawl as completed if not already marked by processCrawl
      if (!this.paused.has(crawlId) && !this.cancelled.has(crawlId)) {
        const crawledPages = this.crawledUrls.get(crawlId)?.size || 0;
        console.log(`Crawl ${crawlId} completed. Processed ${crawledPages} pages.`);
        await this.storage.completeCrawl(crawlId, crawledPages);
      }
      
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
    const url = ensureHttpProtocol(crawl.url);
    console.log(`Resuming crawl ${crawlId} for URL: ${url}, depth: ${crawl.depth}`);
    
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
    
    console.log(`Processing crawl ${crawlId} at depth ${currentDepth}/${maxDepth} with ${queue.size} URLs in queue`);
    
    // Process this depth level
    const currentUrls = Array.from(queue);
    queue.clear(); // Clear the queue for this level
    
    if (currentUrls.length === 0) {
      console.log(`No URLs to process at depth ${currentDepth}`);
      return;
    }
    
    // Process URLs for this depth level
    const promises = currentUrls.map(async (currentUrl) => {
      // Skip if already crawled
      if (crawled.has(currentUrl)) {
        return;
      }
      
      // Check if the crawl has been paused or cancelled
      if (this.paused.has(crawlId) || this.cancelled.has(crawlId)) {
        return;
      }
      
      try {
        // Mark this URL as crawled
        crawled.add(currentUrl);
        
        console.log(`Crawling URL: ${currentUrl}`);
        
        // Fetch the page
        const response = await fetch(currentUrl);
        if (!response.ok) {
          console.warn(`Failed to fetch ${currentUrl}: ${response.status} ${response.statusText}`);
          return;
        }
        
        // Parse content based on type
        const contentType = response.headers.get("content-type") || "";
        
        if (contentType.includes("text/html")) {
          // Process HTML page
          const htmlContent = await response.text();
          await this.processHtmlPage(crawlId, currentUrl, baseUrl, htmlContent, options);
          
          // Extract and queue links for the next depth level
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
          // Process image, getting full-sized version by removing resize parameters 
          const fullSizeUrl = this.getFullSizeImageUrl(currentUrl);
          
          // If the full-size URL is different, fetch it instead
          let finalUrl = currentUrl;
          let buffer: Buffer;
          
          if (fullSizeUrl !== currentUrl) {
            console.log(`Using full-sized image URL: ${fullSizeUrl} instead of ${currentUrl}`);
            try {
              const fullSizeResponse = await fetch(fullSizeUrl);
              if (fullSizeResponse.ok) {
                const fullSizeArrayBuffer = await fullSizeResponse.arrayBuffer();
                buffer = Buffer.from(fullSizeArrayBuffer);
                finalUrl = fullSizeUrl;
              } else {
                // Fall back to original URL if full-size request fails
                console.warn(`Failed to fetch full-sized image, falling back to original URL`);
                const arrayBuffer = await response.arrayBuffer();
                buffer = Buffer.from(arrayBuffer);
              }
            } catch (error) {
              console.warn(`Error fetching full-sized image: ${error}, falling back to original URL`);
              const arrayBuffer = await response.arrayBuffer();
              buffer = Buffer.from(arrayBuffer);
            }
          } else {
            // Use the original response if URLs are the same
            const arrayBuffer = await response.arrayBuffer();
            buffer = Buffer.from(arrayBuffer);
          }
          
          const assetPath = this.getAssetPath(currentUrl, baseUrl);
          
          console.log(`Saving image: ${finalUrl} -> ${assetPath}`);
          await this.storage.createAsset({
            crawlId,
            url: finalUrl,
            path: assetPath,
            type: "image",
            content: buffer.toString("base64") // Store as base64
          });
        } else if (options.preserveCss && contentType.includes("text/css")) {
          // Process CSS
          const cssContent = await response.text();
          const assetPath = this.getAssetPath(currentUrl, baseUrl);
          
          console.log(`Saving CSS: ${currentUrl} -> ${assetPath}`);
          
          // Replace url() references in the CSS
          const processedCss = cssContent.replace(
            /url\(['"]?([^'")\s]+)['"]?\)/g,
            (match, resourceUrl) => {
              // Skip data URLs
              if (resourceUrl.startsWith('data:')) {
                return match;
              }
              
              try {
                const absoluteUrl = new URL(resourceUrl, currentUrl).toString();
                const resourceAssetPath = this.getAssetPath(absoluteUrl, baseUrl);
                return `url("/api/assets/${crawlId}/${resourceAssetPath}")`;
              } catch (error) {
                return match; // Keep original on error
              }
            }
          );
          
          await this.storage.createAsset({
            crawlId,
            url: currentUrl,
            path: assetPath,
            type: "css",
            content: processedCss
          });
        } else if (contentType.includes("application/javascript") || 
                  contentType.includes("text/javascript")) {
          // Process JavaScript
          const jsContent = await response.text();
          const assetPath = this.getAssetPath(currentUrl, baseUrl);
          
          console.log(`Saving JS: ${currentUrl} -> ${assetPath}`);
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
    });
    
    // Wait for all URLs at this depth to be processed
    await Promise.all(promises);
    
    // Check if the crawl should continue
    if (this.paused.has(crawlId)) {
      console.log(`Crawl ${crawlId} is paused`);
      return;
    }
    
    if (this.cancelled.has(crawlId)) {
      console.log(`Crawl ${crawlId} is cancelled`);
      return;
    }
    
    // If there are items in the queue and we haven't reached max depth, process the next level
    if (queue.size > 0 && currentDepth < maxDepth) {
      console.log(`Moving to depth ${currentDepth + 1} with ${queue.size} URLs in queue`);
      await this.processCrawl(crawlId, baseUrl, maxDepth, options, currentDepth + 1);
    } else {
      // Crawl complete
      console.log(`Crawl ${crawlId} complete. Processed ${crawled.size} URLs.`);
      await this.storage.completeCrawl(crawlId, crawled.size);
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
    
    // Track resources to download after processing the HTML
    const resourcesToDownload: { url: string; type: string; assetPath: string }[] = [];
    
    // If preserving CSS is enabled, replace CSS URLs and queue CSS files for download
    if (options.preserveCss) {
      // Handle external stylesheets
      $('link[rel="stylesheet"], link[as="style"], link[type="text/css"]').each((i, el) => {
        const href = $(el).attr('href');
        if (href) {
          try {
            const absoluteUrl = new URL(href, url).toString();
            const assetPath = this.getAssetPath(absoluteUrl, baseUrl);
            $(el).attr('href', `/api/assets/${crawlId}/${assetPath}`);
            console.log(`Replaced CSS link: ${href} -> /api/assets/${crawlId}/${assetPath}`);
            
            // Queue CSS file for download
            resourcesToDownload.push({
              url: absoluteUrl,
              type: 'css',
              assetPath
            });
          } catch (error) {
            console.log(`Error processing CSS link ${href}:`, error);
            // Keep the original href if there's an error
          }
        }
      });
      
      // Also handle JavaScript files
      $('script[src]').each((i, el) => {
        const src = $(el).attr('src');
        if (src) {
          try {
            const absoluteUrl = new URL(src, url).toString();
            const assetPath = this.getAssetPath(absoluteUrl, baseUrl);
            $(el).attr('src', `/api/assets/${crawlId}/${assetPath}`);
            console.log(`Replaced script src: ${src} -> /api/assets/${crawlId}/${assetPath}`);
            
            // Queue JS file for download
            resourcesToDownload.push({
              url: absoluteUrl,
              type: 'js',
              assetPath
            });
          } catch (error) {
            console.log(`Error processing script ${src}:`, error);
            // Keep the original src if there's an error
          }
        }
      });
      
      // Handle inline styles with @import
      $('style').each((i, el) => {
        const styleContent = $(el).html();
        if (styleContent) {
          // Collect @import resources to download
          const importMatches = styleContent.match(/@import\s+url\(['"]?([^'")\s]+)['"]?\)/g) || [];
          for (const importMatch of importMatches) {
            const importUrl = importMatch.match(/@import\s+url\(['"]?([^'")\s]+)['"]?\)/)?.[1];
            if (importUrl && !importUrl.startsWith('data:')) {
              try {
                const absoluteUrl = new URL(importUrl, url).toString();
                const assetPath = this.getAssetPath(absoluteUrl, baseUrl);
                
                // Queue imported CSS file for download
                resourcesToDownload.push({
                  url: absoluteUrl,
                  type: 'css',
                  assetPath
                });
              } catch (error) {
                // Skip if URL is invalid
              }
            }
          }
          
          // Replace @import url(...) references
          const updatedStyle = styleContent.replace(
            /@import\s+url\(['"]?([^'")\s]+)['"]?\)/g,
            (match, importUrl) => {
              try {
                const absoluteUrl = new URL(importUrl, url).toString();
                const assetPath = this.getAssetPath(absoluteUrl, baseUrl);
                return `@import url("/api/assets/${crawlId}/${assetPath}")`;
              } catch (error) {
                return match; // Keep original on error
              }
            }
          );
          
          // Collect background image resources to download
          const urlMatches = updatedStyle.match(/url\(['"]?([^'")\s]+)['"]?\)/g) || [];
          for (const urlMatch of urlMatches) {
            const resourceUrl = urlMatch.match(/url\(['"]?([^'")\s]+)['"]?\)/)?.[1];
            if (resourceUrl && !resourceUrl.startsWith('data:')) {
              try {
                const absoluteUrl = new URL(resourceUrl, url).toString();
                const assetPath = this.getAssetPath(absoluteUrl, baseUrl);
                
                // Queue image file for download
                resourcesToDownload.push({
                  url: absoluteUrl,
                  type: 'image',
                  assetPath
                });
              } catch (error) {
                // Skip if URL is invalid
              }
            }
          }
          
          // Replace url(...) references in the style content
          const finalStyle = updatedStyle.replace(
            /url\(['"]?([^'")\s]+)['"]?\)/g,
            (match, resourceUrl) => {
              // Skip data URLs
              if (resourceUrl.startsWith('data:')) {
                return match;
              }
              
              try {
                const absoluteUrl = new URL(resourceUrl, url).toString();
                const assetPath = this.getAssetPath(absoluteUrl, baseUrl);
                return `url("/api/assets/${crawlId}/${assetPath}")`;
              } catch (error) {
                return match; // Keep original on error
              }
            }
          );
          
          $(el).text(finalStyle);
        }
      });
    }
    
    // If downloading images is enabled, replace image URLs and queue images for download
    if (options.downloadImages) {
      // Handle standard img tags
      $('img').each((i, el) => {
        const src = $(el).attr('src');
        if (src) {
          try {
            const absoluteUrl = new URL(src, url).toString();
            // Get the full-sized image URL by removing resize parameters
            const fullSizeUrl = this.getFullSizeImageUrl(absoluteUrl);
            const assetPath = this.getAssetPath(absoluteUrl, baseUrl);
            $(el).attr('src', `/api/assets/${crawlId}/${assetPath}`);
            console.log(`Replaced image src: ${src} -> /api/assets/${crawlId}/${assetPath}`);
            
            // Queue full-sized image for download
            resourcesToDownload.push({
              url: fullSizeUrl,
              type: 'image',
              assetPath
            });
            
            // Also handle srcset if present
            const srcset = $(el).attr('srcset');
            if (srcset) {
              const srcsetParts = srcset.split(',');
              const newSrcset = srcsetParts.map(srcSetPart => {
                const [imgUrl, size] = srcSetPart.trim().split(/\s+/);
                try {
                  const absoluteSrcSetUrl = new URL(imgUrl, url).toString();
                  // Get full-sized image URL by removing resize parameters
                  const fullSizeUrl = this.getFullSizeImageUrl(absoluteSrcSetUrl);
                  const srcSetAssetPath = this.getAssetPath(absoluteSrcSetUrl, baseUrl);
                  
                  // Queue full-sized srcset image for download
                  resourcesToDownload.push({
                    url: fullSizeUrl,
                    type: 'image',
                    assetPath: srcSetAssetPath
                  });
                  
                  return `/api/assets/${crawlId}/${srcSetAssetPath} ${size || ''}`.trim();
                } catch (error) {
                  return srcSetPart; // Keep original on error
                }
              }).join(', ');
              
              $(el).attr('srcset', newSrcset);
            }
          } catch (error) {
            console.log(`Error processing image ${src}:`, error);
            // Keep the original src if there's an error
          }
        }
      });
      
      // Handle picture sources
      $('picture source').each((i, el) => {
        const srcset = $(el).attr('srcset');
        if (srcset) {
          try {
            const srcsetParts = srcset.split(',');
            const newSrcset = srcsetParts.map(srcSetPart => {
              const [imgUrl, size] = srcSetPart.trim().split(/\s+/);
              try {
                const absoluteSrcSetUrl = new URL(imgUrl, url).toString();
                // Get full-sized image URL by removing resize parameters
                const fullSizeUrl = this.getFullSizeImageUrl(absoluteSrcSetUrl);
                const srcSetAssetPath = this.getAssetPath(absoluteSrcSetUrl, baseUrl);
                
                // Queue full-sized picture source image for download
                resourcesToDownload.push({
                  url: fullSizeUrl,
                  type: 'image',
                  assetPath: srcSetAssetPath
                });
                
                return `/api/assets/${crawlId}/${srcSetAssetPath} ${size || ''}`.trim();
              } catch (error) {
                return srcSetPart; // Keep original on error
              }
            }).join(', ');
            
            $(el).attr('srcset', newSrcset);
          } catch (error) {
            // Keep original on error
          }
        }
      });
      
      // Handle CSS background images in inline styles
      $('[style*="background"], [style*="background-image"]').each((i, el) => {
        const style = $(el).attr('style');
        if (style) {
          // Collect background image resources to download
          const urlMatches = style.match(/url\(['"]?([^'")\s]+)['"]?\)/g) || [];
          for (const urlMatch of urlMatches) {
            const resourceUrl = urlMatch.match(/url\(['"]?([^'")\s]+)['"]?\)/)?.[1];
            if (resourceUrl && !resourceUrl.startsWith('data:')) {
              try {
                const absoluteUrl = new URL(resourceUrl, url).toString();
                // Get full-sized image URL by removing resize parameters
                const fullSizeUrl = this.getFullSizeImageUrl(absoluteUrl);
                const assetPath = this.getAssetPath(absoluteUrl, baseUrl);
                
                // Queue full-sized background image for download
                resourcesToDownload.push({
                  url: fullSizeUrl,
                  type: 'image',
                  assetPath
                });
              } catch (error) {
                // Skip if URL is invalid
              }
            }
          }
          
          const newStyle = style.replace(
            /url\(['"]?([^'")\s]+)['"]?\)/g,
            (match, resourceUrl) => {
              // Skip data URLs
              if (resourceUrl.startsWith('data:')) {
                return match;
              }
              
              try {
                const absoluteUrl = new URL(resourceUrl, url).toString();
                const assetPath = this.getAssetPath(absoluteUrl, baseUrl);
                return `url("/api/assets/${crawlId}/${assetPath}")`;
              } catch (error) {
                return match; // Keep original on error
              }
            }
          );
          
          $(el).attr('style', newStyle);
        }
      });
    }
    
    // If preserving navigation is enabled, rewrite links
    if (options.preserveNav) {
      // Helper function to check if the URLs have the same domain
      const isSameDomain = (url1: string, url2: string): boolean => {
        try {
          const domain1 = new URL(url1).hostname;
          const domain2 = new URL(url2).hostname;
          return domain1 === domain2;
        } catch (error) {
          return false;
        }
      };
      
      // Process all links
      $('a').each((i, el) => {
        const href = $(el).attr('href');
        if (href) {
          // Skip fragment-only, javascript, mailto and tel links
          if (href.startsWith('#') || 
              href.startsWith('javascript:') || 
              href.startsWith('mailto:') || 
              href.startsWith('tel:')) {
            return;
          }
          
          try {
            const absoluteUrl = new URL(href, url).toString();
            
            // Only rewrite links that are part of the same domain
            if (isSameDomain(absoluteUrl, baseUrl)) {
              const targetPath = this.getPagePath(absoluteUrl, baseUrl);
              $(el).attr('href', `/preview/${crawlId}?path=${encodeURIComponent(targetPath)}`);
              console.log(`Rewriting link: ${href} -> /preview/${crawlId}?path=${encodeURIComponent(targetPath)}`);
            } else {
              // External link - keep it as is but log it
              console.log(`Preserving external link: ${absoluteUrl}`);
            }
          } catch (error) {
            console.log(`Error processing link ${href}:`, error);
            // Invalid URL or other error, just leave it alone
          }
        }
      });
      
      // Handle forms with relative action URLs
      $('form').each((i, el) => {
        const action = $(el).attr('action');
        if (action && !action.startsWith('http')) {
          try {
            const absoluteUrl = new URL(action, url).toString();
            
            // Only rewrite actions that are part of the same domain
            if (isSameDomain(absoluteUrl, baseUrl)) {
              const targetPath = this.getPagePath(absoluteUrl, baseUrl);
              $(el).attr('action', `/preview/${crawlId}?path=${encodeURIComponent(targetPath)}`);
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
    
    // Download all the resources we've identified
    console.log(`Downloading ${resourcesToDownload.length} resources for ${url}`);
    
    // Use a Set to remove duplicate resources by URL
    const uniqueResources = Array.from(
      new Map(resourcesToDownload.map(item => [item.url, item])).values()
    );
    
    // Download resources in parallel with a reasonable concurrency limit
    const concurrencyLimit = 5;
    const chunks = [];
    for (let i = 0; i < uniqueResources.length; i += concurrencyLimit) {
      chunks.push(uniqueResources.slice(i, i + concurrencyLimit));
    }
    
    for (const chunk of chunks) {
      await Promise.all(chunk.map(async (resource) => {
        try {
          console.log(`Downloading resource: ${resource.url} as ${resource.type}`);
          const response = await fetch(resource.url);
          
          if (!response.ok) {
            console.warn(`Failed to fetch resource ${resource.url}: ${response.status} ${response.statusText}`);
            return;
          }
          
          if (resource.type === 'image') {
            const arrayBuffer = await response.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            
            await this.storage.createAsset({
              crawlId,
              url: resource.url,
              path: resource.assetPath,
              type: resource.type,
              content: buffer.toString('base64') // Store as base64
            });
            console.log(`Successfully saved image: ${resource.url}`);
          } else {
            // CSS or JS content
            const content = await response.text();
            
            // For CSS, process any nested URL references
            let processedContent = content;
            if (resource.type === 'css') {
              processedContent = content.replace(
                /url\(['"]?([^'")\s]+)['"]?\)/g,
                (match, resourceUrl) => {
                  // Skip data URLs
                  if (resourceUrl.startsWith('data:')) {
                    return match;
                  }
                  
                  try {
                    const absoluteUrl = new URL(resourceUrl, resource.url).toString();
                    const assetPath = this.getAssetPath(absoluteUrl, baseUrl);
                    
                    // Check if this is an image resource
                    const isImage = resourceUrl.match(/\.(jpg|jpeg|png|gif|svg|webp|ico)$/i) ? true : false;
                    
                    // If it's an image, use the full size URL
                    const urlToDownload = isImage ? this.getFullSizeImageUrl(absoluteUrl) : absoluteUrl;
                    
                    // Queue this nested resource for download in the next batch
                    resourcesToDownload.push({
                      url: urlToDownload,
                      type: isImage ? 'image' : 'other',
                      assetPath
                    });
                    
                    return `url("/api/assets/${crawlId}/${assetPath}")`;
                  } catch (error) {
                    return match; // Keep original on error
                  }
                }
              );
            }
            
            await this.storage.createAsset({
              crawlId,
              url: resource.url,
              path: resource.assetPath,
              type: resource.type,
              content: processedContent
            });
            console.log(`Successfully saved ${resource.type}: ${resource.url}`);
          }
        } catch (error) {
          console.error(`Error downloading resource ${resource.url}:`, error);
        }
      }));
    }
  }

  private extractLinks(url: string, baseUrl: string, html: string): string[] {
    const $ = cheerio.load(html);
    const links = new Set<string>();
    
    // Helper function to check if the URLs have the same domain
    const isSameDomain = (url1: string, url2: string): boolean => {
      try {
        const domain1 = new URL(url1).hostname;
        const domain2 = new URL(url2).hostname;
        return domain1 === domain2;
      } catch (error) {
        return false;
      }
    };
    
    // Helper function to add URL to the links set if it's valid and from the same domain
    const addUrlIfValid = (sourceUrl: string): void => {
      if (sourceUrl && 
          !sourceUrl.startsWith('data:') && 
          !sourceUrl.startsWith('#') && 
          !sourceUrl.startsWith('javascript:') &&
          !sourceUrl.startsWith('mailto:') &&
          !sourceUrl.startsWith('tel:')) {
        try {
          const absoluteUrl = new URL(sourceUrl, url).toString();
          
          // Only include links from the same domain
          if (isSameDomain(absoluteUrl, baseUrl)) {
            links.add(absoluteUrl);
          }
        } catch (error) {
          // Invalid URL, skip
          console.log(`Skipping invalid URL: ${sourceUrl}`);
        }
      }
    };
    
    // Extract links from anchor tags
    $('a').each((i, el) => {
      const href = $(el).attr('href');
      if (href) {
        addUrlIfValid(href);
      }
    });
    
    // If preserving CSS is enabled, also extract CSS links
    $('link[rel="stylesheet"], link[as="style"], link[type="text/css"]').each((i, el) => {
      const href = $(el).attr('href');
      if (href) {
        addUrlIfValid(href);
      }
    });
    
    // Extract images
    $('img').each((i, el) => {
      const src = $(el).attr('src');
      if (src) {
        addUrlIfValid(src);
      }
      
      // Also check srcset if present
      const srcset = $(el).attr('srcset');
      if (srcset) {
        srcset.split(',').forEach(srcSetPart => {
          const [imgUrl] = srcSetPart.trim().split(/\s+/);
          if (imgUrl) {
            addUrlIfValid(imgUrl);
          }
        });
      }
    });
    
    // Extract script sources
    $('script[src]').each((i, el) => {
      const src = $(el).attr('src');
      if (src) {
        addUrlIfValid(src);
      }
    });
    
    // Extract picture sources
    $('picture source').each((i, el) => {
      const srcset = $(el).attr('srcset');
      if (srcset) {
        srcset.split(',').forEach(srcSetPart => {
          const [imgUrl] = srcSetPart.trim().split(/\s+/);
          if (imgUrl) {
            addUrlIfValid(imgUrl);
          }
        });
      }
    });
    
    // Extract URLs from inline styles
    $('[style*="url("]').each((i, el) => {
      const style = $(el).attr('style');
      if (style) {
        const urlMatches = style.match(/url\(['"]?([^'")\s]+)['"]?\)/g);
        if (urlMatches) {
          urlMatches.forEach(match => {
            const resourceUrl = match.replace(/url\(['"]?/, '').replace(/['"]?\)/, '');
            addUrlIfValid(resourceUrl);
          });
        }
      }
    });
    
    // Extract @import URLs from style tags
    $('style').each((i, el) => {
      const styleContent = $(el).html();
      if (styleContent) {
        const importMatches = styleContent.match(/@import\s+url\(['"]?([^'")\s]+)['"]?\)/g);
        if (importMatches) {
          importMatches.forEach(match => {
            const importUrl = match.replace(/@import\s+url\(['"]?/, '').replace(/['"]?\)/, '');
            addUrlIfValid(importUrl);
          });
        }
        
        const urlMatches = styleContent.match(/url\(['"]?([^'")\s]+)['"]?\)/g);
        if (urlMatches) {
          urlMatches.forEach(match => {
            const resourceUrl = match.replace(/url\(['"]?/, '').replace(/['"]?\)/, '');
            addUrlIfValid(resourceUrl);
          });
        }
      }
    });
    
    console.log(`Extracted ${links.size} links from ${url}`);
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
