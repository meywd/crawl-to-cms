import { 
  type Crawl, 
  type InsertCrawl, 
  type Page, 
  type InsertPage,
  type Asset, 
  type InsertAsset,
  type SavedSite, 
  type InsertSavedSite,
  crawls,
  pages,
  assets,
  savedSites
} from "@shared/schema";

// Modify the interface with any CRUD methods you might need
export interface IStorage {
  // Crawl methods
  createCrawl(crawl: InsertCrawl): Promise<Crawl>;
  getCrawl(id: number): Promise<Crawl | undefined>;
  getCrawlByUrl(url: string): Promise<Crawl | undefined>;
  updateCrawlStatus(id: number, status: string): Promise<Crawl | undefined>;
  updateCrawlProgress(id: number, pageCount: number): Promise<Crawl | undefined>;
  completeCrawl(id: number, pageCount: number): Promise<Crawl | undefined>;
  failCrawl(id: number, error: string): Promise<Crawl | undefined>;
  getCrawlHistory(): Promise<Crawl[]>;
  
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
  getSavedSites(): Promise<SavedSite[]>;
  deleteSavedSite(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private crawls: Map<number, Crawl>;
  private pages: Map<number, Page>;
  private assets: Map<number, Asset>;
  private savedSites: Map<number, SavedSite>;
  private crawlId: number;
  private pageId: number;
  private assetId: number;
  private savedSiteId: number;

  constructor() {
    this.crawls = new Map();
    this.pages = new Map();
    this.assets = new Map();
    this.savedSites = new Map();
    this.crawlId = 1;
    this.pageId = 1;
    this.assetId = 1;
    this.savedSiteId = 1;
  }

  // Crawl methods
  async createCrawl(crawl: InsertCrawl): Promise<Crawl> {
    const id = this.crawlId++;
    const now = new Date();
    const newCrawl: Crawl = {
      ...crawl,
      id,
      status: "idle",
      startedAt: now,
      pageCount: 0
    };
    this.crawls.set(id, newCrawl);
    return newCrawl;
  }

  async getCrawl(id: number): Promise<Crawl | undefined> {
    return this.crawls.get(id);
  }

  async getCrawlByUrl(url: string): Promise<Crawl | undefined> {
    return Array.from(this.crawls.values()).find(
      (crawl) => crawl.url === url && ["idle", "in_progress", "paused"].includes(crawl.status)
    );
  }

  async updateCrawlStatus(id: number, status: string): Promise<Crawl | undefined> {
    const crawl = this.crawls.get(id);
    if (!crawl) return undefined;
    
    const updatedCrawl = { ...crawl, status };
    this.crawls.set(id, updatedCrawl);
    return updatedCrawl;
  }

  async updateCrawlProgress(id: number, pageCount: number): Promise<Crawl | undefined> {
    const crawl = this.crawls.get(id);
    if (!crawl) return undefined;
    
    const updatedCrawl = { ...crawl, pageCount };
    this.crawls.set(id, updatedCrawl);
    return updatedCrawl;
  }

  async completeCrawl(id: number, pageCount: number): Promise<Crawl | undefined> {
    const crawl = this.crawls.get(id);
    if (!crawl) return undefined;
    
    const updatedCrawl = { 
      ...crawl, 
      status: "completed", 
      completedAt: new Date(), 
      pageCount 
    };
    this.crawls.set(id, updatedCrawl);
    return updatedCrawl;
  }

  async failCrawl(id: number, error: string): Promise<Crawl | undefined> {
    const crawl = this.crawls.get(id);
    if (!crawl) return undefined;
    
    const updatedCrawl = { 
      ...crawl, 
      status: "error", 
      completedAt: new Date(),
      error
    };
    this.crawls.set(id, updatedCrawl);
    return updatedCrawl;
  }

  async getCrawlHistory(): Promise<Crawl[]> {
    return Array.from(this.crawls.values());
  }

  // Page methods
  async createPage(page: InsertPage): Promise<Page> {
    const id = this.pageId++;
    const now = new Date();
    const newPage: Page = {
      ...page,
      id,
      createdAt: now
    };
    this.pages.set(id, newPage);
    return newPage;
  }

  async getPage(id: number): Promise<Page | undefined> {
    return this.pages.get(id);
  }

  async getPageByPath(crawlId: number, path: string): Promise<Page | undefined> {
    return Array.from(this.pages.values()).find(
      (page) => page.crawlId === crawlId && page.path === path
    );
  }

  async getPagesByCrawlId(crawlId: number): Promise<Page[]> {
    return Array.from(this.pages.values()).filter(
      (page) => page.crawlId === crawlId
    );
  }

  // Asset methods
  async createAsset(asset: InsertAsset): Promise<Asset> {
    const id = this.assetId++;
    const now = new Date();
    const newAsset: Asset = {
      ...asset,
      id,
      createdAt: now
    };
    this.assets.set(id, newAsset);
    return newAsset;
  }

  async getAsset(id: number): Promise<Asset | undefined> {
    return this.assets.get(id);
  }

  async getAssetByPath(crawlId: number, path: string): Promise<Asset | undefined> {
    return Array.from(this.assets.values()).find(
      (asset) => asset.crawlId === crawlId && asset.path === path
    );
  }

  async getAssetsByCrawlId(crawlId: number): Promise<Asset[]> {
    return Array.from(this.assets.values()).filter(
      (asset) => asset.crawlId === crawlId
    );
  }

  // SavedSite methods
  async createSavedSite(site: InsertSavedSite): Promise<SavedSite> {
    const id = this.savedSiteId++;
    const now = new Date();
    const newSavedSite: SavedSite = {
      ...site,
      id,
      savedAt: now
    };
    this.savedSites.set(id, newSavedSite);
    return newSavedSite;
  }

  async getSavedSite(id: number): Promise<SavedSite | undefined> {
    return this.savedSites.get(id);
  }

  async getSavedSites(): Promise<SavedSite[]> {
    return Array.from(this.savedSites.values());
  }

  async deleteSavedSite(id: number): Promise<boolean> {
    return this.savedSites.delete(id);
  }
}

export const storage = new MemStorage();
