# Nexus AI - Netlify Deployment Guide

This guide will help you deploy the Nexus AI project to Netlify.

## 🚀 Quick Deploy

### Option 1: Deploy from Git (Recommended)

1. **Connect your repository to Netlify:**
   - Go to [Netlify](https://app.netlify.com)
   - Click "New site from Git"
   - Connect your GitHub/GitLab/Bitbucket repository
   - Select this repository

2. **Configure build settings:**
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Node.js version: `18`

3. **Deploy:**
   - Click "Deploy site"
   - Netlify will automatically build and deploy your site

### Option 2: Manual Deploy

1. **Build the project locally:**
   ```bash
   npm run build
   ```

2. **Deploy to Netlify:**
   - Go to [Netlify](https://app.netlify.com)
   - Drag and drop the `dist` folder to the deploy area
   - Your site will be live immediately

### Option 3: Netlify CLI

1. **Install Netlify CLI:**
   ```bash
   npm install -g netlify-cli
   ```

2. **Build and deploy:**
   ```bash
   npm run build
   netlify deploy --prod --dir=dist
   ```

## ⚙️ Configuration Files

The following files are included for Netlify deployment:

- `netlify.toml` - Main Netlify configuration
- `public/_redirects` - Redirect rules for SPA routing
- `.nvmrc` - Node.js version specification
- `build.sh` - Custom build script (optional)

## 🔧 Build Settings

- **Build Command:** `npm run build`
- **Publish Directory:** `dist`
- **Node.js Version:** 18
- **NPM Version:** 9

## 🌐 Environment Variables

If you need to set environment variables:

1. Go to your Netlify site dashboard
2. Navigate to Site settings > Environment variables
3. Add any required variables

## 📁 File Structure

```
├── netlify.toml          # Netlify configuration
├── public/
│   └── _redirects        # Redirect rules
├── .nvmrc               # Node.js version
├── build.sh             # Build script
├── package.json         # Dependencies and scripts
└── dist/                # Built files (generated)
```

## 🔄 Continuous Deployment

Once connected to Git, Netlify will automatically:
- Deploy when you push to the main branch
- Run the build process
- Update your live site

## 🐛 Troubleshooting

### Build Failures
- Check the build logs in Netlify dashboard
- Ensure all dependencies are in `package.json`
- Verify Node.js version compatibility

### Routing Issues
- The `_redirects` file ensures SPA routing works
- All routes redirect to `index.html` for client-side routing

### Performance
- Static assets are cached for optimal performance
- Headers are configured for security and caching

## 📞 Support

For deployment issues:
1. Check Netlify build logs
2. Verify all configuration files are present
3. Ensure build command works locally first

---

**Happy Deploying! 🎉**
