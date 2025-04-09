import { describe, it, expect } from '@jest/globals';
import { 
  insertUserSchema, 
  insertCrawlSchema, 
  insertPageSchema, 
  insertAssetSchema, 
  insertSavedSiteSchema, 
  insertConvertedSiteSchema, 
  loginSchema,
  registerSchema,
  crawlOptionsSchema
} from '../../shared/schema';

describe('Schema Validations', () => {
  describe('User Schema', () => {
    it('should validate a valid user insert', () => {
      const validUser = {
        email: 'test@example.com',
        username: 'testuser',
        passwordHash: 'hashedpassword123'
      };
      
      const result = insertUserSchema.safeParse(validUser);
      expect(result.success).toBe(true);
    });
    
    it('should reject an invalid user email', () => {
      const invalidUser = {
        email: 'invalid-email',
        username: 'testuser',
        passwordHash: 'hashedpassword123'
      };
      
      const result = insertUserSchema.safeParse(invalidUser);
      expect(result.success).toBe(false);
    });
    
    it('should reject when required fields are missing', () => {
      const incompleteUser = {
        email: 'test@example.com'
      };
      
      const result = insertUserSchema.safeParse(incompleteUser);
      expect(result.success).toBe(false);
    });
  });
  
  describe('Crawl Schema', () => {
    it('should validate a valid crawl insert', () => {
      const validCrawl = {
        userId: 1,
        url: 'https://example.com',
        depth: 2,
        options: {
          downloadImages: true,
          preserveCss: true,
          preserveNav: true,
          respectRobots: true
        }
      };
      
      const result = insertCrawlSchema.safeParse(validCrawl);
      expect(result.success).toBe(true);
    });
    
    it('should reject a crawl with missing fields', () => {
      const invalidCrawl = {
        userId: 1,
        url: 'https://example.com'
      };
      
      const result = insertCrawlSchema.safeParse(invalidCrawl);
      expect(result.success).toBe(false);
    });
  });
  
  describe('Page Schema', () => {
    it('should validate a valid page insert', () => {
      const validPage = {
        crawlId: 1,
        url: 'https://example.com/page',
        path: '/page',
        content: '<html><body>Test</body></html>',
        title: 'Test Page'
      };
      
      const result = insertPageSchema.safeParse(validPage);
      expect(result.success).toBe(true);
    });
  });
  
  describe('Asset Schema', () => {
    it('should validate a valid asset insert', () => {
      const validAsset = {
        crawlId: 1,
        url: 'https://example.com/image.jpg',
        path: '/assets/image.jpg',
        type: 'image/jpeg',
        content: 'base64encodedcontent'
      };
      
      const result = insertAssetSchema.safeParse(validAsset);
      expect(result.success).toBe(true);
    });
  });
  
  describe('SavedSite Schema', () => {
    it('should validate a valid savedSite insert', () => {
      const validSavedSite = {
        userId: 1,
        crawlId: 1,
        url: 'https://example.com',
        pageCount: 10,
        size: 1024000,
        name: 'Example Site'
      };
      
      const result = insertSavedSiteSchema.safeParse(validSavedSite);
      expect(result.success).toBe(true);
    });
  });
  
  describe('ConvertedSite Schema', () => {
    it('should validate a valid convertedSite insert', () => {
      const validConvertedSite = {
        userId: 1,
        crawlId: 1,
        url: 'https://example.com',
        framework: 'react',
        status: 'completed',
        pageCount: 10,
        componentCount: 15,
        size: 2048000,
        name: 'Example React Site'
      };
      
      const result = insertConvertedSiteSchema.safeParse(validConvertedSite);
      expect(result.success).toBe(true);
    });
  });
  
  describe('Login Schema', () => {
    it('should validate valid login credentials', () => {
      const validLogin = {
        email: 'user@example.com',
        password: 'password123'
      };
      
      const result = loginSchema.safeParse(validLogin);
      expect(result.success).toBe(true);
    });
    
    it('should reject invalid email format', () => {
      const invalidLogin = {
        email: 'invalid-email',
        password: 'password123'
      };
      
      const result = loginSchema.safeParse(invalidLogin);
      expect(result.success).toBe(false);
    });
    
    it('should reject short passwords', () => {
      const invalidLogin = {
        email: 'user@example.com',
        password: '12345'
      };
      
      const result = loginSchema.safeParse(invalidLogin);
      expect(result.success).toBe(false);
    });
  });
  
  describe('Register Schema', () => {
    it('should validate valid registration data', () => {
      const validRegister = {
        username: 'newuser',
        email: 'newuser@example.com',
        password: 'password123',
        confirmPassword: 'password123'
      };
      
      const result = registerSchema.safeParse(validRegister);
      expect(result.success).toBe(true);
    });
    
    it('should reject when passwords do not match', () => {
      const invalidRegister = {
        username: 'newuser',
        email: 'newuser@example.com',
        password: 'password123',
        confirmPassword: 'differentpassword'
      };
      
      const result = registerSchema.safeParse(invalidRegister);
      expect(result.success).toBe(false);
    });
  });
  
  describe('CrawlOptions Schema', () => {
    it('should validate valid crawl options', () => {
      const validOptions = {
        downloadImages: true,
        preserveCss: true,
        preserveNav: true,
        respectRobots: true
      };
      
      const result = crawlOptionsSchema.safeParse(validOptions);
      expect(result.success).toBe(true);
    });
    
    it('should provide defaults for missing options', () => {
      const partialOptions = {};
      
      const result = crawlOptionsSchema.safeParse(partialOptions);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({
          downloadImages: true,
          preserveCss: true,
          preserveNav: true,
          respectRobots: true
        });
      }
    });
  });
});