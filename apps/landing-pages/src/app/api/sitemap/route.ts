import { NextResponse } from 'next/server';
import { contentfulClient } from '../../../lib/contentful';

export async function GET() {
  try {
    // Check if contentfulClient is available
    if (!contentfulClient) {
      console.error('Contentful client not configured');
      return new NextResponse('Contentful client not available', { status: 500 });
    }

    // Fetch all landing pages from Contentful
    const entries = await contentfulClient.getEntries({
      content_type: 'landingPage',
      select: ['fields.slug', 'sys.updatedAt'],
    });

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://your-domain.com';
    
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  ${entries.items
    .map((item: any) => {
      const slug = item.fields.slug;
      const lastmod = item.sys.updatedAt;
      
      return `
  <url>
    <loc>${baseUrl}/landing/${slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
    })
    .join('')}
</urlset>`;

    return new NextResponse(sitemap, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    });
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return new NextResponse('Error generating sitemap', { status: 500 });
  }
}