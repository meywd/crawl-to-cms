import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { hashPassword, registerUser, isAuthenticated, getUserId } from '../../server/auth';
import bcrypt from 'bcryptjs';

// Mock bcrypt
vi.mock('bcryptjs', () => ({
  hash: vi.fn().mockResolvedValue('hashed_password'),
  compare: vi.fn()
}));

// Mock storage
vi.mock('../../server/storage', () => ({
  storage: {
    createUser: vi.fn(),
    getUserByUsername: vi.fn(),
    getUserByEmail: vi.fn(),
    updateUserLastLogin: vi.fn()
  }
}));

describe('Authentication Functions', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('hashPassword', () => {
    it('should hash a password using bcrypt', async () => {
      const password = 'password123';
      const hashedPassword = await hashPassword(password);
      
      expect(bcrypt.hash).toHaveBeenCalledWith(password, 10);
      expect(hashedPassword).toBe('hashed_password');
    });
  });

  describe('registerUser', () => {
    it('should register a new user successfully', async () => {
      const { storage } = require('../../server/storage');
      
      // Mock getUserByUsername to return null (no existing user)
      storage.getUserByUsername.mockResolvedValue(null);
      
      // Mock getUserByEmail to return null (no existing user)
      storage.getUserByEmail.mockResolvedValue(null);
      
      // Mock createUser to return a new user
      storage.createUser.mockResolvedValue({
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        passwordHash: 'hashed_password',
        createdAt: new Date(),
        lastLoginAt: null
      });
      
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123'
      };
      
      const result = await registerUser(userData);
      
      expect(storage.getUserByUsername).toHaveBeenCalledWith('testuser');
      expect(storage.getUserByEmail).toHaveBeenCalledWith('test@example.com');
      expect(storage.createUser).toHaveBeenCalledWith({
        username: 'testuser',
        email: 'test@example.com',
        passwordHash: 'hashed_password'
      });
      
      expect(result).toEqual({
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        passwordHash: 'hashed_password',
        createdAt: expect.any(Date),
        lastLoginAt: null
      });
    });
    
    it('should throw an error if username already exists', async () => {
      const { storage } = require('../../server/storage');
      
      // Mock getUserByUsername to return an existing user
      storage.getUserByUsername.mockResolvedValue({
        id: 1,
        username: 'testuser',
        email: 'existing@example.com'
      });
      
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123'
      };
      
      await expect(registerUser(userData)).rejects.toThrow('Username already exists');
      expect(storage.createUser).not.toHaveBeenCalled();
    });
    
    it('should throw an error if email already exists', async () => {
      const { storage } = require('../../server/storage');
      
      // Mock getUserByUsername to return null (no existing user)
      storage.getUserByUsername.mockResolvedValue(null);
      
      // Mock getUserByEmail to return an existing user
      storage.getUserByEmail.mockResolvedValue({
        id: 1,
        username: 'existinguser',
        email: 'test@example.com'
      });
      
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123'
      };
      
      await expect(registerUser(userData)).rejects.toThrow('Email already exists');
      expect(storage.createUser).not.toHaveBeenCalled();
    });
    
    it('should throw an error if passwords do not match', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'differentpassword'
      };
      
      await expect(registerUser(userData)).rejects.toThrow('Passwords do not match');
      
      const { storage } = require('../../server/storage');
      expect(storage.getUserByUsername).not.toHaveBeenCalled();
      expect(storage.getUserByEmail).not.toHaveBeenCalled();
      expect(storage.createUser).not.toHaveBeenCalled();
    });
  });
  
  describe('isAuthenticated', () => {
    it('should call next if user is authenticated', () => {
      const req = { session: { userId: 1 } } as unknown as Request;
      const res = {} as Response;
      const next = vi.fn();
      
      isAuthenticated(req, res, next);
      
      expect(next).toHaveBeenCalled();
    });
    
    it('should return 401 if user is not authenticated', () => {
      const req = { session: {} } as unknown as Request;
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn()
      } as unknown as Response;
      const next = vi.fn();
      
      isAuthenticated(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized' });
      expect(next).not.toHaveBeenCalled();
    });
  });
  
  describe('getUserId', () => {
    it('should return userId from session if authenticated', () => {
      const req = { session: { userId: 1 } } as unknown as Request;
      
      const userId = getUserId(req);
      
      expect(userId).toBe(1);
    });
    
    it('should return null if not authenticated', () => {
      const req = { session: {} } as unknown as Request;
      
      const userId = getUserId(req);
      
      expect(userId).toBeNull();
    });
  });
});