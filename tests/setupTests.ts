// Setup for Jest tests
import '@testing-library/jest-dom';

// Setup global environment variables for testing
process.env.NODE_ENV = 'test';

// Mock environment variables
process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/test_db';

// Mock console.error and console.warn during tests
// This helps keep the test output clean
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeAll(() => {
  console.error = (...args: any[]) => {
    if (
      args[0]?.includes?.('Warning:') ||
      args[0]?.includes?.('Error:')
    ) {
      return;
    }
    originalConsoleError(...args);
  };
  
  console.warn = (...args: any[]) => {
    if (
      args[0]?.includes?.('Warning:')
    ) {
      return;
    }
    originalConsoleWarn(...args);
  };
});

afterAll(() => {
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});

// Global afterEach to clean up any pending timeouts
afterEach(() => {
  jest.useRealTimers();
});