import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getLandingPageBySlug, getLandingPageById, getAllLandingPageSlugs, getMockLandingPageBySlug, contentfulPreviewClient } from '@/lib/contentful';
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

// Force dynamic rendering to prevent DYNAMIC_SERVER_USAGE errors
export const dynamic = 'force-dynamic';

// Simplified metadata generation to prevent DYNAMIC_SERVER_USAGE errors
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const title = `Landing Page - ${params.slug}`;
  const description = 'Dynamic landing page built with Contentful';

  return {
    title,
    description,
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function LandingPage({ params, searchParams }: LandingPageProps) {
  console.log('Landing page request - slug:', params.slug, 'entryId:', searchParams?.entryId);

  try {
    let landingPage;
    let dataSource = 'unknown';

    // Check if Contentful is configured
    const isContentfulConfigured = process.env.CONTENTFUL_SPACE_ID && process.env.CONTENTFUL_ACCESS_TOKEN;

    if (!isContentfulConfigured) {
      console.warn('Contentful not configured, using mock data');
      landingPage = getMockLandingPageBySlug(params.slug);
      dataSource = 'mock (no config)';
    } else {
      // Check if this is a preview request with entryId
      if (searchParams?.entryId) {
        console.log('Preview mode: fetching by entryId', searchParams.entryId);
        console.log('Preview client available:', !!contentfulPreviewClient);
        console.log('Environment variables check:', {
          SPACE_ID: !!process.env.CONTENTFUL_SPACE_ID,
          ACCESS_TOKEN: !!process.env.CONTENTFUL_ACCESS_TOKEN,
          PREVIEW_TOKEN: !!process.env.CONTENTFUL_PREVIEW_ACCESS_TOKEN,
          ENVIRONMENT: process.env.CONTENTFUL_ENVIRONMENT
        });

        try {
          landingPage = await getLandingPageById(searchParams.entryId, true);
          if (landingPage) {
            dataSource = 'contentful (preview by ID)';
            console.log('Preview fetch successful, entry sys:', landingPage.sys);
            console.log('Preview fetch successful, content type:', landingPage.sys.contentType.sys.id);
          } else {
            console.log('Preview fetch returned null - entry may not exist or not be a landingPage');
          }
        } catch (error) {
          console.error('Preview fetch failed with error:', error);
          landingPage = null;
        }
      } else {
        // Normal mode: fetch by slug
        console.log('Normal mode: fetching by slug', params.slug);
        try {
          landingPage = await getLandingPageBySlug(params.slug);
          if (landingPage) {
            dataSource = 'contentful (by slug)';
            console.log('Slug fetch successful');
          } else {
            console.log('Slug fetch returned null');
          }
        } catch (error) {
          console.error('Slug fetch failed:', error);
          landingPage = null;
        }
      }

      // Fallback to mock data if Contentful fetch failed or entry not found
      if (!landingPage) {
        console.log('Using mock data fallback for slug:', params.slug);
        landingPage = getMockLandingPageBySlug(params.slug);
        dataSource = 'mock (fallback)';
      }
    }

    // Extract data safely
    const fields = landingPage?.fields || {};
    const title = fields.title || `Landing Page - ${params.slug}`;
    let layoutConfig = fields.layoutConfig;

    // Handle layoutConfig parsing
    if (typeof layoutConfig === 'string') {
      try {
        layoutConfig = JSON.parse(layoutConfig);
        console.log('Successfully parsed layoutConfig from string');
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

    const componentCount = layoutConfig.components?.length || 0;
    console.log(`Final layoutConfig has ${componentCount} components`);

    return (
      <div style={{
        padding: '2rem',
        maxWidth: '1000px',
        margin: '0 auto',
        fontFamily: 'system-ui, sans-serif'
      }}>
        <h1 style={{ color: '#333', marginBottom: '1rem' }}>{title}</h1>

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
          <p><strong>Data Source:</strong> {dataSource}</p>
          <p><strong>Components:</strong> {componentCount}</p>
        </div>

        {/* Render components */}
        <div style={{ marginTop: '2rem' }}>
          {layoutConfig.components.map((component: any, index: number) => (
            <div key={component.id || index} style={{
              background: '#fff',
              padding: '2rem',
              borderRadius: '8px',
              marginBottom: '1rem',
              border: '1px solid #ddd',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{ color: '#1976d2', marginTop: 0 }}>
                {component.type} (Order: {component.order})
              </h3>

              {component.type === 'hero-block' && (
                <div>
                  <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>
                    {component.data?.heading || 'Hero Heading'}
                  </h2>
                  <p style={{ fontSize: '1.2rem', color: '#666', marginBottom: '1.5rem' }}>
                    {component.data?.subtitle || 'Hero subtitle'}
                  </p>
                  {component.data?.cta && (
                    <button style={{
                      background: '#1976d2',
                      color: 'white',
                      border: 'none',
                      padding: '1rem 2rem',
                      borderRadius: '4px',
                      fontSize: '1rem',
                      cursor: 'pointer'
                    }}>
                      {component.data.cta.text || 'Call to Action'}
                    </button>
                  )}
                  {component.data?.backgroundImage && (
                    <div style={{ marginTop: '1rem', color: '#666' }}>
                      Background Image: {component.data.backgroundImage.fields?.title || 'Image'}
                    </div>
                  )}
                </div>
              )}

              {component.type === 'image-grid-2x2' && (
                <div>
                  <h4>Image Grid (2x2)</h4>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '1rem',
                    marginTop: '1rem'
                  }}>
                    {component.data?.images?.slice(0, 4).map((image: any, imgIndex: number) => (
                      <div key={imgIndex} style={{
                        background: '#f0f0f0',
                        padding: '1rem',
                        borderRadius: '4px',
                        textAlign: 'center'
                      }}>
                        <p>{image.fields?.title || `Image ${imgIndex + 1}`}</p>
                        {image.fields?.file?.url && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={image.fields.file.url}
                            alt={image.fields?.title || `Grid image ${imgIndex + 1}`}
                            style={{ maxWidth: '100%', height: 'auto', borderRadius: '4px' }}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {component.type === 'two-column-row' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                  <div>
                    <h4>{component.data?.leftColumn?.heading || 'Left Column'}</h4>
                    <p>{component.data?.leftColumn?.subtitle || 'Left column content'}</p>
                    {component.data?.leftColumn?.cta && (
                      <button style={{
                        background: '#1976d2',
                        color: 'white',
                        border: 'none',
                        padding: '0.5rem 1rem',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}>
                        {component.data.leftColumn.cta.text || 'Learn More'}
                      </button>
                    )}
                  </div>
                  <div style={{ background: '#f0f0f0', padding: '1rem', borderRadius: '4px' }}>
                    <p>Right Column (Image placeholder)</p>
                  </div>
                </div>
              )}

              {!['hero-block', 'image-grid-2x2', 'two-column-row'].includes(component.type) && (
                <div>
                  <p>Unknown component type: {component.type}</p>
                  <pre style={{ background: '#f0f0f0', padding: '1rem', borderRadius: '4px', fontSize: '0.8rem' }}>
                    {JSON.stringify(component.data, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          ))}

          {componentCount === 0 && (
            <div style={{
              background: '#fff3cd',
              padding: '2rem',
              borderRadius: '8px',
              border: '1px solid #ffeaa7',
              textAlign: 'center'
            }}>
              <h3>No Components Found</h3>
              <p>This landing page does not have any components configured yet.</p>
            </div>
          )}
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error in landing page:', error);

    // Ultimate fallback - plain HTML
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h1>Landing Page Error</h1>
        <p>There was an error loading the landing page.</p>
        <p>Slug: {params.slug}</p>
        <p>Entry ID: {searchParams?.entryId || 'None'}</p>
        <pre style={{ background: '#f0f0f0', padding: '1rem', borderRadius: '4px', textAlign: 'left' }}>
          {error instanceof Error ? error.message : 'Unknown error'}
        </pre>
      </div>
    );
  }
}