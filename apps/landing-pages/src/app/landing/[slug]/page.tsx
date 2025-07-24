import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getLandingPageBySlug, getLandingPageById, getAllLandingPageSlugs, getMockLandingPageBySlug } from '@/lib/contentful';
import { LayoutConfig } from '@contentful-landing-page-builder/shared';
import LandingPageRenderer from '../../../components/LandingPageRenderer';
import LandingPageLayout from '../../../components/LandingPageLayout';
import StructuredData from '../../../components/StructuredData';
import styles from './page.module.css';

interface LandingPageProps {
  params: {
    slug: string;
  };
  searchParams?: {
    entryId?: string;
    t?: string;
  };
}

// Generate static params for SSG
export async function generateStaticParams() {
  try {
    const slugs = await getAllLandingPageSlugs();
    return slugs.map((slug: string) => ({
      slug,
    }));
  } catch (error) {
    console.error('Error generating static params, using mock data:', error);
    // Return mock slugs for development
    return [
      { slug: 'page-1' },
      { slug: 'page-2' },
    ];
  }
}

// Generate metadata for SEO
export async function generateMetadata({ params, searchParams }: LandingPageProps): Promise<Metadata> {
  try {
    let landingPage;

    // Check if Contentful is configured
    const isContentfulConfigured = process.env.CONTENTFUL_SPACE_ID && process.env.CONTENTFUL_ACCESS_TOKEN;

    if (!isContentfulConfigured) {
      // Use mock data when Contentful is not configured
      landingPage = getMockLandingPageBySlug(params.slug);
    } else {
      // Check if this is a preview request with entryId
      if (searchParams?.entryId) {
        try {
          landingPage = await getLandingPageById(searchParams.entryId, true);
        } catch (error) {
          console.error('Preview metadata fetch failed:', error);
          landingPage = null;
        }
      } else {
        try {
          landingPage = await getLandingPageBySlug(params.slug);
        } catch (error) {
          console.error('Slug metadata fetch failed:', error);
          landingPage = null;
        }
      }

      // Fallback to mock data if Contentful fetch failed or entry not found
      if (!landingPage) {
        landingPage = getMockLandingPageBySlug(params.slug);
      }
    }

    if (!landingPage) {
      return {
        title: 'Page Not Found',
        description: 'The requested landing page could not be found.',
      };
    }

    // Safely extract fields with fallbacks
    const fields = landingPage.fields || {};
    const seoTitle = fields.seoTitle;
    const seoDescription = fields.seoDescription;
    const title = fields.title || `Landing Page - ${params.slug}`;
    const layoutConfig = fields.layoutConfig;

    // Extract hero image for social media sharing if available
    const typedLayoutConfig = layoutConfig as unknown as LayoutConfig;
    const heroComponent = typedLayoutConfig?.components?.find((comp: any) => comp.type === 'hero-block');
    const heroImage = heroComponent && heroComponent.type === 'hero-block'
      ? (heroComponent.data as any)?.backgroundImage?.fields?.file?.url
      : undefined;
    const imageUrl = heroImage ? `https:${heroImage}` : undefined;

    // Generate canonical URL
    const canonicalUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com'}/landing/${params.slug}`;

    const metaTitle = String(seoTitle || title || 'Landing Page');
    const metaDescription = String(seoDescription || 'Dynamic landing page built with Contentful');

    return {
      title: metaTitle,
      description: metaDescription,
      keywords: ['landing page', 'contentful', 'dynamic content', 'marketing'],
      authors: [{ name: 'Content Team' }],
      creator: 'Landing Page Builder',
      publisher: 'Landing Page Builder',
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          'max-video-preview': -1,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
      },
      alternates: {
        canonical: canonicalUrl,
      },
      openGraph: {
        title: metaTitle,
        description: metaDescription,
        url: canonicalUrl,
        siteName: 'Landing Page Builder',
        type: 'website',
        locale: 'en_US',
        ...(imageUrl && {
          images: [
            {
              url: imageUrl,
              width: 1200,
              height: 630,
              alt: metaTitle,
            },
          ],
        }),
      },
      twitter: {
        card: 'summary_large_image',
        title: metaTitle,
        description: metaDescription,
        creator: '@landingpagebuilder',
        site: '@landingpagebuilder',
        ...(imageUrl && {
          images: [imageUrl],
        }),
      },
      viewport: {
        width: 'device-width',
        initialScale: 1,
        maximumScale: 1,
      },
      verification: {
        google: process.env.GOOGLE_SITE_VERIFICATION,
        yandex: process.env.YANDEX_VERIFICATION,
        yahoo: process.env.YAHOO_SITE_VERIFICATION,
      },
    };
  } catch (error) {
    console.error('Error generating metadata, using fallback:', error);
    return {
      title: 'Landing Page',
      description: 'Dynamic landing page built with Contentful',
      robots: {
        index: false,
        follow: false,
      },
    };
  }
}

export default async function LandingPage({ params, searchParams }: LandingPageProps) {
  // Simplified version to prevent 500 errors
  console.log('Landing page request - slug:', params.slug, 'entryId:', searchParams?.entryId);

  try {
    const title = `Preview: ${params.slug}`;

    return (
      <div style={{
        padding: '2rem',
        maxWidth: '800px',
        margin: '0 auto',
        fontFamily: 'system-ui, sans-serif'
      }}>
        <h1 style={{ color: '#333', marginBottom: '1rem' }}>Landing Page Preview</h1>

        <div style={{
          background: '#f8f9fa',
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '2rem',
          border: '1px solid #e9ecef'
        }}>
          <p><strong>Slug:</strong> {params.slug}</p>
          <p><strong>Entry ID:</strong> {searchParams?.entryId || 'None'}</p>
          <p><strong>Timestamp:</strong> {searchParams?.t || 'None'}</p>
          <p><strong>Status:</strong> Simplified preview mode</p>
        </div>

        <div style={{
          background: '#e3f2fd',
          padding: '2rem',
          borderRadius: '8px',
          marginTop: '2rem',
          border: '1px solid #bbdefb'
        }}>
          <h2 style={{ color: '#1976d2', marginTop: 0 }}>Preview Content</h2>
          <p>This is a simplified preview to test the functionality.</p>
          <p>The preview system is working - you can see the URL parameters are being processed correctly.</p>
          <p>Once this loads without errors, we can add back the full Contentful integration step by step.</p>

          <div style={{
            background: 'white',
            padding: '1rem',
            borderRadius: '4px',
            marginTop: '1rem',
            border: '1px solid #ccc'
          }}>
            <h3>Mock Hero Section</h3>
            <p>This would be your hero content from Contentful.</p>
            <button style={{
              background: '#1976d2',
              color: 'white',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              cursor: 'pointer'
            }}>
              Call to Action
            </button>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error in simplified landing page:', error);

    // Ultimate fallback - plain HTML
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h1>Landing Page Error</h1>
        <p>There was an error loading the landing page.</p>
        <p>Slug: {params.slug}</p>
        <p>Entry ID: {searchParams?.entryId || 'None'}</p>
        <pre>{error instanceof Error ? error.message : 'Unknown error'}</pre>
      </div>
    );
  }
}