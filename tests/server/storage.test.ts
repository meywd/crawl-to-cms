import { describe, it, expect, beforeEach, jest, afterEach } from '@jest/globals';
import { mockDb, resetMocks } from '../mocks/db';
import { vi } from 'vitest';

// Mock the drizzle import
vi.mock('../../server/db', () => ({
  db: mockDb,
  pool: {}
}));

// Import the storage class after mocking drizzle
import { DatabaseStorage } from '../../server/storage';

describe('DatabaseStorage', () => {
  let storage: DatabaseStorage;

  beforeEach(() => {
    resetMocks();
    storage = new DatabaseStorage();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('User operations', () => {
    describe('createUser', () => {
      it('should insert a user and return the created user', async () => {
        const mockUser = {
          id: 1,
          email: 'test@example.com',
          username: 'testuser',
          passwordHash: 'hashedpassword',
          createdAt: new Date(),
          lastLogin: null
        };

        mockDb.returning.mockResolvedValueOnce([mockUser]);

        const insertUser = {
          email: 'test@example.com',
          username: 'testuser',
          passwordHash: 'hashedpassword'
        };

        const result = await storage.createUser(insertUser);

        expect(mockDb.insert).toHaveBeenCalled();
        expect(mockDb.values).toHaveBeenCalledWith(insertUser);
        expect(mockDb.returning).toHaveBeenCalled();
        expect(result).toEqual(mockUser);
      });
    });

    describe('getUser', () => {
      it('should retrieve a user by id', async () => {
        const mockUser = {
          id: 1,
          email: 'test@example.com',
          username: 'testuser',
          passwordHash: 'hashedpassword',
          createdAt: new Date(),
          lastLogin: null
        };

        mockDb.select.mockImplementationOnce(() => mockDb);
        mockDb.from.mockImplementationOnce(() => mockDb);
        mockDb.where.mockImplementationOnce(() => mockDb);
        mockDb.eq.mockImplementationOnce(() => mockDb);
        mockDb.returning.mockResolvedValueOnce([mockUser]);

        const result = await storage.getUser(1);

        expect(mockDb.select).toHaveBeenCalled();
        expect(mockDb.from).toHaveBeenCalled();
        expect(mockDb.where).toHaveBeenCalled();
        expect(result).toEqual(mockUser);
      });

      it('should return undefined if user is not found', async () => {
        mockDb.select.mockImplementationOnce(() => mockDb);
        mockDb.from.mockImplementationOnce(() => mockDb);
        mockDb.where.mockImplementationOnce(() => mockDb);
        mockDb.eq.mockImplementationOnce(() => mockDb);
        mockDb.returning.mockResolvedValueOnce([]);

        const result = await storage.getUser(999);

        expect(mockDb.select).toHaveBeenCalled();
        expect(mockDb.from).toHaveBeenCalled();
        expect(mockDb.where).toHaveBeenCalled();
        expect(result).toBeUndefined();
      });
    });

    describe('getUserByUsername', () => {
      it('should retrieve a user by username', async () => {
        const mockUser = {
          id: 1,
          email: 'test@example.com',
          username: 'testuser',
          passwordHash: 'hashedpassword',
          createdAt: new Date(),
          lastLogin: null
        };

        mockDb.select.mockImplementationOnce(() => mockDb);
        mockDb.from.mockImplementationOnce(() => mockDb);
        mockDb.where.mockImplementationOnce(() => mockDb);
        mockDb.eq.mockImplementationOnce(() => mockDb);
        mockDb.returning.mockResolvedValueOnce([mockUser]);

        const result = await storage.getUserByUsername('testuser');

        expect(mockDb.select).toHaveBeenCalled();
        expect(mockDb.from).toHaveBeenCalled();
        expect(mockDb.where).toHaveBeenCalled();
        expect(result).toEqual(mockUser);
      });
    });
  });

  describe('Crawl operations', () => {
    describe('createCrawl', () => {
      it('should insert a crawl and return the created crawl', async () => {
        const mockCrawl = {
          id: 1,
          userId: 1,
          url: 'https://example.com',
          depth: 2,
          status: 'idle',
          options: { preserveCss: true, preserveNav: true, respectRobots: true, downloadImages: true },
          startedAt: new Date(),
          completedAt: null,
          pageCount: 0,
          error: null
        };

        mockDb.returning.mockResolvedValueOnce([mockCrawl]);

        const insertCrawl = {
          userId: 1,
          url: 'https://example.com',
          depth: 2,
          options: { preserveCss: true, preserveNav: true, respectRobots: true, downloadImages: true }
        };

        const result = await storage.createCrawl(insertCrawl);

        expect(mockDb.insert).toHaveBeenCalled();
        expect(mockDb.values).toHaveBeenCalledWith(insertCrawl);
        expect(mockDb.returning).toHaveBeenCalled();
        expect(result).toEqual(mockCrawl);
      });
    });

    describe('updateCrawlStatus', () => {
      it('should update a crawl status', async () => {
        const mockCrawl = {
          id: 1,
          userId: 1,
          url: 'https://example.com',
          depth: 2,
          status: 'running',
          options: { preserveCss: true, preserveNav: true, respectRobots: true, downloadImages: true },
          startedAt: new Date(),
          completedAt: null,
          pageCount: 0,
          error: null
        };

        mockDb.update.mockImplementationOnce(() => mockDb);
        mockDb.set.mockImplementationOnce(() => mockDb);
        mockDb.where.mockImplementationOnce(() => mockDb);
        mockDb.eq.mockImplementationOnce(() => mockDb);
        mockDb.returning.mockResolvedValueOnce([mockCrawl]);

        const result = await storage.updateCrawlStatus(1, 'running');

        expect(mockDb.update).toHaveBeenCalled();
        expect(mockDb.set).toHaveBeenCalledWith({ status: 'running' });
        expect(mockDb.where).toHaveBeenCalled();
        expect(mockDb.returning).toHaveBeenCalled();
        expect(result).toEqual(mockCrawl);
      });
    });
  });

  describe('Page operations', () => {
    describe('createPage', () => {
      it('should insert a page and return the created page', async () => {
        const mockPage = {
          id: 1,
          crawlId: 1,
          url: 'https://example.com/page',
          path: '/page',
          content: '<html><body>Test</body></html>',
          title: 'Test Page',
          createdAt: new Date()
        };

        mockDb.returning.mockResolvedValueOnce([mockPage]);

        const insertPage = {
          crawlId: 1,
          url: 'https://example.com/page',
          path: '/page',
          content: '<html><body>Test</body></html>',
          title: 'Test Page'
        };

        const result = await storage.createPage(insertPage);

        expect(mockDb.insert).toHaveBeenCalled();
        expect(mockDb.values).toHaveBeenCalledWith(insertPage);
        expect(mockDb.returning).toHaveBeenCalled();
        expect(result).toEqual(mockPage);
      });
    });
  });

  describe('Asset operations', () => {
    describe('createAsset', () => {
      it('should insert an asset and return the created asset', async () => {
        const mockAsset = {
          id: 1,
          crawlId: 1,
          url: 'https://example.com/image.jpg',
          path: '/assets/image.jpg',
          type: 'image/jpeg',
          content: 'base64content',
          createdAt: new Date()
        };

        mockDb.returning.mockResolvedValueOnce([mockAsset]);

        const insertAsset = {
          crawlId: 1,
          url: 'https://example.com/image.jpg',
          path: '/assets/image.jpg',
          type: 'image/jpeg',
          content: 'base64content'
        };

        const result = await storage.createAsset(insertAsset);

        expect(mockDb.insert).toHaveBeenCalled();
        expect(mockDb.values).toHaveBeenCalledWith(insertAsset);
        expect(mockDb.returning).toHaveBeenCalled();
        expect(result).toEqual(mockAsset);
      });
    });
  });

  describe('SavedSite operations', () => {
    describe('createSavedSite', () => {
      it('should insert a saved site and return the created saved site', async () => {
        const mockSavedSite = {
          id: 1,
          userId: 1,
          crawlId: 1,
          url: 'https://example.com',
          name: 'Example Site',
          pageCount: 10,
          size: 1024000,
          savedAt: new Date()
        };

        mockDb.returning.mockResolvedValueOnce([mockSavedSite]);

        const insertSavedSite = {
          userId: 1,
          crawlId: 1,
          url: 'https://example.com',
          name: 'Example Site',
          pageCount: 10,
          size: 1024000
        };

        const result = await storage.createSavedSite(insertSavedSite);

        expect(mockDb.insert).toHaveBeenCalled();
        expect(mockDb.values).toHaveBeenCalledWith(insertSavedSite);
        expect(mockDb.returning).toHaveBeenCalled();
        expect(result).toEqual(mockSavedSite);
      });
    });
  });

  describe('ConvertedSite operations', () => {
    describe('createConvertedSite', () => {
      it('should insert a converted site and return the created converted site', async () => {
        const mockConvertedSite = {
          id: 1,
          userId: 1,
          crawlId: 1,
          savedSiteId: 1,
          url: 'https://example.com',
          name: 'Example React Site',
          framework: 'react',
          pageCount: 10,
          componentCount: 15,
          size: 2048000,
          status: 'completed',
          error: null,
          convertedAt: new Date()
        };

        mockDb.returning.mockResolvedValueOnce([mockConvertedSite]);

        const insertConvertedSite = {
          userId: 1,
          crawlId: 1,
          savedSiteId: 1,
          url: 'https://example.com',
          name: 'Example React Site',
          framework: 'react',
          pageCount: 10,
          componentCount: 15,
          size: 2048000,
          status: 'completed'
        };

        const result = await storage.createConvertedSite(insertConvertedSite);

        expect(mockDb.insert).toHaveBeenCalled();
        expect(mockDb.values).toHaveBeenCalledWith(insertConvertedSite);
        expect(mockDb.returning).toHaveBeenCalled();
        expect(result).toEqual(mockConvertedSite);
      });
    });
  });
});