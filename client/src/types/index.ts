// Type definitions for the application

// User types
export interface User {
  id: string;
  username: string;
  email: string;
  createdAt: string;
  lastLogin?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  message?: string;
}

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
  userId: string;
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
  userId: string;
  crawlId: string;
  url: string;
  name?: string;
  pageCount: number;
  size: number;
  savedAt: string;
}

// Converted site status
export type ConversionStatus = "in_progress" | "completed" | "failed";

// Converted site
export interface ConvertedSite {
  id: string;
  userId: string;
  crawlId: string;
  url: string;
  name?: string;
  pageCount: number;
  size: number;
  convertedAt: string;
  status?: ConversionStatus;
  reactVersion?: string;
  framework?: string;
  error?: string;
}

// API error response
export interface ApiError {
  message: string;
  code?: string;
}
