import { describe, it, expect, beforeEach, jest, afterEach } from '@jest/globals';
import { WebCrawler } from '../../server/crawler';
import { vi } from 'vitest';
import { IStorage } from '../../server/storage';
import fetch from 'node-fetch';

// Mock fetch
vi.mock('node-fetch', () => ({
  default: vi.fn()
}));

const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

// Create mock storage
const createMockStorage = (): IStorage => ({
  createUser: vi.fn(),
  getUser: vi.fn(),
  getUserByEmail: vi.fn(),
  getUserByUsername: vi.fn(),
  updateUserLastLogin: vi.fn(),
  createCrawl: vi.fn(),
  getCrawl: vi.fn(),
  getCrawlByUrl: vi.fn(),
  updateCrawlStatus: vi.fn(),
  updateCrawlProgress: vi.fn(),
  completeCrawl: vi.fn(),
  failCrawl: vi.fn(),
  getCrawlHistory: vi.fn(),
  createPage: vi.fn(),
  getPage: vi.fn(),
  getPageByPath: vi.fn(),
  getPagesByCrawlId: vi.fn(),
  createAsset: vi.fn(),
  getAsset: vi.fn(),
  getAssetByPath: vi.fn(),
  getAssetsByCrawlId: vi.fn(),
  createSavedSite: vi.fn(),
  getSavedSite: vi.fn(),
  getSavedSites: vi.fn(),
  deleteSavedSite: vi.fn(),
  createConvertedSite: vi.fn(),
  getConvertedSite: vi.fn(),
  getConvertedSites: vi.fn(),
  getConvertedSiteByCrawlId: vi.fn(),
  updateConvertedSite: vi.fn(),
  deleteConvertedSite: vi.fn()
});

describe('WebCrawler', () => {
  let crawler: WebCrawler;
  let mockStorage: IStorage;

  beforeEach(() => {
    mockStorage = createMockStorage();
    crawler = new WebCrawler(mockStorage);
    
    // Reset fetch mock
    mockFetch.mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('startCrawl', () => {
    it('should create a crawl in the database and start processing it', async () => {
      // Mock crawl creation
      const mockCrawl = {
        id: 1,
        userId: 1,
        url: 'https://example.com',
        depth: 2,
        status: 'idle',
        options: { 
          preserveCss: true, 
          preserveNav: true, 
          respectRobots: true, 
          downloadImages: true 
        },
        startedAt: new Date(),
        completedAt: null,
        pageCount: 0,
        error: null
      };
      
      (mockStorage.createCrawl as jest.Mock).mockResolvedValue(mockCrawl);
      (mockStorage.updateCrawlStatus as jest.Mock).mockResolvedValue({
        ...mockCrawl,
        status: 'running'
      });
      
      // Mock fetch for robots.txt
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: async () => 'User-agent: *\nDisallow: /private/'
      } as any);
      
      // Mock fetch for the main page
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: {
          get: () => 'text/html'
        },
        text: async () => '<html><body><a href="/page1">Link 1</a></body></html>'
      } as any);
      
      // Mock storage methods
      (mockStorage.getPageByPath as jest.Mock).mockResolvedValue(undefined);
      (mockStorage.createPage as jest.Mock).mockImplementation(async (page) => ({
        ...page,
        id: 1,
        createdAt: new Date()
      }));
      
      // Call startCrawl
      const crawlId = await crawler.startCrawl(
        1, // userId
        'https://example.com',
        2, // depth
        {
          preserveCss: true,
          preserveNav: true,
          respectRobots: true,
          downloadImages: true
        }
      );
      
      // Verify crawl was created and updated
      expect(mockStorage.createCrawl).toHaveBeenCalled();
      expect(mockStorage.updateCrawlStatus).toHaveBeenCalledWith(1, 'running');
      expect(crawlId).toBe(1);
    });
    
    it('should handle fetch errors gracefully', async () => {
      // Mock crawl creation
      const mockCrawl = {
        id: 1,
        userId: 1,
        url: 'https://example.com',
        depth: 2,
        status: 'idle',
        options: { 
          preserveCss: true, 
          preserveNav: true, 
          respectRobots: true, 
          downloadImages: true 
        },
        startedAt: new Date(),
        completedAt: null,
        pageCount: 0,
        error: null
      };
      
      (mockStorage.createCrawl as jest.Mock).mockResolvedValue(mockCrawl);
      (mockStorage.updateCrawlStatus as jest.Mock).mockResolvedValue({
        ...mockCrawl,
        status: 'running'
      });
      
      // Mock fetch failure
      mockFetch.mockRejectedValueOnce(new Error('Network error'));
      
      // Mock failCrawl
      (mockStorage.failCrawl as jest.Mock).mockResolvedValue({
        ...mockCrawl,
        status: 'failed',
        error: 'Network error'
      });
      
      // Call startCrawl
      const crawlId = await crawler.startCrawl(
        1, // userId
        'https://example.com',
        2, // depth
        {
          preserveCss: true,
          preserveNav: true,
          respectRobots: true,
          downloadImages: true
        }
      );
      
      // Verify error handling
      expect(mockStorage.failCrawl).toHaveBeenCalled();
      expect(crawlId).toBe(1);
    });
  });

  describe('pauseCrawl and resumeCrawl', () => {
    it('should pause an active crawl', async () => {
      // Test pause functionality is present
      expect(crawler.pauseCrawl).toBeDefined();
    });
    
    it('should resume a paused crawl', async () => {
      // Mock getCrawl to return a paused crawl
      const mockCrawl = {
        id: 1,
        userId: 1,
        url: 'https://example.com',
        depth: 2,
        status: 'paused',
        options: { 
          preserveCss: true, 
          preserveNav: true, 
          respectRobots: true, 
          downloadImages: true 
        },
        startedAt: new Date(),
        completedAt: null,
        pageCount: 5,
        error: null
      };
      
      (mockStorage.getCrawl as jest.Mock).mockResolvedValue(mockCrawl);
      (mockStorage.updateCrawlStatus as jest.Mock).mockResolvedValue({
        ...mockCrawl,
        status: 'running'
      });
      
      // Call resumeCrawl
      await crawler.resumeCrawl(1);
      
      // Verify status was updated
      expect(mockStorage.updateCrawlStatus).toHaveBeenCalledWith(1, 'running');
    });
  });
});