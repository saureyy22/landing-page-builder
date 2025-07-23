# Contentful Setup

This directory contains the Contentful content type definitions and deployment scripts for the Landing Page Builder.

## Content Types

### Landing Page (`landingPage`)

The main content type for landing pages with the following fields:

- **title** (Symbol, required): The display title of the landing page
- **slug** (Symbol, required, unique): URL-friendly identifier (e.g., "page-1", "page-2")
- **layoutConfig** (Object, required): JSON configuration for the page layout and components
- **seoTitle** (Symbol, optional): SEO-optimized title (max 60 characters)
- **seoDescription** (Text, optional): SEO meta description (max 160 characters)

## Setup Instructions

1. **Install dependencies:**
   ```bash
   cd contentful
   npm install
   ```

2. **Configure environment variables:**
   Copy the root `.env.example` to `.env` and fill in your Contentful credentials:
   ```bash
   cp ../.env.example ../.env
   ```

   Required variables:
   - `CONTENTFUL_SPACE_ID`: Your Contentful space ID
   - `CONTENTFUL_MANAGEMENT_TOKEN`: Management API token with write access
   - `CONTENTFUL_ENVIRONMENT`: Target environment (default: "master")

3. **Deploy the content type:**
   ```bash
   npm run deploy-content-type
   ```

   This script will:
   - Create or update the Landing Page content type
   - Publish the content type
   - Create sample entries for "page-1" and "page-2" if they don't exist

## Sample Data

The deployment script automatically creates two sample landing page entries:

- **Landing Page 1** (slug: "page-1")
- **Landing Page 2** (slug: "page-2")

Both entries start with empty layout configurations that can be populated using the Contentful App.

## Files

- `content-types/landing-page.json`: Content type definition
- `scripts/deploy-content-type.js`: Deployment script
- `package.json`: Dependencies and scripts
- `README.md`: This documentation