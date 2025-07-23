import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import HeroBlock from '../HeroBlock';
import { HeroBlockData, ComponentInstance } from '@contentful-landing-page-builder/shared';

const mockHeroData: HeroBlockData = {
  heading: 'Test Hero Heading',
  subtitle: 'Test Hero Subtitle',
  cta: {
    text: 'Click Me',
    url: 'https://example.com',
  },
  backgroundImage: {
    sys: { id: 'test-image-id' },
    fields: {
      title: 'Test Background Image',
      file: {
        url: 'https://example.com/image.jpg',
        details: {
          size: 1024,
          image: { width: 800, height: 600 },
        },
        fileName: 'test-image.jpg',
        contentType: 'image/jpeg',
      },
    },
  },
};

const mockComponent: ComponentInstance = {
  id: 'test-hero-1',
  type: 'hero-block',
  data: mockHeroData,
  order: 1,
};

describe('HeroBlock', () => {
  it('should render hero heading', () => {
    render(<HeroBlock component={mockComponent} />);
    
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Test Hero Heading');
  });

  it('should render hero subtitle', () => {
    render(<HeroBlock component={mockComponent} />);
    
    expect(screen.getByText('Test Hero Subtitle')).toBeInTheDocument();
  });

  it('should render CTA button with correct text and link', () => {
    render(<HeroBlock component={mockComponent} />);
    
    const ctaLink = screen.getByRole('link', { name: 'Click Me' });
    expect(ctaLink).toBeInTheDocument();
    expect(ctaLink).toHaveAttribute('href', 'https://example.com');
  });

  it('should render background image with correct attributes', () => {
    render(<HeroBlock component={mockComponent} />);
    
    const backgroundImage = screen.getByAltText('Test Background Image');
    expect(backgroundImage).toBeInTheDocument();
    expect(backgroundImage).toHaveAttribute('src', 'https://example.com/image.jpg');
  });

  it('should have proper semantic structure', () => {
    render(<HeroBlock component={mockComponent} />);
    
    const section = screen.getByRole('region');
    expect(section).toBeInTheDocument();
    
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toBeInTheDocument();
  });

  it('should handle missing CTA gracefully', () => {
    const componentWithoutCTA: ComponentInstance = {
      ...mockComponent,
      data: {
        ...mockHeroData,
        cta: { text: '', url: '' },
      },
    };
    
    render(<HeroBlock component={componentWithoutCTA} />);
    
    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
    expect(screen.getByText('Test Hero Subtitle')).toBeInTheDocument();
  });
});