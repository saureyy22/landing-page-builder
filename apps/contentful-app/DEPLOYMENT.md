# Contentful App Deployment Guide

This document provides detailed instructions for deploying the React Contentful App to Vercel.

## Prerequisites

- Vercel account
- Contentful space with Management API access
- Contentful App configured in your space
- Git repository connected to Vercel

## Environment Variables

Configure the following environment variables in your Vercel project settings:

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_CONTENTFUL_SPACE_ID` | Your Contentful space ID | `abc123def456` |
| `VITE_CONTENTFUL_MANAGEMENT_TOKEN` | Contentful Management API token | `your_management_token` |
| `VITE_CONTENTFUL_ENVIRONMENT` | Contentful environment | `master` |
| `VITE_CONTENTFUL_APP_ID` | Your Contentful App ID | `your_app_id` |
| `VITE_PREVIEW_URL` | URL of deployed landing pages | `https://your-landing-pages.vercel.app` |

### Optional Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_DEV_MODE` | Enable development features | `false` |

## Deployment Steps

### 1. Automatic Deployment (Recommended)

1. Connect your Git repository to Vercel
2. Set the root directory to `apps/contentful-app`
3. Configure environment variables in Vercel dashboard
4. Deploy automatically on git push

### 2. Manual Deployment

```bash
# Navigate to the contentful app directory
cd apps/contentful-app

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
- **Output Directory**: `dist`
- **Install Command**: `npm install`
- **Node.js Version**: 18.x

## Contentful App Configuration

After deployment, configure the app in Contentful:

### 1. Create/Update Contentful App

1. Go to your Contentful space
2. Navigate to Apps → Manage apps
3. Create new app or edit existing app
4. Set the following configuration:

```json
{
  "name": "Landing Page Builder",
  "src": "https://your-contentful-app.vercel.app",
  "locations": [
    {
      "location": "entry-editor",
      "contentTypes": ["landingPage"]
    }
  ],
  "parameters": {
    "installation": [],
    "instance": []
  }
}
```

### 2. App Permissions

Ensure your Management API token has the following permissions:

- Read and write access to entries
- Read access to assets
- Read access to content types
- Read access to environments

## Security Configuration

### Content Security Policy

The `vercel.json` includes CSP headers allowing:

- Contentful API domains
- Asset domains
- Required script and style sources

### CORS Configuration

The app is configured to work within Contentful's iframe environment with:

- `X-Frame-Options: SAMEORIGIN`
- Appropriate CSP directives

## Performance Optimization

### Bundle Optimization

The Vite build process includes:

- Tree shaking for unused code
- Code splitting for optimal loading
- Asset optimization

### Caching Strategy

- Static assets cached for 1 year
- Application files with appropriate cache headers

## Troubleshooting

### Common Issues

1. **App Not Loading in Contentful**
   - Check `VITE_CONTENTFUL_APP_ID` matches registered app
   - Verify app URL in Contentful matches deployed URL
   - Check CSP headers allow iframe embedding

2. **API Errors**
   - Verify `VITE_CONTENTFUL_MANAGEMENT_TOKEN` has correct permissions
   - Check `VITE_CONTENTFUL_SPACE_ID` is correct
   - Ensure environment exists

3. **Preview Not Working**
   - Verify `VITE_PREVIEW_URL` matches deployed landing pages URL
   - Check landing pages app is deployed and accessible
   - Ensure CORS configuration allows preview requests

4. **State Not Persisting**
   - Check Redux Persist configuration
   - Verify localStorage is available
   - Check for console errors related to state

### Debug Commands

```bash
# Check build locally
npm run build

# Type check
npm run type-check

# Preview build locally
npm run preview

# Development mode
npm run dev
```

### Debug in Contentful

1. Open browser developer tools
2. Check console for errors
3. Verify network requests to Contentful API
4. Check localStorage for persisted state

## Testing the Deployment

### 1. Functional Testing

1. Open Contentful space
2. Navigate to Landing Page entry
3. Verify app loads in entry editor
4. Test drag-and-drop functionality
5. Test component editing
6. Test auto-save functionality
7. Test preview button

### 2. Integration Testing

1. Create/edit landing page in Contentful App
2. Save changes
3. Open preview URL
4. Verify changes appear on landing page
5. Test undo/redo functionality

## Support

For deployment issues:

1. Check Vercel deployment logs
2. Verify all environment variables
3. Test build locally
4. Check Contentful App configuration
5. Verify API token permissions