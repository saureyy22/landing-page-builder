#!/bin/bash

# Deployment script for Contentful Landing Page Builder
# Usage: ./scripts/deploy.sh [version]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Default version if not provided
VERSION=${1:-"1.0.0"}

echo -e "${GREEN}🚀 Starting deployment process for version ${VERSION}${NC}"

# Validate version format (semantic versioning)
if [[ ! $VERSION =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    echo -e "${RED}❌ Invalid version format. Please use semantic versioning (e.g., 1.0.0)${NC}"
    exit 1
fi

# Check if we're on main/master branch
CURRENT_BRANCH=$(git branch --show-current)
if [[ "$CURRENT_BRANCH" != "main" && "$CURRENT_BRANCH" != "master" ]]; then
    echo -e "${YELLOW}⚠️  Warning: You're not on main/master branch. Current branch: ${CURRENT_BRANCH}${NC}"
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${RED}❌ Deployment cancelled${NC}"
        exit 1
    fi
fi

# Check for uncommitted changes
if [[ -n $(git status --porcelain) ]]; then
    echo -e "${RED}❌ You have uncommitted changes. Please commit or stash them first.${NC}"
    git status --short
    exit 1
fi

# Run tests and build checks
echo -e "${GREEN}🔍 Running pre-deployment checks...${NC}"

# Type check all packages
echo "Running type checks..."
npm run type-check

# Build all packages
echo "Building all packages..."
npm run build

# Run linting
echo "Running linting..."
npm run lint

echo -e "${GREEN}✅ All pre-deployment checks passed${NC}"

# Create and push git tag
echo -e "${GREEN}🏷️  Creating git tag v${VERSION}...${NC}"

# Check if tag already exists
if git rev-parse "v${VERSION}" >/dev/null 2>&1; then
    echo -e "${RED}❌ Tag v${VERSION} already exists${NC}"
    exit 1
fi

# Create annotated tag
git tag -a "v${VERSION}" -m "Release version ${VERSION}"

# Push tag to origin
git push origin "v${VERSION}"

echo -e "${GREEN}✅ Git tag v${VERSION} created and pushed${NC}"

# Display deployment instructions
echo -e "${GREEN}📋 Next steps:${NC}"
echo "1. Deploy Landing Pages:"
echo "   cd apps/landing-pages && vercel --prod"
echo ""
echo "2. Deploy Contentful App:"
echo "   cd apps/contentful-app && vercel --prod"
echo ""
echo "3. Update Contentful App configuration with new URLs"
echo ""
echo -e "${GREEN}🎉 Deployment preparation complete!${NC}"

# Optional: Open deployment URLs
read -p "Open Vercel dashboard? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    if command -v open &> /dev/null; then
        open "https://vercel.com/dashboard"
    elif command -v xdg-open &> /dev/null; then
        xdg-open "https://vercel.com/dashboard"
    else
        echo "Please open https://vercel.com/dashboard manually"
    fi
fi