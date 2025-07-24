# Troubleshooting Guide

This guide helps resolve common issues with the Contentful Landing Page Builder app.

## Issues Fixed in Latest Deployment

### 1. Entry Not Found (404 Errors)
**Problem**: App trying to access non-existent Contentful entries like `dev-entry-1753338038508`

**Solution**: 
- Added automatic entry creation when entries don't exist
- Enhanced error handling in `contentfulService.ts`
- Entries are now created with default structure when missing

### 2. Image Loading Failures
**Problem**: Images from `via.placeholder.com` not loading due to DNS issues

**Solution**:
- Updated CSP to include more reliable placeholder services
- Added `https://placeholder.com` and `https://dummyimage.com` as alternatives
- Fixed CSP to allow `https://fastly.picsum.photos`

### 3. React Error #185 in HeroBlockEditor
**Problem**: Component trying to access undefined properties

**Solution**:
- Added null checks for `backgroundImage` property
- Fixed property access patterns (`ctaText` instead of `cta.text`)
- Added default data initialization for missing component data

### 4. Popup Blocker Issues
**Problem**: Preview windows being blocked by browser popup blockers

**Solution**:
- Enhanced popup handling with better error detection
- Added clipboard fallback when popups are blocked
- Improved user messaging for blocked popups

## Common Issues and Solutions

### Preview Not Working
1. **Check deployment status**: The app checks if the preview deployment is available
2. **Allow popups**: Enable popups for the Contentful app domain
3. **Copy URL fallback**: If popups are blocked, use the clipboard fallback option

### Images Not Loading
1. **Check CSP**: Ensure your image domains are in the Content Security Policy
2. **Verify URLs**: Make sure image URLs are accessible and valid
3. **Use supported services**: Stick to approved image placeholder services

### Entry Creation Issues
1. **Check API token**: Ensure your Contentful Management API token has write permissions
2. **Verify space ID**: Confirm the space ID in environment variables is correct
3. **Environment access**: Make sure the token has access to the specified environment

### Auto-save Failures
1. **Network connectivity**: Check internet connection
2. **API limits**: Contentful has rate limits - wait and retry
3. **Entry conflicts**: Multiple users editing the same entry can cause conflicts

## Environment Variables

Ensure these are set correctly in your `.env.production`:

```bash
VITE_CONTENTFUL_SPACE_ID=your_space_id
VITE_CONTENTFUL_MANAGEMENT_TOKEN=your_management_token
VITE_CONTENTFUL_ENVIRONMENT=master
REACT_APP_PREVIEW_URL=https://your-preview-domain.vercel.app
NODE_ENV=production
```

## Debugging Steps

### 1. Check Browser Console
Look for specific error messages and stack traces

### 2. Network Tab
Monitor API calls to Contentful and check for failed requests

### 3. Contentful Web App
Verify entries exist and have the expected structure in Contentful's web interface

### 4. Preview URL
Test the preview URL directly in a new tab to ensure the landing page app is working

## Getting Help

If issues persist:

1. Check the browser console for detailed error messages
2. Verify all environment variables are set correctly
3. Test with a fresh Contentful entry
4. Clear browser cache and cookies
5. Try in an incognito/private browsing window

## Performance Tips

1. **Image optimization**: Use appropriately sized images
2. **Caching**: Leverage browser caching for static assets
3. **API calls**: Minimize unnecessary Contentful API calls
4. **Bundle size**: Monitor and optimize JavaScript bundle size