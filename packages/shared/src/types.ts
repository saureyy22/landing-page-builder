/**
 * Contentful Asset interface for images and media
 */
export interface ContentfulAsset {
  sys: {
    id: string;
  };
  fields: {
    title: string;
    file: {
      url: string;
      details: {
        size: number;
        image?: {
          width: number;
          height: number;
        };
      };
      fileName: string;
      contentType: string;
    };
  };
}

/**
 * Call-to-action interface used across components
 */
export interface CTA {
  text: string;
  url: string;
}

/**
 * Hero Block component data structure
 */
export interface HeroBlockData {
  heading: string;
  subtitle: string;
  cta: CTA;
  backgroundImage: ContentfulAsset;
}

/**
 * Two Column Row component data structure
 */
export interface TwoColumnRowData {
  leftColumn: {
    heading: string;
    subtitle: string;
    cta: CTA;
  };
  rightColumn: {
    image: ContentfulAsset;
  };
}

/**
 * 2x2 Image Grid component data structure
 */
export interface ImageGrid2x2Data {
  images: [ContentfulAsset, ContentfulAsset, ContentfulAsset, ContentfulAsset];
}

/**
 * Union type for all component data types
 */
export type ComponentData = HeroBlockData | TwoColumnRowData | ImageGrid2x2Data;

/**
 * Available component types
 */
export type ComponentType = 'hero-block' | 'two-column-row' | 'image-grid-2x2';

/**
 * Individual component instance in the layout
 */
export interface ComponentInstance {
  id: string;
  type: ComponentType;
  data: ComponentData;
  order: number;
}

/**
 * Main layout configuration stored in Contentful
 */
export interface LayoutConfig {
  components: ComponentInstance[];
  version: string;
  lastModified: string;
}

/**
 * Landing page entry structure from Contentful
 */
export interface LandingPageEntry {
  sys: {
    id: string;
    createdAt: string;
    updatedAt: string;
  };
  fields: {
    title: string;
    slug: string;
    layoutConfig: LayoutConfig;
    seoTitle?: string;
    seoDescription?: string;
  };
}