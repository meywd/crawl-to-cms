import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useLocation } from 'wouter';

// Mock wouter
vi.mock('wouter', () => ({
  Link: ({ href, children, ...props }: any) => (
    <a href={href} {...props} data-testid={`link-${href.replace(/\//g, '-')}`}>
      {children}
    </a>
  ),
  useLocation: vi.fn(() => ['/'])
}));

// Mock AuthContext
const mockLogout = vi.fn();
vi.mock('../../../client/src/contexts/AuthContext', () => ({
  useAuth: () => ({
    isAuthenticated: true,
    user: { username: 'testuser' },
    logout: mockLogout
  })
}));

// Import component after mocks
import Navigation from '../../../client/src/components/Navigation';

describe('Navigation Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders navigation links when user is authenticated', () => {
    render(<Navigation />);
    
    // Check that links are rendered
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('History')).toBeInTheDocument();
    expect(screen.getByText('Saved Sites')).toBeInTheDocument();
    expect(screen.getByText('Converted Sites')).toBeInTheDocument();
  });
  
  it('highlights the active link based on current route', () => {
    // Mock current location as /history
    (useLocation as any).mockReturnValue(['/history']);
    
    render(<Navigation />);
    
    // History link should have active class
    const historyLink = screen.getByTestId('link--history');
    expect(historyLink.className).toContain('active');
    
    // Home link should not have active class
    const homeLink = screen.getByTestId('link-');
    expect(homeLink.className).not.toContain('active');
  });
  
  it('calls logout function when logout button is clicked', () => {
    render(<Navigation />);
    
    // Find and click logout button
    const logoutButton = screen.getByText('Logout');
    fireEvent.click(logoutButton);
    
    // Check that logout was called
    expect(mockLogout).toHaveBeenCalled();
  });
});