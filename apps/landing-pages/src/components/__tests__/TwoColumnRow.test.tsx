import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import TwoColumnRow from '../TwoColumnRow';
import { TwoColumnRowData, ComponentInstance } from '@contentful-landing-page-builder/shared';

const mockTwoColumnData: TwoColumnRowData = {
  leftColumn: {
    heading: 'Left Column Heading',
    subtitle: 'Left Column Subtitle',
    cta: {
      text: 'Learn More',
      url: 'https://example.com/learn',
    },
  },
  rightColumn: {
    image: {
      sys: { id: 'test-image-id' },
      fields: {
        title: 'Right Column Image',
        file: {
          url: 'https://example.com/column-image.jpg',
          details: {
            size: 2048,
            image: { width: 600, height: 400 },
          },
          fileName: 'column-image.jpg',
          contentType: 'image/jpeg',
        },
      },
    },
  },
};

const mockComponent: ComponentInstance = {
  id: 'test-two-column-1',
  type: 'two-column-row',
  data: mockTwoColumnData,
  order: 1,
};

describe('TwoColumnRow', () => {
  it('should render left column heading', () => {
    render(<TwoColumnRow component={mockComponent} />);
    
    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Left Column Heading');
  });

  it('should render left column subtitle', () => {
    render(<TwoColumnRow component={mockComponent} />);
    
    expect(screen.getByText('Left Column Subtitle')).toBeInTheDocument();
  });

  it('should render left column CTA', () => {
    render(<TwoColumnRow component={mockComponent} />);
    
    const ctaLink = screen.getByRole('link', { name: 'Learn More' });
    expect(ctaLink).toBeInTheDocument();
    expect(ctaLink).toHaveAttribute('href', 'https://example.com/learn');
  });

  it('should render right column image', () => {
    render(<TwoColumnRow component={mockComponent} />);
    
    const image = screen.getByAltText('Right Column Image');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', 'https://example.com/column-image.jpg');
  });

  it('should have proper semantic structure', () => {
    render(<TwoColumnRow component={mockComponent} />);
    
    const section = screen.getByRole('region');
    expect(section).toBeInTheDocument();
  });

  it('should handle empty CTA text', () => {
    const componentWithEmptyCTA: ComponentInstance = {
      ...mockComponent,
      data: {
        ...mockTwoColumnData,
        leftColumn: {
          ...mockTwoColumnData.leftColumn,
          cta: { text: '', url: 'https://example.com' },
        },
      },
    };
    
    render(<TwoColumnRow component={componentWithEmptyCTA} />);
    
    expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument();
    expect(screen.getByText('Left Column Subtitle')).toBeInTheDocument();
  });
});