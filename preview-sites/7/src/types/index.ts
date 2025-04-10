// User types
export interface User {
  id: number;
  email: string;
  name: string | null;
  role: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  name: string;
  password: string;
}

// Language types
export interface Language {
  id: number;
  code: string;
  name: string;
  isActive: boolean;
}

// Menu types
export interface MenuItem {
  id: number;
  languageId: number;
  language?: Language;
  title: string;
  slug: string;
  order: number;
  parentId: number | null;
  parent?: MenuItem | null;
  children?: MenuItem[];
  isActive: boolean;
  pageId: number | null;
  page?: Page | null;
  externalUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

// Page types
export interface Page {
  id: number;
  slug: string;
  contents?: PageContent[];
  sections?: Section[];
  createdAt: string;
  updatedAt: string;
}

export interface PageContent {
  id: number;
  pageId: number;
  languageId: number;
  language?: Language;
  title: string;
  description: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Section {
  id: number;
  pageId: number;
  languageId: number;
  language?: Language;
  type: string;
  order: number;
  title: string | null;
  content: string | null;
  imageUrl: string | null;
  settings: Record<string, any> | null;
  createdAt: string;
  updatedAt: string;
}

// Settings types
export interface Setting {
  id: number;
  key: string;
  value: string;
  createdAt: string;
  updatedAt: string;
}

// API response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}
