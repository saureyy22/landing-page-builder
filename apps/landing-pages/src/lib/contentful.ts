import { createClient } from 'contentful'; 
const requiredEnvVars = {
    spaceId: process.env.CONTENTFUL_SPACE_ID,
    accessToken: process.env.CONTENTFUL_ACCESS_TOKEN,
    previewAccessToken: process.env.CONTENTFUL_PREVIEW_ACCESS_TOKEN,
    environment: process.env.CONTENTFUL_ENVIRONMENT || 'master',
};

// Check if Contentful is configured
const isContentfulConfigured = requiredEnvVars.spaceId && requiredEnvVars.accessToken;

// Only validate required environment variables if we're not in build mode
if (isContentfulConfigured) {
    Object.entries(requiredEnvVars).forEach(([key, value]) => {
        if (!value && key !== 'previewAccessToken') {
            console.warn(`Missing environment variable: CONTENTFUL_${key.toUpperCase()}`);
        }
    });
}

// Create Contentful Delivery API client
export const contentfulClient = isContentfulConfigured ? createClient({
    space: requiredEnvVars.spaceId!,
    accessToken: requiredEnvVars.accessToken!,
    environment: requiredEnvVars.environment!,
}) : null;

// Create Contentful Preview API client (optional)
export const contentfulPreviewClient = isContentfulConfigured && requiredEnvVars.previewAccessToken
    ? createClient({
        space: requiredEnvVars.spaceId!,
        accessToken: requiredEnvVars.previewAccessToken!,
        environment: requiredEnvVars.environment!,
        host: 'preview.contentful.com',
    })
    : null;

// Configuration object for easy access
export const contentfulConfig = {
    spaceId: requiredEnvVars.spaceId || '',
    environment: requiredEnvVars.environment!,
};

// Helper function to get landing page by slug
export const getLandingPageBySlug = async (slug: string, preview = false) => {
    try {
        const client = preview && contentfulPreviewClient ? contentfulPreviewClient : contentfulClient;

        if (!client) {
            console.warn('Contentful client not configured, returning null');
            return null;
        }

        const response = await client.getEntries({
            content_type: 'landingPage',
            'fields.slug': slug,
            limit: 1,
        });

        if (response.items.length === 0) {
            return null;
        }

        return response.items[0];
    } catch (error) {
        console.error('Error fetching landing page by slug:', error);
        throw error;
    }
};

// Helper function to get landing page by entry ID (for preview mode)
export const getLandingPageById = async (entryId: string, preview = true) => {
    try {
        const client = preview && contentfulPreviewClient ? contentfulPreviewClient : contentfulClient;

        if (!client) {
            console.warn('Contentful client not configured, returning null');
            return null;
        }

        const entry = await client.getEntry(entryId);
        
        // Verify it's a landing page content type
        if (entry.sys.contentType.sys.id !== 'landingPage') {
            console.warn('Entry is not a landing page');
            return null;
        }

        return entry;
    } catch (error) {
        console.error('Error fetching landing page by ID:', error);
        throw error;
    }
};

// Helper function to get all landing page slugs for static generation
export const getAllLandingPageSlugs = async () => {
    try {
        if (!contentfulClient) {
            console.warn('Contentful client not configured, returning empty array');
            return [];
        }

        const response = await contentfulClient.getEntries({
            content_type: 'landingPage',
            select: ['fields.slug'],
        });

        return response.items.map((item: any) => item.fields.slug);
    } catch (error) {
        console.error('Error fetching landing page slugs:', error);
        throw error;
    }
};

// Mock data for development when Contentful is not configured
export const getMockLandingPageBySlug = (slug: string) => {
    const mockData = {
        sys: {
            id: `mock-${slug}`,
            type: 'Entry' as const,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            locale: 'en-US',
            revision: 1,
            space: {
                sys: {
                    id: 'mock-space',
                    linkType: 'Space' as const,
                    type: 'Link' as const,
                }
            },
            environment: {
                sys: {
                    id: 'master',
                    linkType: 'Environment' as const,
                    type: 'Link' as const,
                }
            },
            contentType: {
                sys: {
                    id: 'landingPage',
                    linkType: 'ContentType' as const,
                    type: 'Link' as const,
                }
            }
        },
        metadata: {
            tags: [],
            concepts: []
        },
        fields: {
            title: `Mock Landing Page - ${slug}`,
            slug,
            seoTitle: `SEO Title for ${slug}`,
            seoDescription: `SEO description for landing page ${slug}`,
            layoutConfig: {
                components: [
                    {
                        id: 'hero-1',
                        type: 'hero-block' as const,
                        order: 0,
                        data: {
                            heading: 'Welcome to Our Landing Page',
                            subtitle: 'This is a mock hero block component',
                            cta: {
                                text: 'Get Started',
                                url: '#'
                            },
                            backgroundImage: null
                        }
                    },
                    {
                        id: 'two-col-1',
                        type: 'two-column-row' as const,
                        order: 1,
                        data: {
                            leftColumn: {
                                heading: 'Two Column Section',
                                subtitle: 'This is a mock two column component',
                                cta: {
                                    text: 'Learn More',
                                    url: '#'
                                }
                            },
                            rightColumn: {
                                image: null
                            }
                        }
                    }
                ],
                version: '1.0.0',
                lastModified: new Date().toISOString()
            }
        }
    } as any; // Type assertion to bypass strict typing for mock data

    return mockData;
};