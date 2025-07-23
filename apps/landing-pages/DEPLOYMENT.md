# Landing Pages Deployment Guide

This document provides detailed instructions for deploying the Next.js landing pages application to Vercel.

## Prerequisites

- Vercel account
- Contentful space with Landing Page content type configured
- Git repository connected to Vercel

## Environment Variables

Configure the following environment variables in your Vercel project settings:

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `CONTENTFUL_SPACE_ID` | Your Contentful space ID | `abc123def456` |
| `CONTENTFUL_ACCESS_TOKEN` | Contentful Delivery API token | `your_delivery_token` |
| `CONTENTFUL_PREVIEW_ACCESS_TOKEN` | Contentful Preview API token | `your_preview_token` |
| `CONTENTFUL_ENVIRONMENT` | Contentful environment | `master` |
| `NEXT_PUBLIC_SITE_URL` | Your deployed domain URL | `https://your-app.vercel.app` |
| `NEXTAUTH_SECRET` | Secret for NextAuth | Generate with `openssl rand -base64 32` |

### Optional Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_GA_ID` | Google Analytics ID | `G-XXXXXXXXXX` |
| `NEXT_PUBLIC_VERCEL_ANALYTICS_ID` | Vercel Analytics ID | `your_analytics_id` |

## Deployment Steps

### 1. Automatic Deployment (Recommended)

1. Connect your Git repository to Vercel
2. Set the root directory to `apps/landing-pages`
3. Configure environment variables in Vercel dashboard
4. Deploy automatically on git push

### 2. Manual Deployment

```bash
# Navigate to the landing pages directory
cd apps/landing-pages

# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

## Build Configuration

The application uses the following build settings:

- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`
- **Node.js Version**: 18.x

## Performance Optimization

### Caching Strategy

The `vercel.json` configuration includes:

- Static assets cached for 1 year
- Landing pages cached with appropriate headers
- Image optimization through Next.js

### Monitoring

Run performance tests:

```bash
# Build and analyze bundle
npm run build:analyze

# Run Lighthouse CI
npm run lighthouse:ci

# Monitor Core Web Vitals
npm run web-vitals

# Full performance test suite
npm run test:all
```

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check all environment variables are set
   - Verify Contentful tokens have correct permissions
   - Ensure shared package is built

2. **Content Not Loading**
   - Verify `CONTENTFUL_SPACE_ID` and `CONTENTFUL_ACCESS_TOKEN`
   - Check Contentful content type structure
   - Ensure content is published

3. **Images Not Displaying**
   - Verify Contentful asset URLs
   - Check Next.js image configuration
   - Ensure proper CORS settings

### Debug Commands

```bash
# Check build locally
npm run build

# Type check
npm run type-check

# Lint code
npm run lint

# Test performance locally
npm run test:performance
```

## Security Headers

The deployment includes security headers:

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`

## Support

For deployment issues:

1. Check Vercel deployment logs
2. Verify environment variables
3. Test build locally
4. Check Contentful API status