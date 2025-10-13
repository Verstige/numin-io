# Nexus AI Business Suite - Deployment Guide

## 🚀 Quick Deployment

### Option 1: Deploy to Netlify (Recommended)

1. **Connect Repository**
   ```bash
   # Push your code to GitHub
   git add .
   git commit -m "Add Nexus AI Business Suite"
   git push origin main
   ```

2. **Deploy on Netlify**
   - Go to [netlify.com](https://netlify.com)
   - Click "New site from Git"
   - Connect your GitHub repository
   - Configure build settings:
     - Build command: `npm run build`
     - Publish directory: `dist`
     - Node version: `18`

3. **Environment Variables**
   Add these environment variables in Netlify:
   ```
   VITE_GEMINI_API_KEY=your_gemini_api_key
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_GEMINI_MODEL=gemini-1.5-pro
   ```

### Option 2: Deploy to Vercel

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   vercel --prod
   ```

3. **Environment Variables**
   Add environment variables in Vercel dashboard:
   ```
   VITE_GEMINI_API_KEY=your_gemini_api_key
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

## 🗄️ Database Setup

### Supabase Configuration

1. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Note your project URL and anon key

2. **Run Database Schema**
   ```sql
   -- Copy and paste the contents of supabase-schema.sql
   -- into the Supabase SQL editor and run it
   ```

3. **Configure RLS Policies**
   - Enable Row Level Security on all tables
   - Set up policies for multi-tenant access
   - Configure authentication settings

### Environment Variables

Create a `.env` file in your project root:
```env
# Required
VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional
VITE_GEMINI_MODEL=gemini-1.5-pro
VITE_APP_ENV=production
```

## 🔧 Production Configuration

### Build Optimization

1. **Optimize Bundle Size**
   ```bash
   npm run build
   # Check dist folder for optimized assets
   ```

2. **Enable Compression**
   - Netlify: Automatic gzip compression
   - Vercel: Automatic compression
   - Custom server: Configure gzip/brotli

### Security Configuration

1. **API Keys**
   - Never commit API keys to version control
   - Use environment variables for all sensitive data
   - Rotate keys regularly

2. **CORS Settings**
   - Configure allowed origins in Supabase
   - Set up proper CORS headers
   - Use HTTPS in production

3. **Rate Limiting**
   - Implement API rate limiting
   - Set up request throttling
   - Monitor API usage

## 📊 Monitoring & Analytics

### Performance Monitoring

1. **Web Vitals**
   - Set up Core Web Vitals monitoring
   - Monitor LCP, FID, CLS metrics
   - Use Google PageSpeed Insights

2. **Error Tracking**
   - Implement error boundary components
   - Set up error logging service
   - Monitor API error rates

### Business Metrics

1. **Usage Analytics**
   - Track user engagement
   - Monitor feature adoption
   - Analyze user journeys

2. **Performance Metrics**
   - Agent response times
   - Workflow execution success rates
   - API connector health

## 🔄 CI/CD Pipeline

### GitHub Actions (Optional)

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Build
        run: npm run build
        env:
          VITE_GEMINI_API_KEY: ${{ secrets.VITE_GEMINI_API_KEY }}
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
      - name: Deploy to Netlify
        uses: nwtgck/actions-netlify@v1.2
        with:
          publish-dir: './dist'
          production-branch: main
          github-token: ${{ secrets.GITHUB_TOKEN }}
          deploy-message: "Deploy from GitHub Actions"
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

## 🧪 Testing

### Pre-deployment Checklist

- [ ] All environment variables configured
- [ ] Database schema deployed
- [ ] RLS policies configured
- [ ] API keys valid and accessible
- [ ] Build process successful
- [ ] No console errors
- [ ] Responsive design tested
- [ ] Cross-browser compatibility verified

### Testing Commands

```bash
# Run linting
npm run lint

# Run build test
npm run build

# Test production build locally
npm run preview
```

## 🚨 Troubleshooting

### Common Issues

1. **Build Failures**
   - Check Node.js version (18+)
   - Verify all dependencies installed
   - Check for TypeScript errors

2. **Runtime Errors**
   - Verify environment variables
   - Check Supabase connection
   - Validate API keys

3. **Performance Issues**
   - Enable compression
   - Optimize images
   - Use CDN for static assets

### Support

- Check GitHub Issues for known problems
- Review deployment logs
- Test in staging environment first

## 📈 Scaling

### Performance Optimization

1. **Database**
   - Add database indexes
   - Implement connection pooling
   - Use read replicas for analytics

2. **Frontend**
   - Implement code splitting
   - Use lazy loading
   - Optimize bundle size

3. **Backend**
   - Add caching layers
   - Implement rate limiting
   - Use CDN for static assets

### Monitoring Setup

1. **Uptime Monitoring**
   - Set up uptime checks
   - Configure alerting
   - Monitor API endpoints

2. **Performance Monitoring**
   - Track response times
   - Monitor error rates
   - Set up dashboards

---

## 🎉 Deployment Complete!

Your Nexus AI Business Suite is now live and ready to transform businesses with autonomous AI agents!

**Next Steps:**
1. Set up monitoring and alerting
2. Configure backup strategies
3. Plan for scaling and growth
4. Gather user feedback
5. Iterate and improve

For support and questions, refer to the main README or create an issue in the repository.
