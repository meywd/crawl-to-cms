import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";
import {
  type User,
  type InsertUser,
  type Crawl,
  type InsertCrawl,
  type Page,
  type InsertPage,
  type Asset,
  type InsertAsset,
  type SavedSite,
  type InsertSavedSite,
  type ConvertedSite,
  type InsertConvertedSite,
  users,
  crawls,
  pages,
  assets,
  savedSites,
  convertedSites
} from "@shared/schema";

export interface IStorage {
  // User methods
  createUser(user: InsertUser): Promise<User>;
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  updateUserLastLogin(id: number): Promise<User | undefined>;
  
  // Crawl methods
  createCrawl(crawl: InsertCrawl): Promise<Crawl>;
  getCrawl(id: number): Promise<Crawl | undefined>;
  getCrawlByUrl(url: string, userId: number): Promise<Crawl | undefined>;
  updateCrawlStatus(id: number, status: string): Promise<Crawl | undefined>;
  updateCrawlProgress(id: number, pageCount: number): Promise<Crawl | undefined>;
  completeCrawl(id: number, pageCount: number): Promise<Crawl | undefined>;
  failCrawl(id: number, error: string): Promise<Crawl | undefined>;
  getCrawlHistory(userId: number): Promise<Crawl[]>;
  
  // Page methods
  createPage(page: InsertPage): Promise<Page>;
  getPage(id: number): Promise<Page | undefined>;
  getPageByPath(crawlId: number, path: string): Promise<Page | undefined>;
  getPagesByCrawlId(crawlId: number): Promise<Page[]>;
  
  // Asset methods
  createAsset(asset: InsertAsset): Promise<Asset>;
  getAsset(id: number): Promise<Asset | undefined>;
  getAssetByPath(crawlId: number, path: string): Promise<Asset | undefined>;
  getAssetsByCrawlId(crawlId: number): Promise<Asset[]>;
  
  // SavedSite methods
  createSavedSite(site: InsertSavedSite): Promise<SavedSite>;
  getSavedSite(id: number): Promise<SavedSite | undefined>;
  getSavedSites(userId: number): Promise<SavedSite[]>;
  deleteSavedSite(id: number): Promise<boolean>;
  
  // ConvertedSite methods
  createConvertedSite(site: InsertConvertedSite): Promise<ConvertedSite>;
  getConvertedSite(id: number): Promise<ConvertedSite | undefined>;
  getConvertedSites(userId: number): Promise<ConvertedSite[]>;
  getConvertedSiteByCrawlId(crawlId: number): Promise<ConvertedSite | undefined>;
  updateConvertedSite(id: number, updates: Partial<InsertConvertedSite>): Promise<ConvertedSite | undefined>;
  deleteConvertedSite(id: number): Promise<boolean>;
}

// Database storage implementation
export class DatabaseStorage implements IStorage {
  // User methods
  async createUser(user: InsertUser): Promise<User> {
    const [result] = await db.insert(users).values(user).returning();
    return result;
  }

  async getUser(id: number): Promise<User | undefined> {
    const [result] = await db.select().from(users).where(eq(users.id, id));
    return result;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [result] = await db
      .select()
      .from(users)
      .where(eq(users.email, email));
    return result;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [result] = await db
      .select()
      .from(users)
      .where(eq(users.username, username));
    return result;
  }

  async updateUserLastLogin(id: number): Promise<User | undefined> {
    const [result] = await db
      .update(users)
      .set({ lastLogin: new Date() })
      .where(eq(users.id, id))
      .returning();
    return result;
  }
  
  // Crawl methods
  async createCrawl(crawl: InsertCrawl): Promise<Crawl> {
    const [result] = await db.insert(crawls).values(crawl).returning();
    return result;
  }

  async getCrawl(id: number): Promise<Crawl | undefined> {
    const [result] = await db.select().from(crawls).where(eq(crawls.id, id));
    return result;
  }

  async getCrawlByUrl(url: string, userId: number): Promise<Crawl | undefined> {
    const [result] = await db
      .select()
      .from(crawls)
      .where(
        and(
          eq(crawls.url, url),
          eq(crawls.status, "in_progress"),
          eq(crawls.userId, userId)
        )
      );
    return result;
  }

  async updateCrawlStatus(id: number, status: string): Promise<Crawl | undefined> {
    const [result] = await db
      .update(crawls)
      .set({ status })
      .where(eq(crawls.id, id))
      .returning();
    return result;
  }

  async updateCrawlProgress(id: number, pageCount: number): Promise<Crawl | undefined> {
    const [result] = await db
      .update(crawls)
      .set({ pageCount })
      .where(eq(crawls.id, id))
      .returning();
    return result;
  }

  async completeCrawl(id: number, pageCount: number): Promise<Crawl | undefined> {
    const [result] = await db
      .update(crawls)
      .set({ 
        status: "completed", 
        pageCount,
        completedAt: new Date()
      })
      .where(eq(crawls.id, id))
      .returning();
    return result;
  }

  async failCrawl(id: number, error: string): Promise<Crawl | undefined> {
    const [result] = await db
      .update(crawls)
      .set({ 
        status: "error", 
        error,
        completedAt: new Date()
      })
      .where(eq(crawls.id, id))
      .returning();
    return result;
  }

  async getCrawlHistory(userId: number): Promise<Crawl[]> {
    const results = await db
      .select()
      .from(crawls)
      .where(eq(crawls.userId, userId))
      .orderBy(desc(crawls.startedAt));
    return results;
  }

  // Page methods
  async createPage(page: InsertPage): Promise<Page> {
    const [result] = await db.insert(pages).values(page).returning();
    return result;
  }

  async getPage(id: number): Promise<Page | undefined> {
    const [result] = await db.select().from(pages).where(eq(pages.id, id));
    return result;
  }

  async getPageByPath(crawlId: number, path: string): Promise<Page | undefined> {
    console.log(`Looking for page in DB with crawlId: ${crawlId}, path: "${path}"`);
    
    // Try exact match first
    const [result] = await db
      .select()
      .from(pages)
      .where(
        and(
          eq(pages.crawlId, crawlId),
          eq(pages.path, path)
        )
      );
    
    if (result) {
      console.log(`Found page by exact path match: ${result.path}`);
      return result;
    }
    
    // Get all pages for this crawl to try alternative matching strategies
    const allPages = await db
      .select()
      .from(pages)
      .where(eq(pages.crawlId, crawlId));
    
    console.log(`Found ${allPages.length} total pages for crawl ${crawlId}`);
    
    // Try case-insensitive match
    const caseInsensitiveMatch = allPages.find(
      page => page.path.toLowerCase() === path.toLowerCase()
    );
    
    if (caseInsensitiveMatch) {
      console.log(`Found page by case-insensitive match: ${caseInsensitiveMatch.path}`);
      return caseInsensitiveMatch;
    }
    
    // Check if we're looking for a directory-style path (without .html extension)
    if (!path.endsWith('.html') && !path.endsWith('/')) {
      // Try with .html extension
      const withHtmlExt = `${path}.html`;
      const htmlExtMatch = allPages.find(
        page => page.path.toLowerCase() === withHtmlExt.toLowerCase()
      );
      
      if (htmlExtMatch) {
        console.log(`Found page by adding .html extension: ${htmlExtMatch.path}`);
        return htmlExtMatch;
      }
      
      // Try with trailing slash + index.html
      const withIndexHtml = `${path}/index.html`;
      const indexHtmlMatch = allPages.find(
        page => page.path.toLowerCase() === withIndexHtml.toLowerCase()
      );
      
      if (indexHtmlMatch) {
        console.log(`Found page by adding /index.html: ${indexHtmlMatch.path}`);
        return indexHtmlMatch;
      }
    }
    
    // Try fuzzy matching based on similar paths
    // Checking if the requested path is a substring of an actual path
    // or an actual path is a substring of the requested path
    const substringMatch = allPages.find(page => {
      const pageLower = page.path.toLowerCase();
      const pathLower = path.toLowerCase();
      return pageLower.includes(pathLower) || pathLower.includes(pageLower);
    });
    
    if (substringMatch) {
      console.log(`Found page by substring match: ${substringMatch.path}`);
      return substringMatch;
    }
    
    console.log(`No page found for path: ${path}`);
    return undefined;
  }

  async getPagesByCrawlId(crawlId: number): Promise<Page[]> {
    const results = await db
      .select()
      .from(pages)
      .where(eq(pages.crawlId, crawlId));
    return results;
  }

  // Asset methods
  async createAsset(asset: InsertAsset): Promise<Asset> {
    const [result] = await db.insert(assets).values(asset).returning();
    return result;
  }

  async getAsset(id: number): Promise<Asset | undefined> {
    const [result] = await db.select().from(assets).where(eq(assets.id, id));
    return result;
  }

  async getAssetByPath(crawlId: number, path: string): Promise<Asset | undefined> {
    console.log(`Looking for asset in DB with crawlId: ${crawlId}, path: "${path}"`);
    
    // Try exact match first
    const [result] = await db
      .select()
      .from(assets)
      .where(
        and(
          eq(assets.crawlId, crawlId),
          eq(assets.path, path)
        )
      );
    
    if (result) {
      console.log(`Found asset by exact path match: ${result.path}`);
      return result;
    }
    
    // Try case-insensitive match if exact match fails
    // This helps with path mismatches due to case sensitivity
    const allAssets = await db
      .select()
      .from(assets)
      .where(eq(assets.crawlId, crawlId));
    
    // Try case-insensitive path match
    const caseInsensitiveMatch = allAssets.find(
      asset => asset.path.toLowerCase() === path.toLowerCase()
    );
    
    if (caseInsensitiveMatch) {
      console.log(`Found asset by case-insensitive match: ${caseInsensitiveMatch.path}`);
      return caseInsensitiveMatch;
    }
    
    // If still not found, try extracting just the filename from paths
    // This can help with path variations like "assets/filename.ext" vs "filename.ext"
    const searchFilename = path.split('/').pop() || path;
    const filenameMatch = allAssets.find(
      asset => {
        const assetFilename = asset.path.split('/').pop() || asset.path;
        return assetFilename.toLowerCase() === searchFilename.toLowerCase();
      }
    );
    
    if (filenameMatch) {
      console.log(`Found asset by filename match: ${filenameMatch.path}`);
      return filenameMatch;
    }
    
    // Check for URL match (sometimes the URL is the path)
    const urlMatch = allAssets.find(
      asset => {
        const assetUrlParts = asset.url.split('/');
        const assetUrlFilename = assetUrlParts[assetUrlParts.length - 1];
        return assetUrlFilename.toLowerCase() === searchFilename.toLowerCase();
      }
    );
    
    if (urlMatch) {
      console.log(`Found asset by URL match: ${urlMatch.url}`);
      return urlMatch;
    }
    
    console.log(`No asset found for path: ${path}`);
    return undefined;
  }

  async getAssetsByCrawlId(crawlId: number): Promise<Asset[]> {
    const results = await db
      .select()
      .from(assets)
      .where(eq(assets.crawlId, crawlId));
    return results;
  }

  // SavedSite methods
  async createSavedSite(site: InsertSavedSite): Promise<SavedSite> {
    const [result] = await db.insert(savedSites).values(site).returning();
    return result;
  }

  async getSavedSite(id: number): Promise<SavedSite | undefined> {
    const [result] = await db.select().from(savedSites).where(eq(savedSites.id, id));
    return result;
  }

  async getSavedSites(userId: number): Promise<SavedSite[]> {
    const results = await db
      .select()
      .from(savedSites)
      .where(eq(savedSites.userId, userId))
      .orderBy(desc(savedSites.savedAt));
    
    return results;
  }

  async deleteSavedSite(id: number): Promise<boolean> {
    const result = await db
      .delete(savedSites)
      .where(eq(savedSites.id, id));
    return true; // Always return true as we've executed the delete operation
  }
  
  // ConvertedSite methods
  async createConvertedSite(site: InsertConvertedSite): Promise<ConvertedSite> {
    const [result] = await db.insert(convertedSites).values(site).returning();
    return result;
  }

  async getConvertedSite(id: number): Promise<ConvertedSite | undefined> {
    const [result] = await db.select().from(convertedSites).where(eq(convertedSites.id, id));
    return result;
  }

  async getConvertedSites(userId: number): Promise<ConvertedSite[]> {
    const results = await db
      .select()
      .from(convertedSites)
      .where(eq(convertedSites.userId, userId))
      .orderBy(desc(convertedSites.convertedAt));
    
    return results;
  }
  
  async getConvertedSiteByCrawlId(crawlId: number): Promise<ConvertedSite | undefined> {
    const [result] = await db
      .select()
      .from(convertedSites)
      .where(eq(convertedSites.crawlId, crawlId));
    return result;
  }

  async updateConvertedSite(id: number, updates: Partial<InsertConvertedSite>): Promise<ConvertedSite | undefined> {
    const [result] = await db
      .update(convertedSites)
      .set(updates)
      .where(eq(convertedSites.id, id))
      .returning();
    return result;
  }

  async deleteConvertedSite(id: number): Promise<boolean> {
    try {
      console.log(`Attempting to delete converted site with ID: ${id}`);
      const result = await db
        .delete(convertedSites)
        .where(eq(convertedSites.id, id))
        .returning({ deleted: convertedSites.id });
      
      const deletedCount = result.length;
      console.log(`Deleted ${deletedCount} converted site records with ID ${id}`);
      
      return deletedCount > 0;
    } catch (error) {
      console.error(`Error deleting converted site with ID ${id}:`, error);
      throw error;
    }
  }
}

// Export an instance of the storage implementation
export const storage = new DatabaseStorage();