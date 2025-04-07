// Type definitions for the application

// Crawl status types
export type CrawlStatus = "idle" | "in_progress" | "paused" | "completed" | "error" | "cancelled";

// Crawl log entry
export interface CrawlLog {
  id: number;
  status: "success" | "warning" | "error" | "info";
  message: string;
  timestamp?: string;
}

// Page types
export interface Page {
  id: string;
  url: string;
  title: string;
  content: string;
  crawlId: string;
  path: string;
  createdAt: string;
}

// Crawl types
export interface Crawl {
  id: string;
  url: string;
  depth: number;
  options: CrawlOptions;
  status: CrawlStatus;
  startedAt: string;
  completedAt?: string;
  pageCount: number;
  error?: string;
}

// Crawl options
export interface CrawlOptions {
  downloadImages: boolean;
  preserveCss: boolean;
  preserveNav: boolean;
  respectRobots: boolean;
}

// Saved site
export interface SavedSite {
  id: string;
  crawlId: string; // Added crawlId to match server schema
  url: string;
  name?: string;  // Added name which is in the schema
  pageCount: number;
  size: number;
  savedAt: string;
}

// API error response
export interface ApiError {
  message: string;
  code?: string;
}
