import { vi } from 'vitest';
import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';

// Mock database client
export const mockDb = {
  select: vi.fn().mockReturnThis(),
  from: vi.fn().mockReturnThis(),
  where: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  values: vi.fn().mockReturnThis(),
  returning: vi.fn().mockReturnValue([]),
  delete: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  set: vi.fn().mockReturnThis(),
  orderBy: vi.fn().mockReturnThis(),
  desc: vi.fn(),
  limit: vi.fn().mockReturnThis(),
};

// Mock schema objects
export const mockSchema = {
  users: {
    id: 'id',
    username: 'username',
    email: 'email',
    hashedPassword: 'hashedPassword',
    createdAt: 'createdAt',
    lastLoginAt: 'lastLoginAt',
  },
  crawls: {
    id: 'id',
    userId: 'userId',
    url: 'url',
    depth: 'depth',
    status: 'status',
    options: 'options',
    startedAt: 'startedAt',
    completedAt: 'completedAt',
    pageCount: 'pageCount',
    error: 'error',
  },
  pages: {
    id: 'id',
    crawlId: 'crawlId',
    url: 'url',
    path: 'path',
    title: 'title',
    html: 'html',
    extractedText: 'extractedText',
    content: 'content',
    language: 'language',
    createdAt: 'createdAt',
  },
  assets: {
    id: 'id',
    crawlId: 'crawlId',
    url: 'url',
    path: 'path',
    mimeType: 'mimeType',
    content: 'content',
    size: 'size',
    createdAt: 'createdAt',
  },
  savedSites: {
    id: 'id',
    userId: 'userId',
    crawlId: 'crawlId',
    url: 'url',
    name: 'name',
    description: 'description',
    savedAt: 'savedAt',
  },
  convertedSites: {
    id: 'id',
    userId: 'userId',
    crawlId: 'crawlId',
    savedSiteId: 'savedSiteId',
    url: 'url',
    name: 'name',
    framework: 'framework',
    pageCount: 'pageCount',
    componentCount: 'componentCount',
    size: 'size',
    convertedAt: 'convertedAt',
    status: 'status',
    error: 'error',
  },
};

// Reset all mocks before each test
export const resetMocks = () => {
  vi.resetAllMocks();
  
  // Configure default return values
  mockDb.select.mockReturnThis();
  mockDb.from.mockReturnThis();
  mockDb.where.mockReturnThis();
  mockDb.eq.mockReturnThis();
  mockDb.insert.mockReturnThis();
  mockDb.values.mockReturnThis();
  mockDb.returning.mockReturnValue([]);
  mockDb.delete.mockReturnThis();
  mockDb.update.mockReturnThis();
  mockDb.set.mockReturnThis();
  mockDb.orderBy.mockReturnThis();
  mockDb.limit.mockReturnThis();
};

// Setup before each test
export const setupDbMocks = () => {
  beforeEach(() => {
    resetMocks();
  });
  
  afterEach(() => {
    vi.clearAllMocks();
  });
};