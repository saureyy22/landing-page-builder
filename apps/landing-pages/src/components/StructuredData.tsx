import { LandingPageEntry } from '@contentful-landing-page-builder/shared';
import { generateStructuredData, generateJsonLdScript } from '@/lib/structured-data';

interface StructuredDataProps {
  landingPage: LandingPageEntry;
  slug: string;
}

export default function StructuredData({ landingPage, slug }: StructuredDataProps) {
  const structuredData = generateStructuredData(landingPage, slug);

  return (
    <>
      {/* WebPage structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: generateJsonLdScript(structuredData.webPage),
        }}
      />
      
      {/* Organization structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: generateJsonLdScript(structuredData.organization),
        }}
      />
    </>
  );
}