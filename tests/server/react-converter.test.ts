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

  describe('Image URL processing', () => {
    it('should transform image URLs to use ES Module compatible imports', async () => {
      // Create mock storage
      const mockCrawl = {
        id: 123,
        userId: 1,
        url: 'https://example.com',
        depth: 1,
        status: 'completed',
        options: { 
          preserveCss: true, 
          preserveNav: true, 
          respectRobots: true, 
          downloadImages: true 
        },
        startedAt: new Date(),
        completedAt: new Date(),
        pageCount: 1,
        error: null
      };
      
      // Create a page with image tags
      const mockPage = {
        id: 1,
        crawlId: 123,
        url: 'https://example.com',
        path: '/',
        content: `
          <html>
            <head><title>Image Test</title></head>
            <body>
              <img src="/api/assets/123/assets/images/logo.png" alt="Logo">
              <img src="/api/assets/123/assets/images/banner.jpg" alt="Banner">
              <img src="https://external-site.com/image.jpg" alt="External">
            </body>
          </html>
        `,
        title: 'Image Test',
        createdAt: new Date()
      };
      
      // Mock storage responses
      (mockStorage.getCrawl as jest.Mock).mockResolvedValue(mockCrawl);
      (mockStorage.getPagesByCrawlId as jest.Mock).mockResolvedValue([mockPage]);
      (mockStorage.getAssetsByCrawlId as jest.Mock).mockResolvedValue([]);
      (mockStorage.getConvertedSiteByCrawlId as jest.Mock).mockResolvedValue(undefined);
      
      // Create a custom JSZip instance to capture the generated files
      let pagesFolder: Record<string, string> = {};
      
      // Mock JSZip instance
      const mockJSZip = {
        file: jest.fn(),
        folder: jest.fn().mockImplementation((name) => {
          // Mock the pages folder
          if (name === 'src') {
            return {
              folder: jest.fn().mockImplementation((subfolder) => {
                if (subfolder === 'pages') {
                  return {
                    folder: jest.fn().mockImplementation((subsubFolder) => {
                      if (subsubFolder === 'public') {
                        return {
                          file: jest.fn((fileName, content) => {
                            pagesFolder[fileName] = content;
                          })
                        };
                      }
                      return { file: jest.fn() };
                    })
                  };
                }
                return { folder: jest.fn().mockReturnValue({ file: jest.fn() }) };
              }),
              file: jest.fn()
            };
          }
          return { 
            folder: jest.fn().mockReturnValue({ file: jest.fn() }),
            file: jest.fn() 
          };
        }),
        generateAsync: jest.fn().mockResolvedValue(Buffer.from('mock-zip'))
      };
      
      // Mock JSZip constructor to return our mock
      (JSZip as jest.Mock).mockReturnValue(mockJSZip);
      
      // Call convertToReact
      await converter.convertToReact(123);
      
      // Check that image URLs were converted to ESM syntax
      let foundValidImageTransformation = false;
      
      // Look through the generated page components
      for (const fileName in pagesFolder) {
        const content = pagesFolder[fileName];
        // The ESM image import pattern should NOT use require()
        expect(content).not.toContain('require(');
        
        // Instead, it should use import.meta.url
        if (content.includes('import.meta.url')) {
          foundValidImageTransformation = true;
        }
      }
      
      // Make sure at least one image was transformed
      expect(foundValidImageTransformation).toBe(true);
    });
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
    
    it('should create a project with proper ES module syntax', async () => {
      // Mock crawl with English content
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
        pageCount: 1,
        error: null
      };
      
      // Create a complex page with text in English to test language detection
      const mockPages = [
        {
          id: 1,
          crawlId: 1,
          url: 'https://example.com',
          path: '/',
          content: `
            <html>
              <head>
                <title>Test Page</title>
                <meta name="description" content="Test description">
              </head>
              <body>
                <h1>Test Content in English</h1>
                <p>This is a paragraph with English text to test language detection.</p>
                <img src="/api/assets/1/assets/image.jpg" alt="Test Image">
                <div class="section">
                  <h2>Section Title</h2>
                  <p>More English content for testing.</p>
                </div>
              </body>
            </html>
          `,
          title: 'Test Page',
          createdAt: new Date()
        }
      ];
      
      // Mock an image asset
      const mockAssets = [
        {
          id: 1,
          crawlId: 1,
          url: 'https://example.com/assets/image.jpg',
          path: '/assets/image.jpg',
          type: 'image',
          content: 'test-image-content', // This would be base64 encoded in real usage
          createdAt: new Date()
        }
      ];
      
      // Set up mocks
      (mockStorage.getCrawl as jest.Mock).mockResolvedValue(mockCrawl);
      (mockStorage.getPagesByCrawlId as jest.Mock).mockResolvedValue(mockPages);
      (mockStorage.getAssetsByCrawlId as jest.Mock).mockResolvedValue(mockAssets);
      (mockStorage.getConvertedSiteByCrawlId as jest.Mock).mockResolvedValue(undefined);
      (mockStorage.createConvertedSite as jest.Mock).mockImplementation(async (site) => ({
        ...site,
        id: 1,
        convertedAt: new Date()
      }));
      
      // Capture the JSZip mock internal state
      let jsZipFileContents: Record<string, string> = {};
      
      // Override the file method to capture file contents
      const originalJSZip = JSZip();
      const originalFileMethod = originalJSZip.file;
      
      originalJSZip.file = jest.fn((path, content) => {
        jsZipFileContents[path] = content;
        return originalFileMethod(path, content);
      });
      
      // Call convertToReact
      await converter.convertToReact(1);
      
      // Check package.json has proper module type
      expect(jsZipFileContents).toHaveProperty('package.json');
      if (jsZipFileContents['package.json']) {
        const packageJson = JSON.parse(jsZipFileContents['package.json']);
        expect(packageJson.type).toBe('module');
      }
      
      // Check seed.ts for proper import syntax without require()
      expect(jsZipFileContents).toHaveProperty('prisma/seed.ts');
      if (jsZipFileContents['prisma/seed.ts']) {
        // Verify there are no require() calls
        expect(jsZipFileContents['prisma/seed.ts']).not.toContain('require(');
        // Verify proper ES module imports
        expect(jsZipFileContents['prisma/seed.ts']).toContain('import { PrismaClient }');
      }
    });
    
    it('should handle errors during conversion', async () => {
      // Mock storage to throw an error
      (mockStorage.getCrawl as jest.Mock).mockRejectedValue(new Error('Database error'));
      
      // Call convertToReact and expect it to throw
      await expect(converter.convertToReact(1)).rejects.toThrow();
    });
  });
});