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
  users,
  crawls,
  pages,
  assets,
  savedSites
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
    const [result] = await db.select().from(users).where(eq(users.email, email));
    return result;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [result] = await db.select().from(users).where(eq(users.username, username));
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
    const [result] = await db
      .select()
      .from(pages)
      .where(
        and(
          eq(pages.crawlId, crawlId),
          eq(pages.path, path)
        )
      );
    return result;
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
    const [result] = await db
      .select()
      .from(assets)
      .where(
        and(
          eq(assets.crawlId, crawlId),
          eq(assets.path, path)
        )
      );
    return result;
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
}

// Export an instance of the storage implementation
export const storage = new DatabaseStorage();