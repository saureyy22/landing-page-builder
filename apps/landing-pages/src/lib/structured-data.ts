import { LandingPageEntry, LayoutConfig, HeroBlockData } from '@contentful-landing-page-builder/shared';

/**
 * Generate JSON-LD structured data for a landing page
 */
export function generateStructuredData(landingPage: LandingPageEntry, slug: string) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com';
  const pageUrl = `${baseUrl}/landing/${slug}`;
  const { title, seoTitle, seoDescription, layoutConfig } = landingPage.fields;
  
  // Extract hero image for structured data if available
  const typedLayoutConfig = layoutConfig as LayoutConfig;
  const heroComponent = typedLayoutConfig?.components?.find((comp: any) => comp.type === 'hero-block');
  const heroData = heroComponent?.data as HeroBlockData;
  const heroImage = heroData?.backgroundImage?.fields?.file?.url;
  const imageUrl = heroImage ? `https:${heroImage}` : undefined;

  // WebPage structured data
  const webPageData = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': pageUrl,
    url: pageUrl,
    name: String(seoTitle || title),
    description: String(seoDescription || 'Dynamic landing page built with Contentful'),
    inLanguage: 'en-US',
    isPartOf: {
      '@type': 'WebSite',
      '@id': `${baseUrl}/#website`,
      url: baseUrl,
      name: 'Landing Page Builder',
      description: 'Dynamic landing pages built with Contentful',
      publisher: {
        '@type': 'Organization',
        '@id': `${baseUrl}/#organization`,
        name: 'Landing Page Builder',
        url: baseUrl,
      },
    },
    primaryImageOfPage: imageUrl ? {
      '@type': 'ImageObject',
      '@id': `${pageUrl}#primaryimage`,
      url: imageUrl,
      contentUrl: imageUrl,
    } : undefined,
    datePublished: landingPage.sys.createdAt,
    dateModified: landingPage.sys.updatedAt,
    breadcrumb: {
      '@type': 'BreadcrumbList',
      '@id': `${pageUrl}#breadcrumb`,
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: baseUrl,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Landing Pages',
          item: `${baseUrl}/landing`,
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: String(title),
          item: pageUrl,
        },
      ],
    },
  };

  // Organization structured data
  const organizationData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${baseUrl}/#organization`,
    name: 'Landing Page Builder',
    url: baseUrl,
    description: 'Dynamic landing pages built with Contentful',
    foundingDate: '2024',
    sameAs: [
      // Add social media URLs here if available
    ],
  };

  return {
    webPage: webPageData,
    organization: organizationData,
  };
}

/**
 * Generate JSON-LD script tag content
 */
export function generateJsonLdScript(structuredData: any) {
  return JSON.stringify(structuredData, null, 0);
}