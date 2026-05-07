#!/bin/bash

# Deployment helper script for InfinityFree hosting
# This script prepares the project for deployment

echo "🚀 TheCapsRepo Deployment Helper"
echo ""

# Step 1: Build frontend
echo "📦 Building frontend..."
npm run build

if [ $? -ne 0 ]; then
  echo "❌ Build failed. Please fix errors and try again."
  exit 1
fi

echo "✅ Frontend built successfully!"
echo ""
echo "📁 Build output: ./dist/"
echo ""
echo "Next steps:"
echo "1. Upload contents of ./dist/ to InfinityFree public directory"
echo "2. Deploy backend to Render/Railway/Replit"
echo "3. Update .env.production with your backend API URL"
echo "4. Ensure database is configured on your backend host"
echo ""
echo "For detailed instructions, see DEPLOYMENT_INFINITYFREE.md"
