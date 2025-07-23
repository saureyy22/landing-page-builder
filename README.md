# Contentful Landing Page Builder

A fullstack landing page builder system that integrates with Contentful CMS. The system consists of two main components: a fullscreen Contentful App that provides a visual drag-and-drop interface for editors to arrange landing page components, and a Next.js frontend that renders these pages using the layout configuration stored in Contentful.

## Project Structure

This is a monorepo containing the following packages:

```
project-root/
├── apps/
│   ├── contentful-app/          # React Contentful App for visual editing
│   └── landing-pages/           # Next.js frontend for rendering pages
├── packages/
│   └── shared/                  # Shared TypeScript types and utilities
├── package.json                 # Root package.json with workspace configuration
└── tsconfig.json               # Root TypeScript configuration
```

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0

### Installation

```bash
npm install
```

### Development

Build the shared package:
```bash
npm run build --workspace=packages/shared
```

Run type checking across all packages:
```bash
npx tsc --noEmit
```

### Shared Package

The `@contentful-landing-page-builder/shared` package contains:

- **TypeScript interfaces** for all data models (LayoutConfig, ComponentInstance, etc.)
- **Utility functions** for working with layout configurations
- **Component data types** for Hero Block, Two Column Row, and 2x2 Image Grid

### Available Scripts

- `npm run build` - Build all packages
- `npm run dev` - Start development servers for all apps
- `npm run test` - Run tests for all packages
- `npm run lint` - Lint all packages
- `npm run type-check` - Type check all packages

## Architecture

The system uses a monorepo structure with shared TypeScript types to ensure consistency between the visual editor and the frontend renderer. Path mapping is configured to allow easy imports of shared types across all applications.

## Deployment

This project is designed to be deployed on Vercel with separate deployments for each application.

### Prerequisites for Deployment

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Contentful Space**: Set up a Contentful space with the required content types
3. **Environment Variables**: Configure all required environment variables

### Deployment Steps

#### 1. Deploy Landing Pages (Next.js Frontend)

```bash
# Navigate to the landing pages app
cd apps/landing-pages

# Install Vercel CLI (if not already installed)
npm i -g vercel

# Deploy to Vercel
vercel --prod
```

**Environment Variables for Landing Pages:**
- `CONTENTFUL_SPACE_ID`: Your Contentful space ID
- `CONTENTFUL_ACCESS_TOKEN`: Contentful Delivery API token
- `CONTENTFUL_PREVIEW_ACCESS_TOKEN`: Contentful Preview API token
- `CONTENTFUL_ENVIRONMENT`: Contentful environment (usually 'master')
- `NEXT_PUBLIC_SITE_URL`: Your deployed domain URL
- `NEXTAUTH_SECRET`: Secret for NextAuth (generate with `openssl rand -base64 32`)

#### 2. Deploy Contentful App

```bash
# Navigate to the contentful app
cd apps/contentful-app

# Deploy to Vercel
vercel --prod
```

**Environment Variables for Contentful App:**
- `VITE_CONTENTFUL_SPACE_ID`: Your Contentful space ID
- `VITE_CONTENTFUL_MANAGEMENT_TOKEN`: Contentful Management API token
- `VITE_CONTENTFUL_ENVIRONMENT`: Contentful environment (usually 'master')
- `VITE_CONTENTFUL_APP_ID`: Your Contentful App ID
- `VITE_PREVIEW_URL`: URL of your deployed landing pages app

#### 3. Configure Contentful App

1. In your Contentful space, go to Apps → Manage apps
2. Create a new app or update existing app configuration
3. Set the App URL to your deployed Contentful App URL
4. Configure the app to appear in the entry editor for Landing Page content type

### Git Tagging for Releases

This project uses semantic versioning with Git tags:

```bash
# Create and push a new version tag
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0

# List all tags
git tag -l

# Delete a tag (if needed)
git tag -d v1.0.0
git push origin --delete v1.0.0
```

### Deployment Configuration Files

- `apps/landing-pages/vercel.json`: Vercel configuration for Next.js app
- `apps/contentful-app/vercel.json`: Vercel configuration for React app
- `apps/landing-pages/.env.example`: Environment variables template for landing pages
- `apps/contentful-app/.env.example`: Environment variables template for contentful app

### Performance Monitoring

The landing pages app includes built-in performance monitoring:

- **Lighthouse CI**: Automated performance testing
- **Core Web Vitals**: Real-time performance metrics
- **Bundle Analysis**: Build size optimization tracking

Run performance tests locally:
```bash
cd apps/landing-pages
npm run test:performance
```

### Troubleshooting Deployment

**Common Issues:**

1. **Build Failures**: Ensure all environment variables are set correctly
2. **CORS Issues**: Check Contentful App CSP headers in vercel.json
3. **Asset Loading**: Verify Contentful asset URLs are accessible
4. **Preview Not Working**: Ensure VITE_PREVIEW_URL matches deployed landing pages URL

**Debug Commands:**
```bash
# Check build locally
npm run build

# Verify environment variables
vercel env ls

# Check deployment logs
vercel logs [deployment-url]
```

## Version

v1.0.0