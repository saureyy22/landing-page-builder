import { NextResponse } from 'next/server';
import { contentfulClient, contentfulPreviewClient, getLandingPageById } from '@/lib/contentful';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const entryId = searchParams.get('entryId');

  try {
    // Test environment variables
    const envVars = {
      CONTENTFUL_SPACE_ID: process.env.CONTENTFUL_SPACE_ID ? 'SET' : 'MISSING',
      CONTENTFUL_ACCESS_TOKEN: process.env.CONTENTFUL_ACCESS_TOKEN ? 'SET' : 'MISSING',
      CONTENTFUL_PREVIEW_ACCESS_TOKEN: process.env.CONTENTFUL_PREVIEW_ACCESS_TOKEN ? 'SET' : 'MISSING',
      CONTENTFUL_ENVIRONMENT: process.env.CONTENTFUL_ENVIRONMENT || 'master',
    };

    // Test client connections
    const clientStatus = {
      deliveryClient: !!contentfulClient,
      previewClient: !!contentfulPreviewClient,
    };

    let testResult = null;
    if (entryId) {
      console.log('Testing entry fetch for ID:', entryId);
      testResult = await getLandingPageById(entryId, true);
    }

    return NextResponse.json({
      success: true,
      environment: envVars,
      clients: clientStatus,
      entryId,
      testResult: testResult ? {
        id: testResult.sys.id,
        contentType: testResult.sys.contentType.sys.id,
        title: testResult.fields.title,
      } : null,
    });
  } catch (error) {
    console.error('Contentful test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      environment: {
        CONTENTFUL_SPACE_ID: process.env.CONTENTFUL_SPACE_ID ? 'SET' : 'MISSING',
        CONTENTFUL_ACCESS_TOKEN: process.env.CONTENTFUL_ACCESS_TOKEN ? 'SET' : 'MISSING',
        CONTENTFUL_PREVIEW_ACCESS_TOKEN: process.env.CONTENTFUL_PREVIEW_ACCESS_TOKEN ? 'SET' : 'MISSING',
        CONTENTFUL_ENVIRONMENT: process.env.CONTENTFUL_ENVIRONMENT || 'master',
      },
    }, { status: 500 });
  }
}