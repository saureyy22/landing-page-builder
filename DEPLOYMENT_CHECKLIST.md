# Deployment Checklist

Use this checklist to ensure a successful deployment of the Contentful Landing Page Builder system.

## Pre-Deployment Checklist

### Code Quality
- [ ] All tests pass
- [ ] Type checking passes (`npm run type-check`)
- [ ] Linting passes (`npm run lint`)
- [ ] Build succeeds for both applications (`npm run build`)
- [ ] No uncommitted changes in git
- [ ] On main/master branch

### Environment Setup
- [ ] Contentful space created and configured
- [ ] Landing Page content type created with required fields
- [ ] Contentful Management API token generated with proper permissions
- [ ] Contentful Delivery API token generated
- [ ] Contentful Preview API token generated (optional)
- [ ] Vercel account set up

## Deployment Steps

### 1. Version Tagging
- [ ] Run deployment script: `./scripts/deploy.sh [version]` or `.\scripts\deploy.ps1 [version]`
- [ ] Verify git tag created: `git tag -l`
- [ ] Confirm tag pushed to remote: `git ls-remote --tags origin`

### 2. Deploy Landing Pages Application

#### Vercel Configuration
- [ ] Connect git repository to Vercel
- [ ] Set root directory to `apps/landing-pages`
- [ ] Configure build settings:
  - Build Command: `npm run build`
  - Output Directory: `.next`
  - Install Command: `npm install`

#### Environment Variables
- [ ] `CONTENTFUL_SPACE_ID`: Your Contentful space ID
- [ ] `CONTENTFUL_ACCESS_TOKEN`: Contentful Delivery API token
- [ ] `CONTENTFUL_PREVIEW_ACCESS_TOKEN`: Contentful Preview API token
- [ ] `CONTENTFUL_ENVIRONMENT`: Contentful environment (usually 'master')
- [ ] `NEXT_PUBLIC_SITE_URL`: Your deployed domain URL
- [ ] `NEXTAUTH_SECRET`: Generated secret for NextAuth

#### Optional Environment Variables
- [ ] `NEXT_PUBLIC_GA_ID`: Google Analytics ID
- [ ] `NEXT_PUBLIC_VERCEL_ANALYTICS_ID`: Vercel Analytics ID

#### Deployment
- [ ] Deploy to production: `vercel --prod`
- [ ] Verify deployment successful
- [ ] Test landing page URLs: `/landing/page-1`, `/landing/page-2`
- [ ] Verify SEO metadata and structured data
- [ ] Check Lighthouse scores (Performance, SEO, Accessibility ≥90)

### 3. Deploy Contentful App

#### Vercel Configuration
- [ ] Connect git repository to Vercel (separate project)
- [ ] Set root directory to `apps/contentful-app`
- [ ] Configure build settings:
  - Build Command: `npm run build`
  - Output Directory: `dist`
  - Install Command: `npm install`

#### Environment Variables
- [ ] `VITE_CONTENTFUL_SPACE_ID`: Your Contentful space ID
- [ ] `VITE_CONTENTFUL_MANAGEMENT_TOKEN`: Contentful Management API token
- [ ] `VITE_CONTENTFUL_ENVIRONMENT`: Contentful environment (usually 'master')
- [ ] `VITE_CONTENTFUL_APP_ID`: Your Contentful App ID
- [ ] `VITE_PREVIEW_URL`: URL of deployed landing pages app

#### Optional Environment Variables
- [ ] `VITE_DEV_MODE`: Set to `false` for production

#### Deployment
- [ ] Deploy to production: `vercel --prod`
- [ ] Verify deployment successful
- [ ] Test app loads independently

### 4. Configure Contentful App

#### App Registration
- [ ] Go to Contentful space → Apps → Manage apps
- [ ] Create new app or update existing app
- [ ] Set App URL to deployed Contentful App URL
- [ ] Configure app locations:
  - Location: `entry-editor`
  - Content Types: `landingPage`
- [ ] Save app configuration

#### Permissions Verification
- [ ] Management API token has read/write access to entries
- [ ] Management API token has read access to assets
- [ ] Management API token has read access to content types
- [ ] Management API token has read access to environments

## Post-Deployment Testing

### Functional Testing
- [ ] Open Contentful space
- [ ] Navigate to Landing Page entry
- [ ] Verify Contentful App loads in entry editor
- [ ] Test drag-and-drop functionality
- [ ] Test component editing (Hero Block, Two Column Row, Image Grid)
- [ ] Test auto-save functionality (wait 1.5s after changes)
- [ ] Test undo/redo functionality
- [ ] Test preview button opens correct URL

### Integration Testing
- [ ] Create new landing page in Contentful App
- [ ] Add and configure components
- [ ] Save changes
- [ ] Open preview URL
- [ ] Verify changes appear on landing page
- [ ] Test navigation between pages
- [ ] Verify SEO metadata in page source

### Performance Testing
- [ ] Run Lighthouse audit on landing pages
- [ ] Verify Core Web Vitals scores
- [ ] Check bundle sizes are optimized
- [ ] Test loading performance on mobile/desktop

## Troubleshooting

### Common Issues and Solutions

#### Landing Pages Not Loading
- [ ] Check environment variables in Vercel
- [ ] Verify Contentful tokens and permissions
- [ ] Check build logs for errors
- [ ] Verify content exists and is published

#### Contentful App Not Loading
- [ ] Check app URL in Contentful matches deployed URL
- [ ] Verify CSP headers allow iframe embedding
- [ ] Check Management API token permissions
- [ ] Verify app ID matches registered app

#### Preview Not Working
- [ ] Check `VITE_PREVIEW_URL` matches landing pages URL
- [ ] Verify landing pages app is accessible
- [ ] Check CORS configuration

#### Performance Issues
- [ ] Check Lighthouse scores
- [ ] Verify image optimization is working
- [ ] Check bundle analysis for large dependencies
- [ ] Monitor Core Web Vitals

## Rollback Plan

If deployment fails:

1. **Revert Git Tag**
   ```bash
   git tag -d v[version]
   git push origin --delete v[version]
   ```

2. **Rollback Vercel Deployment**
   - Go to Vercel dashboard
   - Select previous deployment
   - Promote to production

3. **Revert Contentful App Configuration**
   - Update app URL to previous working version
   - Verify app functionality

## Success Criteria

Deployment is successful when:
- [ ] Both applications deploy without errors
- [ ] All environment variables are configured correctly
- [ ] Contentful App loads and functions in entry editor
- [ ] Landing pages render correctly with proper SEO
- [ ] Preview functionality works end-to-end
- [ ] Performance metrics meet requirements (Lighthouse ≥90)
- [ ] All user workflows function as expected

## Documentation Updates

After successful deployment:
- [ ] Update README with new deployment URLs
- [ ] Document any configuration changes
- [ ] Update version numbers in documentation
- [ ] Create release notes for the version