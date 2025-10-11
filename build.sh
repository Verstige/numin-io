#!/bin/bash

# Exit on any error
set -e

echo "🚀 Starting Nexus build process..."

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Build the project
echo "🔨 Building project..."
npm run build

echo "✅ Build completed successfully!"

# List the dist directory contents
echo "📁 Build output:"
ls -la dist/
