#!/bin/bash

# Scout Databank Dashboard Deployment Script

echo "🚀 Deploying Scout Databank Dashboard..."

# Build the application
echo "📦 Building application..."
npm run build

# Deploy to Vercel
echo "🌐 Deploying to Vercel..."
vercel --prod

echo "✅ Deployment complete!"
echo "📊 Your Scout Databank Dashboard is now live!"