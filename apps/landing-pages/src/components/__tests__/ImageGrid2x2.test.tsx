import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import ImageGrid2x2 from '../ImageGrid2x2';
import { ImageGrid2x2Data, ContentfulAsset, ComponentInstance } from '@contentful-landing-page-builder/shared';

const createMockAsset = (id: string, title: string, url: string): ContentfulAsset => ({
  sys: { id },
  fields: {
    title,
    file: {
      url,
      details: {
        size: 1024,
        image: { width: 400, height: 300 },
      },
      fileName: `${id}.jpg`,
      contentType: 'image/jpeg',
    },
  },
});

const mockImageGridData: ImageGrid2x2Data = {
  images: [
    createMockAsset('img1', 'Image 1', 'https://example.com/img1.jpg'),
    createMockAsset('img2', 'Image 2', 'https://example.com/img2.jpg'),
    createMockAsset('img3', 'Image 3', 'https://example.com/img3.jpg'),
    createMockAsset('img4', 'Image 4', 'https://example.com/img4.jpg'),
  ],
};

const mockComponent: ComponentInstance = {
  id: 'test-image-grid-1',
  type: 'image-grid-2x2',
  data: mockImageGridData,
  order: 1,
};

describe('ImageGrid2x2', () => {
  it('should render all four images', () => {
    render(<ImageGrid2x2 component={mockComponent} />);
    
    expect(screen.getByAltText('Image 1')).toBeInTheDocument();
    expect(screen.getByAltText('Image 2')).toBeInTheDocument();
    expect(screen.getByAltText('Image 3')).toBeInTheDocument();
    expect(screen.getByAltText('Image 4')).toBeInTheDocument();
  });

  it('should render images with correct src attributes', () => {
    render(<ImageGrid2x2 component={mockComponent} />);
    
    expect(screen.getByAltText('Image 1')).toHaveAttribute('src', 'https://example.com/img1.jpg');
    expect(screen.getByAltText('Image 2')).toHaveAttribute('src', 'https://example.com/img2.jpg');
    expect(screen.getByAltText('Image 3')).toHaveAttribute('src', 'https://example.com/img3.jpg');
    expect(screen.getByAltText('Image 4')).toHaveAttribute('src', 'https://example.com/img4.jpg');
  });

  it('should have proper semantic structure', () => {
    render(<ImageGrid2x2 component={mockComponent} />);
    
    const section = screen.getByRole('region');
    expect(section).toBeInTheDocument();
  });

  it('should render exactly 4 images', () => {
    render(<ImageGrid2x2 component={mockComponent} />);
    
    const images = screen.getAllByRole('img');
    expect(images).toHaveLength(4);
  });

  it('should handle images with different titles', () => {
    const componentWithDifferentTitles: ComponentInstance = {
      ...mockComponent,
      data: {
        images: [
          createMockAsset('img1', 'First Image', 'https://example.com/img1.jpg'),
          createMockAsset('img2', 'Second Image', 'https://example.com/img2.jpg'),
          createMockAsset('img3', 'Third Image', 'https://example.com/img3.jpg'),
          createMockAsset('img4', 'Fourth Image', 'https://example.com/img4.jpg'),
        ],
      },
    };
    
    render(<ImageGrid2x2 component={componentWithDifferentTitles} />);
    
    expect(screen.getByAltText('First Image')).toBeInTheDocument();
    expect(screen.getByAltText('Second Image')).toBeInTheDocument();
    expect(screen.getByAltText('Third Image')).toBeInTheDocument();
    expect(screen.getByAltText('Fourth Image')).toBeInTheDocument();
  });
});