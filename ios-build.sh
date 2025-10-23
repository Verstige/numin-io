#!/bin/bash

# iOS Build Script for Nexus AI
# This script builds the React app and syncs it with Capacitor for iOS development

echo "🚀 Building Nexus AI for iOS..."

# Build the React app
echo "📦 Building React application..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please fix the errors and try again."
    exit 1
fi

echo "✅ React app built successfully!"

# Sync with Capacitor
echo "🔄 Syncing with Capacitor..."
npx cap sync ios

if [ $? -ne 0 ]; then
    echo "❌ Capacitor sync failed. Please check the error messages."
    exit 1
fi

echo "✅ Capacitor sync completed!"

# Open in Xcode
echo "📱 Opening Xcode..."
npx cap open ios

echo "🎉 iOS project is ready! You can now build and run the app in Xcode."
echo ""
echo "Next steps:"
echo "1. Select your development team in Xcode"
echo "2. Choose a device or simulator"
echo "3. Click the Run button to build and test"
echo ""
echo "For App Store submission:"
echo "1. Archive the app in Xcode"
echo "2. Upload to App Store Connect"
echo "3. Complete app metadata and screenshots"
echo "4. Submit for review"





