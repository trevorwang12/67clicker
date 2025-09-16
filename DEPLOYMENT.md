# growden Deployment Guide

Complete guide for deploying Clashle to various cloud platforms.

## 🚀 Quick Deploy

### Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

1. **Click the Deploy button above**
2. **Connect your Git repository**
3. **Set environment variables**:
   ```bash
   NODE_ENV=production
   ENABLE_ADMIN=false
   NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
   ADMIN_KEY=your-secure-admin-key
   ```
4. **Deploy and enjoy!**

### Manual Vercel Deployment

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod

# Set environment variables
vercel env add NODE_ENV production
vercel env add ENABLE_ADMIN false  
vercel env add NEXT_PUBLIC_SITE_URL production
vercel env add ADMIN_KEY production
```

## 📋 Environment Variables

### Required Variables

```bash
# Basic Configuration
NODE_ENV=production
NEXT_PUBLIC_SITE_URL=https://your-domain.com

# Admin Security
ENABLE_ADMIN=false
ADMIN_KEY=your-secure-random-key-here
```

### Optional Variables

```bash
# SEO Configuration  
NEXT_PUBLIC_SITE_NAME=Clashle
NEXT_PUBLIC_DEFAULT_TITLE=Clashle - Guess the Clash Royale Card
NEXT_PUBLIC_DEFAULT_DESCRIPTION=Daily Clash Royale word puzzle game

# Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX

# Feature Flags
NEXT_PUBLIC_DEBUG_MODE=false
```

## 🔒 Security Configuration

### Admin Panel Security

For **public production sites**, always set:
```bash
ENABLE_ADMIN=false
```

For **private admin-managed sites**:
```bash
ENABLE_ADMIN=true
ADMIN_KEY=your-very-secure-random-key
```

### Security Headers

The included `vercel.json` provides:
- X-Frame-Options: SAMEORIGIN
- X-Content-Type-Options: nosniff
- Referrer-Policy: strict-origin-when-cross-origin
- Strict-Transport-Security
- Cache control headers

## ⚡ Performance Configuration

### Vercel Configuration

The `vercel.json` file includes:
- Function timeouts for API routes
- Optimal caching headers
- Image optimization settings
- Security headers

### Build Optimization

```bash
# Production build
npm run build

# Analyze bundle size
npm run build:analyze
```

## 🌐 Custom Domain Setup

### Vercel Custom Domain

1. **Add domain in Vercel Dashboard**:
   - Go to Project Settings > Domains
   - Add your custom domain
   - Follow DNS configuration instructions

2. **Update environment variables**:
   ```bash
   NEXT_PUBLIC_SITE_URL=https://yourdomain.com
   ```

3. **SSL Certificate**:
   - Vercel automatically provides SSL certificates
   - Your site will be available at `https://yourdomain.com`

## 🔧 Troubleshooting

### Common Deployment Issues

**Build Fails**:
- Check Node.js version (requires 18+)
- Verify all dependencies are installed
- Check for TypeScript errors: `npm run lint`

**Environment Variables Not Working**:
- Verify variable names are exactly as specified
- Restart deployment after adding variables
- Check Vercel dashboard for variable values

**Admin Panel Issues**:
- If admin is disabled, `/admin` redirects to homepage
- Check `ENABLE_ADMIN` environment variable
- Verify `ADMIN_KEY` is set correctly

**Performance Issues**:
- Enable Vercel Analytics for monitoring
- Check Core Web Vitals in Vercel dashboard
- Optimize images are in WebP format

### Logs and Monitoring

**Vercel Logs**:
```bash
# View function logs
vercel logs

# Real-time logs
vercel logs --follow
```

**Error Monitoring**:
- Vercel automatically captures errors
- Check Function Logs in dashboard
- Monitor Core Web Vitals

## 📊 Post-Deployment Checklist

- [ ] **Site loads correctly** at production URL
- [ ] **Daily puzzle works** and displays properly  
- [ ] **Keyboard input functions** for desktop users
- [ ] **Mobile experience** is smooth and responsive
- [ ] **Sharing functionality** works correctly
- [ ] **Admin panel** behaves as expected (enabled/disabled)
- [ ] **Custom domain** (if applicable) resolves correctly
- [ ] **SSL certificate** is active and working
- [ ] **Meta tags** display correctly in social media previews
- [ ] **Analytics** (if configured) is tracking visits
- [ ] **Performance metrics** meet Core Web Vitals thresholds

## 🚀 Advanced Configuration

### Custom Branding

Update these files for custom branding:
- `app/layout.tsx` - Site metadata
- `public/favicon.ico` - Site favicon  
- `public/apple-touch-icon.png` - iOS icon
- `public/manifest.json` - PWA configuration

### SEO Optimization

The deployment includes:
- Automatic sitemap generation
- Structured data markup
- Open Graph tags
- Twitter Card support
- Search engine optimization

### Monitoring Setup

Recommended monitoring tools:
- **Vercel Analytics**: Built-in performance monitoring
- **Google Analytics**: User behavior tracking
- **Google Search Console**: SEO monitoring
- **Uptime monitoring**: Service availability

## 💡 Tips for Success

1. **Test locally first**: Always test your deployment locally with `npm run build && npm start`

2. **Gradual rollout**: Deploy to a staging URL first, then switch your custom domain

3. **Monitor performance**: Use Vercel Analytics to track Core Web Vitals

4. **SEO optimization**: Submit your sitemap to Google Search Console

5. **Regular updates**: Keep dependencies updated for security and performance

---

## 🆘 Need Help?

If you encounter issues:

1. Check the [Troubleshooting section](README.md#troubleshooting) in the main README
2. Verify all environment variables are set correctly
3. Check Vercel function logs for error details
4. Ensure your domain's DNS settings are correct

Happy deploying! 🚀