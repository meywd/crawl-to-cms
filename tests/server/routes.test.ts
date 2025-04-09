import { describe, it, expect, beforeEach, jest, afterEach } from '@jest/globals';
import express, { Express } from 'express';
import { vi } from 'vitest';
import supertest from 'supertest';
import { registerRoutes } from '../../server/routes';

// Mock the imports
vi.mock('../../server/storage', () => ({
  storage: {
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
  }
}));

vi.mock('../../server/crawler', () => ({
  WebCrawler: vi.fn().mockImplementation(() => ({
    startCrawl: vi.fn().mockResolvedValue(1),
    pauseCrawl: vi.fn().mockResolvedValue(undefined),
    resumeCrawl: vi.fn().mockResolvedValue(undefined),
    cancelCrawl: vi.fn().mockResolvedValue(undefined)
  }))
}));

vi.mock('../../server/react-converter', () => ({
  ReactConverter: vi.fn().mockImplementation(() => ({
    convertToReact: vi.fn().mockResolvedValue({
      generateAsync: vi.fn().mockResolvedValue(Buffer.from('mock-zip-content'))
    })
  }))
}));

vi.mock('../../server/auth', () => ({
  isAuthenticated: (req: any, res: any, next: any) => {
    if (req.session?.userId) {
      next();
    } else {
      res.status(401).json({ message: 'Unauthorized' });
    }
  },
  getUserId: (req: any) => req.session?.userId || null,
  hashPassword: vi.fn().mockResolvedValue('hashed_password'),
  registerUser: vi.fn().mockResolvedValue({ id: 1, username: 'testuser' })
}));

vi.mock('passport', () => ({
  default: {
    authenticate: vi.fn((strategy, callback) => {
      return (req: any, res: any, next: any) => {
        if (req.body.email === 'valid@example.com') {
          callback(null, { id: 1, username: 'testuser' }, { message: 'Success' })(req, res, next);
        } else {
          callback(null, false, { message: 'Invalid credentials' })(req, res, next);
        }
      };
    }),
    initialize: vi.fn().mockReturnValue((req: any, res: any, next: any) => next()),
    session: vi.fn().mockReturnValue((req: any, res: any, next: any) => next())
  }
}));

vi.mock('express-session', () => {
  return vi.fn().mockImplementation(() => {
    return (req: any, res: any, next: any) => {
      req.session = {
        userId: req.headers['x-mock-user-id'] ? parseInt(req.headers['x-mock-user-id']) : undefined,
        save: (callback: Function) => callback()
      };
      next();
    };
  });
});

describe('API Routes', () => {
  let app: Express;
  let request: supertest.SuperTest<supertest.Test>;
  
  beforeEach(async () => {
    app = express();
    app.use(express.json());
    
    // Register routes and await server initialization
    const server = await registerRoutes(app);
    
    request = supertest(app);
    
    // Reset mocks
    vi.clearAllMocks();
  });
  
  afterEach(() => {
    vi.clearAllMocks();
  });
  
  describe('Authentication Routes', () => {
    describe('POST /api/auth/register', () => {
      it('should register a new user', async () => {
        const response = await request
          .post('/api/auth/register')
          .send({
            username: 'newuser',
            email: 'newuser@example.com',
            password: 'password123',
            confirmPassword: 'password123'
          });
        
        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('id');
        expect(response.body).toHaveProperty('username', 'testuser');
      });
    });
    
    describe('POST /api/auth/login', () => {
      it('should login a user with valid credentials', async () => {
        const response = await request
          .post('/api/auth/login')
          .send({
            email: 'valid@example.com',
            password: 'password123'
          });
        
        expect(response.status).toBe(200);
      });
      
      it('should reject login with invalid credentials', async () => {
        const response = await request
          .post('/api/auth/login')
          .send({
            email: 'invalid@example.com',
            password: 'wrongpassword'
          });
        
        expect(response.status).toBe(401);
      });
    });
    
    describe('GET /api/auth/me', () => {
      it('should return user information for authenticated users', async () => {
        // Mock storage.getUser
        const { storage } = require('../../server/storage');
        storage.getUser.mockResolvedValue({
          id: 1,
          username: 'testuser',
          email: 'test@example.com'
        });
        
        const response = await request
          .get('/api/auth/me')
          .set('x-mock-user-id', '1');
        
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('id', 1);
        expect(response.body).toHaveProperty('username', 'testuser');
      });
      
      it('should return 401 for unauthenticated users', async () => {
        const response = await request.get('/api/auth/me');
        
        expect(response.status).toBe(401);
      });
    });
  });
  
  describe('Crawl Routes', () => {
    describe('POST /api/crawl', () => {
      it('should start a new crawl', async () => {
        // Mock the WebCrawler.startCrawl method
        const { WebCrawler } = require('../../server/crawler');
        WebCrawler.prototype.startCrawl.mockResolvedValue(1);
        
        const response = await request
          .post('/api/crawl')
          .set('x-mock-user-id', '1')
          .send({
            url: 'https://example.com',
            depth: 2,
            options: {
              preserveCss: true,
              preserveNav: true,
              respectRobots: true,
              downloadImages: true
            }
          });
        
        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('crawlId', 1);
      });
    });
    
    describe('GET /api/crawl/history', () => {
      it('should return crawl history for a user', async () => {
        // Mock storage.getCrawlHistory
        const { storage } = require('../../server/storage');
        storage.getCrawlHistory.mockResolvedValue([
          {
            id: 1,
            url: 'https://example.com',
            status: 'completed',
            pageCount: 10
          }
        ]);
        
        const response = await request
          .get('/api/crawl/history')
          .set('x-mock-user-id', '1');
        
        expect(response.status).toBe(200);
        expect(response.body).toBeInstanceOf(Array);
        expect(response.body).toHaveLength(1);
        expect(response.body[0]).toHaveProperty('id', 1);
      });
    });
  });
  
  describe('Saved Sites Routes', () => {
    describe('GET /api/sites/saved', () => {
      it('should return saved sites for a user', async () => {
        // Mock storage.getSavedSites
        const { storage } = require('../../server/storage');
        storage.getSavedSites.mockResolvedValue([
          {
            id: 1,
            url: 'https://example.com',
            name: 'Example Site',
            pageCount: 10
          }
        ]);
        
        const response = await request
          .get('/api/sites/saved')
          .set('x-mock-user-id', '1');
        
        expect(response.status).toBe(200);
        expect(response.body).toBeInstanceOf(Array);
        expect(response.body).toHaveLength(1);
        expect(response.body[0]).toHaveProperty('id', 1);
      });
    });
  });
  
  describe('Converted Sites Routes', () => {
    describe('GET /api/sites/converted', () => {
      it('should return converted sites for a user', async () => {
        // Mock storage.getConvertedSites
        const { storage } = require('../../server/storage');
        storage.getConvertedSites.mockResolvedValue([
          {
            id: 1,
            url: 'https://example.com',
            name: 'Example React Site',
            framework: 'react',
            status: 'completed',
            pageCount: 10
          }
        ]);
        
        const response = await request
          .get('/api/sites/converted')
          .set('x-mock-user-id', '1');
        
        expect(response.status).toBe(200);
        expect(response.body).toBeInstanceOf(Array);
        expect(response.body).toHaveLength(1);
        expect(response.body[0]).toHaveProperty('id', 1);
      });
    });
  });
});