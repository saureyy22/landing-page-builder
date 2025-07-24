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

    const { seoTitle, seoDescription, title, layoutConfig } = landingPage.fields;

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
  try {
    let landingPage;

    console.log('Landing page request - slug:', params.slug, 'entryId:', searchParams?.entryId);

    // Check if Contentful is configured
    const isContentfulConfigured = process.env.CONTENTFUL_SPACE_ID && process.env.CONTENTFUL_ACCESS_TOKEN;

    if (!isContentfulConfigured) {
      console.warn('Contentful not configured, using mock data');
      // Use mock data when Contentful is not configured
      if (params.slug === 'page-1' || params.slug === 'page-2') {
        landingPage = getMockLandingPageBySlug(params.slug);
      } else {
        // Create a generic mock page for any slug when in preview mode
        landingPage = getMockLandingPageBySlug(params.slug);
      }
    } else {
      // Check if this is a preview request with entryId
      if (searchParams?.entryId) {
        console.log('Preview mode: fetching by entryId', searchParams.entryId);
        try {
          landingPage = await getLandingPageById(searchParams.entryId, true);
          console.log('Preview fetch result:', landingPage ? 'success' : 'not found');
        } catch (error) {
          console.error('Preview fetch failed:', error);
          landingPage = null;
        }
      } else {
        // Normal mode: fetch by slug
        console.log('Normal mode: fetching by slug', params.slug);
        try {
          landingPage = await getLandingPageBySlug(params.slug);
          console.log('Slug fetch result:', landingPage ? 'success' : 'not found');
        } catch (error) {
          console.error('Slug fetch failed:', error);
          landingPage = null;
        }
      }

      // Fallback to mock data if Contentful fetch failed or entry not found
      if (!landingPage) {
        console.log('Using mock data fallback for slug:', params.slug);
        landingPage = getMockLandingPageBySlug(params.slug);
      }
    }

    if (!landingPage) {
      console.log('Landing page not found for slug:', params.slug, 'entryId:', searchParams?.entryId);
      notFound();
    }

    console.log('Landing page data:', JSON.stringify(landingPage, null, 2));

    // Safely extract fields with fallbacks
    const fields = landingPage.fields || {};
    const title = fields.title || `Landing Page - ${params.slug}`;
    let layoutConfig = fields.layoutConfig;

    // Handle case where layoutConfig might be a string that needs parsing
    if (typeof layoutConfig === 'string') {
      try {
        layoutConfig = JSON.parse(layoutConfig);
      } catch (error) {
        console.error('Failed to parse layoutConfig:', error);
        layoutConfig = { components: [], version: '1.0.0' };
      }
    }

    // Ensure layoutConfig has the expected structure
    if (!layoutConfig || !layoutConfig.components) {
      console.warn('Invalid layoutConfig, using fallback');
      layoutConfig = { components: [], version: '1.0.0' };
    }

    console.log('Processed layoutConfig:', JSON.stringify(layoutConfig, null, 2));

    return (
      <>
        <StructuredData landingPage={landingPage as any} slug={params.slug} />
        <LandingPageLayout>
          <div className={styles.container}>
            <nav aria-label="Breadcrumb" className={styles.breadcrumb}>
              <ol className={styles.breadcrumbList}>
                <li className={styles.breadcrumbItem}>
                  <a href="/" aria-label="Go to homepage">Home</a>
                </li>
                <li className={styles.breadcrumbItem}>
                  <a href="/landing" aria-label="Go to landing pages">Landing Pages</a>
                </li>
                <li className={styles.breadcrumbItem} aria-current="page">
                  {String(title)}
                </li>
              </ol>
            </nav>
            <main className={styles.main} role="main">
              <h1 className="visually-hidden">{String(title)}</h1>
              <LandingPageRenderer layoutConfig={layoutConfig as unknown as LayoutConfig} />
            </main>
          </div>
        </LandingPageLayout>
      </>
    );
  } catch (error) {
    console.error('Error rendering landing page:', error);
    notFound();
  }
}