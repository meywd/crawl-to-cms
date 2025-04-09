import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthProvider, useAuth } from '../../../client/src/contexts/AuthContext';

// Mock API functions
vi.mock('../../../client/src/lib/api', () => ({
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
  getCurrentUser: vi.fn()
}));

import { login, register, logout, getCurrentUser } from '../../../client/src/lib/api';

// Test component using the auth hook
const TestComponent = () => {
  const { isAuthenticated, user, login, logout, register } = useAuth();
  
  return (
    <div>
      <div data-testid="auth-status">{isAuthenticated ? 'Authenticated' : 'Not Authenticated'}</div>
      {user && <div data-testid="username">{user.username}</div>}
      <button onClick={() => login({ email: 'test@example.com', password: 'password123' })}>Login</button>
      <button onClick={() => logout()}>Logout</button>
      <button onClick={() => register({ 
        username: 'newuser', 
        email: 'new@example.com', 
        password: 'password123', 
        confirmPassword: 'password123' 
      })}>Register</button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    
    // Mock localStorage
    const mockLocalStorage: Record<string, string> = {};
    
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn((key) => mockLocalStorage[key] || null),
        setItem: vi.fn((key, value) => { mockLocalStorage[key] = value; }),
        removeItem: vi.fn((key) => { delete mockLocalStorage[key]; }),
        clear: vi.fn(() => { Object.keys(mockLocalStorage).forEach(key => delete mockLocalStorage[key]); }),
      },
      writable: true
    });
  });

  it('provides authentication state to children', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // Initially not authenticated
    expect(screen.getByTestId('auth-status')).toHaveTextContent('Not Authenticated');
  });
  
  it('handles login correctly', async () => {
    // Mock successful login
    (login as any).mockResolvedValueOnce({ 
      id: 1, 
      username: 'testuser', 
      email: 'test@example.com' 
    });
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // Click login button
    fireEvent.click(screen.getByText('Login'));
    
    // Check API call
    expect(login).toHaveBeenCalledWith({ 
      email: 'test@example.com', 
      password: 'password123' 
    });
    
    // Wait for state update
    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');
    });
    
    expect(screen.getByTestId('username')).toHaveTextContent('testuser');
  });
  
  it('handles logout correctly', async () => {
    // First mock login to set authenticated state
    (login as any).mockResolvedValueOnce({ 
      id: 1, 
      username: 'testuser', 
      email: 'test@example.com' 
    });
    
    // Then mock logout
    (logout as any).mockResolvedValueOnce(undefined);
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // Login first
    fireEvent.click(screen.getByText('Login'));
    
    // Wait for login
    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');
    });
    
    // Then logout
    fireEvent.click(screen.getByText('Logout'));
    
    // Check API call
    expect(logout).toHaveBeenCalled();
    
    // Wait for state update
    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Not Authenticated');
    });
  });
  
  it('handles registration correctly', async () => {
    // Mock successful registration
    (register as any).mockResolvedValueOnce({ 
      id: 1, 
      username: 'newuser', 
      email: 'new@example.com' 
    });
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // Click register button
    fireEvent.click(screen.getByText('Register'));
    
    // Check API call
    expect(register).toHaveBeenCalledWith({ 
      username: 'newuser', 
      email: 'new@example.com', 
      password: 'password123', 
      confirmPassword: 'password123' 
    });
    
    // Wait for state update
    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');
    });
    
    expect(screen.getByTestId('username')).toHaveTextContent('newuser');
  });
});