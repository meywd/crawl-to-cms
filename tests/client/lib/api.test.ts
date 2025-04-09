import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { apiRequest } from '../../../client/src/lib/queryClient';

// Mock fetch
global.fetch = vi.fn();

describe('API Client', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('apiRequest', () => {
    it('should make a GET request', async () => {
      const mockResponse = { data: 'test' };
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
        text: async () => JSON.stringify(mockResponse)
      });

      const result = await apiRequest('GET', '/api/test', undefined);

      expect(global.fetch).toHaveBeenCalledWith('/api/test', {
        method: 'GET',
        headers: {},
        body: undefined,
        credentials: 'include'
      });
      expect(await result.json()).toEqual(mockResponse);
    });

    it('should make a POST request with data', async () => {
      const mockResponse = { id: 1, name: 'test' };
      const requestData = { name: 'test' };
      
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
        text: async () => JSON.stringify(mockResponse)
      });

      const result = await apiRequest('POST', '/api/test', requestData);

      expect(global.fetch).toHaveBeenCalledWith('/api/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData),
        credentials: 'include'
      });
      expect(await result.json()).toEqual(mockResponse);
    });

    it('should throw an error for non-ok responses', async () => {
      const errorResponse = {
        message: 'Not found'
      };
      
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: async () => errorResponse,
        text: async () => JSON.stringify(errorResponse)
      });

      await expect(apiRequest('GET', '/api/test', undefined)).rejects.toThrow('404:');
    });

    it('should handle network errors', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      await expect(apiRequest('GET', '/api/test', undefined)).rejects.toThrow('Network error');
    });
  });
});