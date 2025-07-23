const { createClient } = require('contentful-management');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

const client = createClient({
  accessToken: process.env.CONTENTFUL_MANAGEMENT_TOKEN
});

async function deployContentType() {
  try {
    const spaceId = process.env.CONTENTFUL_SPACE_ID;
    const environmentId = process.env.CONTENTFUL_ENVIRONMENT || 'master';
    
    if (!spaceId || !process.env.CONTENTFUL_MANAGEMENT_TOKEN) {
      throw new Error('Missing required environment variables: CONTENTFUL_SPACE_ID and CONTENTFUL_MANAGEMENT_TOKEN');
    }

    console.log(`Deploying content type to space: ${spaceId}, environment: ${environmentId}`);

    // Get space and environment
    const space = await client.getSpace(spaceId);
    const environment = await space.getEnvironment(environmentId);

    // Load content type definition
    const contentTypeDefinition = JSON.parse(
      fs.readFileSync(path.join(__dirname, '../content-types/landing-page.json'), 'utf8')
    );

    // Check if content type already exists
    let contentType;
    try {
      contentType = await environment.getContentType('landingPage');
      console.log('Content type already exists, updating...');
      
      // Update existing content type
      contentType.name = contentTypeDefinition.name;
      contentType.description = contentTypeDefinition.description;
      contentType.displayField = contentTypeDefinition.displayField;
      contentType.fields = contentTypeDefinition.fields;
      
      contentType = await contentType.update();
    } catch (error) {
      if (error.name === 'NotFound') {
        console.log('Creating new content type...');
        // Create new content type
        contentType = await environment.createContentTypeWithId('landingPage', {
          name: contentTypeDefinition.name,
          description: contentTypeDefinition.description,
          displayField: contentTypeDefinition.displayField,
          fields: contentTypeDefinition.fields
        });
      } else {
        throw error;
      }
    }

    // Publish the content type
    await contentType.publish();
    console.log('Content type deployed and published successfully!');

    // Create sample entries if they don't exist
    await createSampleEntries(environment);

  } catch (error) {
    console.error('Error deploying content type:', error);
    process.exit(1);
  }
}

async function createSampleEntries(environment) {
  const sampleEntries = [
    {
      id: 'landing-page-1',
      fields: {
        title: { 'en-US': 'Landing Page 1' },
        slug: { 'en-US': 'page-1' },
        layoutConfig: { 'en-US': { components: [], version: '1.0.0', lastModified: new Date().toISOString() } },
        seoTitle: { 'en-US': 'Landing Page 1 - SEO Title' },
        seoDescription: { 'en-US': 'This is the first sample landing page for testing.' }
      }
    },
    {
      id: 'landing-page-2',
      fields: {
        title: { 'en-US': 'Landing Page 2' },
        slug: { 'en-US': 'page-2' },
        layoutConfig: { 'en-US': { components: [], version: '1.0.0', lastModified: new Date().toISOString() } },
        seoTitle: { 'en-US': 'Landing Page 2 - SEO Title' },
        seoDescription: { 'en-US': 'This is the second sample landing page for testing.' }
      }
    }
  ];

  for (const sampleEntry of sampleEntries) {
    try {
      // Check if entry already exists
      await environment.getEntry(sampleEntry.id);
      console.log(`Sample entry ${sampleEntry.id} already exists, skipping...`);
    } catch (error) {
      if (error.name === 'NotFound') {
        console.log(`Creating sample entry: ${sampleEntry.id}`);
        const entry = await environment.createEntryWithId('landingPage', sampleEntry.id, {
          fields: sampleEntry.fields
        });
        await entry.publish();
        console.log(`Sample entry ${sampleEntry.id} created and published!`);
      } else {
        console.error(`Error checking/creating sample entry ${sampleEntry.id}:`, error);
      }
    }
  }
}

deployContentType();