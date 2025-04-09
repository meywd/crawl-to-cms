import { describe, it, expect, beforeEach, jest, afterEach } from '@jest/globals';
import { ReactConverter } from '../../server/react-converter';
import { vi } from 'vitest';
import { IStorage } from '../../server/storage';
import JSZip from 'jszip';

// Mock JSZip
vi.mock('jszip', () => {
  return {
    default: jest.fn().mockImplementation(() => {
      const folders: Record<string, any> = {};
      const files: Record<string, string> = {};
      
      return {
        folder: jest.fn((name) => {
          folders[name] = {
            file: jest.fn((filename, content) => {
              files[`${name}/${filename}`] = content;
            }),
            folder: jest.fn((subName) => {
              const subFolderName = `${name}/${subName}`;
              folders[subFolderName] = {
                file: jest.fn((filename, content) => {
                  files[`${subFolderName}/${filename}`] = content;
                })
              };
              return folders[subFolderName];
            })
          };
          return folders[name];
        }),
        file: jest.fn((filename, content) => {
          files[filename] = content;
        }),
        generateAsync: jest.fn().mockResolvedValue(Buffer.from('mock-zip-content')),
        _files: files,
        _folders: folders
      };
    })
  };
});

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

describe('ReactConverter', () => {
  let converter: ReactConverter;
  let mockStorage: IStorage;

  beforeEach(() => {
    mockStorage = createMockStorage();
    converter = new ReactConverter(mockStorage);
    
    // Reset JSZip mock
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('convertToReact', () => {
    it('should create a React project from a crawled site', async () => {
      // Mock crawl data
      const mockCrawl = {
        id: 1,
        userId: 1,
        url: 'https://example.com',
        depth: 2,
        status: 'completed',
        options: { 
          preserveCss: true, 
          preserveNav: true, 
          respectRobots: true, 
          downloadImages: true 
        },
        startedAt: new Date(),
        completedAt: new Date(),
        pageCount: 3,
        error: null
      };
      
      // Mock pages
      const mockPages = [
        {
          id: 1,
          crawlId: 1,
          url: 'https://example.com',
          path: '/',
          content: '<html><head><title>Home</title></head><body><h1>Home Page</h1></body></html>',
          title: 'Home',
          createdAt: new Date()
        },
        {
          id: 2,
          crawlId: 1,
          url: 'https://example.com/about',
          path: '/about',
          content: '<html><head><title>About</title></head><body><h1>About Page</h1></body></html>',
          title: 'About',
          createdAt: new Date()
        },
        {
          id: 3,
          crawlId: 1,
          url: 'https://example.com/contact',
          path: '/contact',
          content: '<html><head><title>Contact</title></head><body><h1>Contact Page</h1></body></html>',
          title: 'Contact',
          createdAt: new Date()
        }
      ];
      
      // Mock assets
      const mockAssets = [
        {
          id: 1,
          crawlId: 1,
          url: 'https://example.com/style.css',
          path: '/style.css',
          type: 'text/css',
          content: 'body { font-family: Arial; }',
          createdAt: new Date()
        }
      ];
      
      // Mock storage responses
      (mockStorage.getCrawl as jest.Mock).mockResolvedValue(mockCrawl);
      (mockStorage.getPagesByCrawlId as jest.Mock).mockResolvedValue(mockPages);
      (mockStorage.getAssetsByCrawlId as jest.Mock).mockResolvedValue(mockAssets);
      
      // Mock the converted site creation
      (mockStorage.getConvertedSiteByCrawlId as jest.Mock).mockResolvedValue(undefined);
      (mockStorage.createConvertedSite as jest.Mock).mockImplementation(async (site) => ({
        ...site,
        id: 1,
        convertedAt: new Date()
      }));
      
      // Call convertToReact
      const result = await converter.convertToReact(1);
      
      // Verify a zip was created
      expect(result).toBeDefined();
      expect(JSZip).toHaveBeenCalled();
      
      // Verify converted site was recorded in the database
      expect(mockStorage.createConvertedSite).toHaveBeenCalled();
      
      // The JSZip mock doesn't actually create files, so we can't check file content
      // In a real test, we would extract the zip and verify the content
    });
    
    it('should handle errors during conversion', async () => {
      // Mock storage to throw an error
      (mockStorage.getCrawl as jest.Mock).mockRejectedValue(new Error('Database error'));
      
      // Call convertToReact and expect it to throw
      await expect(converter.convertToReact(1)).rejects.toThrow();
    });
  });
});