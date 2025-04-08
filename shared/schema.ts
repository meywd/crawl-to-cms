import { pgTable, text, serial, integer, boolean, jsonb, timestamp, varchar, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table for storing user information
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull(),
  username: varchar("username", { length: 50 }).notNull(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  lastLogin: timestamp("last_login"),
}, (table) => {
  return {
    emailIdx: uniqueIndex("email_idx").on(table.email),
    usernameIdx: uniqueIndex("username_idx").on(table.username),
  };
});

// Crawls table for storing crawl information
export const crawls = pgTable("crawls", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  url: text("url").notNull(),
  depth: integer("depth").notNull(),
  status: text("status").notNull().default("idle"),
  options: jsonb("options").notNull(),
  startedAt: timestamp("started_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
  pageCount: integer("page_count").default(0),
  error: text("error"),
});

// Pages table for storing crawled page content
export const pages = pgTable("pages", {
  id: serial("id").primaryKey(),
  crawlId: integer("crawl_id").notNull().references(() => crawls.id),
  url: text("url").notNull(),
  path: text("path").notNull(),
  content: text("content").notNull(),
  title: text("title"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Assets table for storing downloaded assets (images, CSS, JS)
export const assets = pgTable("assets", {
  id: serial("id").primaryKey(),
  crawlId: integer("crawl_id").notNull().references(() => crawls.id),
  url: text("url").notNull(),
  path: text("path").notNull(),
  type: text("type").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// SavedSites table for storing saved crawl results
export const savedSites = pgTable("saved_sites", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  crawlId: integer("crawl_id").notNull().references(() => crawls.id),
  url: text("url").notNull(),
  name: text("name"),
  pageCount: integer("page_count").notNull(),
  size: integer("size").notNull(),
  savedAt: timestamp("saved_at").notNull().defaultNow(),
});

// ConvertedSites table for storing React-converted sites
export const convertedSites = pgTable("converted_sites", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  crawlId: integer("crawl_id").notNull().references(() => crawls.id),
  savedSiteId: integer("saved_site_id").references(() => savedSites.id),
  url: text("url").notNull(),
  name: text("name"),
  framework: text("framework").notNull().default("react"),
  pageCount: integer("page_count").notNull(),
  componentCount: integer("component_count").notNull().default(0),
  size: integer("size").notNull(),
  convertedAt: timestamp("converted_at").notNull().defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  lastLogin: true
});

export const insertCrawlSchema = createInsertSchema(crawls).omit({ 
  id: true, 
  startedAt: true, 
  completedAt: true, 
  pageCount: true, 
  error: true,
  status: true
});

export const insertPageSchema = createInsertSchema(pages).omit({ 
  id: true, 
  createdAt: true 
});

export const insertAssetSchema = createInsertSchema(assets).omit({ 
  id: true, 
  createdAt: true 
});

export const insertSavedSiteSchema = createInsertSchema(savedSites).omit({ 
  id: true, 
  savedAt: true 
});

export const insertConvertedSiteSchema = createInsertSchema(convertedSites).omit({
  id: true,
  convertedAt: true
});

// Authentication schemas
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

export const registerSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email(),
  password: z.string().min(6),
  confirmPassword: z.string().min(6)
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Crawl = typeof crawls.$inferSelect;
export type InsertCrawl = z.infer<typeof insertCrawlSchema>;
export type Page = typeof pages.$inferSelect;
export type InsertPage = z.infer<typeof insertPageSchema>;
export type Asset = typeof assets.$inferSelect;
export type InsertAsset = z.infer<typeof insertAssetSchema>;
export type SavedSite = typeof savedSites.$inferSelect;
export type InsertSavedSite = z.infer<typeof insertSavedSiteSchema>;
export type ConvertedSite = typeof convertedSites.$inferSelect;
export type InsertConvertedSite = z.infer<typeof insertConvertedSiteSchema>;

// Options schema
export const crawlOptionsSchema = z.object({
  downloadImages: z.boolean().default(true),
  preserveCss: z.boolean().default(true),
  preserveNav: z.boolean().default(true),
  respectRobots: z.boolean().default(true),
});

export type CrawlOptions = z.infer<typeof crawlOptionsSchema>;
