import { apiRequest } from "./queryClient";
import { 
  type Crawl, 
  type CrawlOptions, 
  type Page, 
  type SavedSite 
} from "@/types";

// Crawl API functions
export async function startCrawl(url: string, depth: number, options: CrawlOptions): Promise<Crawl> {
  const response = await apiRequest("POST", "/api/crawl", { url, depth, options });
  return response.json();
}

export async function getCrawlStatus(id: string): Promise<Crawl> {
  const response = await apiRequest("GET", `/api/crawl/${id}`, undefined);
  return response.json();
}

export async function pauseCrawl(id: string): Promise<Crawl> {
  const response = await apiRequest("POST", `/api/crawl/${id}/pause`, undefined);
  return response.json();
}

export async function resumeCrawl(id: string): Promise<Crawl> {
  const response = await apiRequest("POST", `/api/crawl/${id}/resume`, undefined);
  return response.json();
}

export async function cancelCrawl(id: string): Promise<Crawl> {
  const response = await apiRequest("POST", `/api/crawl/${id}/cancel`, undefined);
  return response.json();
}

export async function getCrawlHistory(): Promise<Crawl[]> {
  const response = await apiRequest("GET", "/api/crawl/history", undefined);
  return response.json();
}

// Pages API functions
export async function getPageContent(crawlId: string, path: string): Promise<Page> {
  const response = await apiRequest("GET", `/api/pages/${crawlId}/${path}`, undefined);
  return response.json();
}

export async function getPagesByUrl(url: string): Promise<Page[]> {
  const response = await apiRequest("GET", `/api/pages?url=${encodeURIComponent(url)}`, undefined);
  return response.json();
}

// Saved sites API functions
export async function saveSite(crawlId: string, name?: string): Promise<SavedSite> {
  const response = await apiRequest("POST", "/api/sites/save", { crawlId, name });
  return response.json();
}

export async function getSavedSites(): Promise<SavedSite[]> {
  const response = await apiRequest("GET", "/api/sites/saved", undefined);
  return response.json();
}

export async function deleteSavedSite(id: string): Promise<void> {
  await apiRequest("DELETE", `/api/sites/saved/${id}`, undefined);
}

// File structure API functions
export async function getSiteStructure(crawlId: string): Promise<any> {
  const response = await apiRequest("GET", `/api/structure/${crawlId}`, undefined);
  return response.json();
}
