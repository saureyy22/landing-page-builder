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

// Generate static params for SSG - simplified to prevent errors
export async function generateStaticParams() {
  // Return empty array to allow all dynamic routes
  return [];
}

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