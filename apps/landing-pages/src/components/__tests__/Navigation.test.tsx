import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import Navigation from '../Navigation';
import { usePathname } from 'next/navigation';

const mockUsePathname = vi.mocked(usePathname);

describe('Navigation', () => {
  it('should render navigation links', () => {
    mockUsePathname.mockReturnValue('/landing/page-1');
    
    render(<Navigation />);
    
    expect(screen.getByRole('menuitem', { name: 'Page 1' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Page 2' })).toBeInTheDocument();
  });

  it('should have correct href attributes', () => {
    mockUsePathname.mockReturnValue('/landing/page-1');
    
    render(<Navigation />);
    
    expect(screen.getByRole('menuitem', { name: 'Page 1' })).toHaveAttribute('href', '/landing/page-1');
    expect(screen.getByRole('menuitem', { name: 'Page 2' })).toHaveAttribute('href', '/landing/page-2');
  });

  it('should indicate active page for page-1', () => {
    mockUsePathname.mockReturnValue('/landing/page-1');
    
    render(<Navigation />);
    
    const page1Link = screen.getByRole('menuitem', { name: 'Page 1' });
    const page2Link = screen.getByRole('menuitem', { name: 'Page 2' });
    
    expect(page1Link).toHaveAttribute('aria-current', 'page');
    expect(page2Link).not.toHaveAttribute('aria-current');
  });

  it('should indicate active page for page-2', () => {
    mockUsePathname.mockReturnValue('/landing/page-2');
    
    render(<Navigation />);
    
    const page1Link = screen.getByRole('menuitem', { name: 'Page 1' });
    const page2Link = screen.getByRole('menuitem', { name: 'Page 2' });
    
    expect(page1Link).not.toHaveAttribute('aria-current');
    expect(page2Link).toHaveAttribute('aria-current', 'page');
  });

  it('should have proper semantic structure', () => {
    mockUsePathname.mockReturnValue('/landing/page-1');
    
    render(<Navigation />);
    
    const nav = screen.getByRole('navigation');
    expect(nav).toBeInTheDocument();
  });

  it('should handle unknown pathname gracefully', () => {
    mockUsePathname.mockReturnValue('/unknown-page');
    
    render(<Navigation />);
    
    const page1Link = screen.getByRole('menuitem', { name: 'Page 1' });
    const page2Link = screen.getByRole('menuitem', { name: 'Page 2' });
    
    expect(page1Link).not.toHaveAttribute('aria-current');
    expect(page2Link).not.toHaveAttribute('aria-current');
  });
});