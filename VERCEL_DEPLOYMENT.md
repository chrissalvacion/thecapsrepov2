# Vercel + Supabase Deployment Guide

This guide walks you through deploying the TheCapsRepo project to Vercel with Supabase as the backend database.

## Prerequisites

- Vercel account (https://vercel.com)
- Supabase project set up and configured
- GitHub repository (Vercel integrates with GitHub)
- All environment variables ready

## Step 1: Prepare Your GitHub Repository

1. Push your code to GitHub:
   ```bash
   git add .
   git commit -m "Ready for Vercel deployment"
   git push origin main
   ```

2. Ensure `.env` is in `.gitignore` (should already be):
   ```bash
   cat .gitignore | grep "\.env"
   ```

3. Verify no sensitive files are committed:
   ```bash
   git log --all --full-history -- .env
   ```

## Step 2: Create Vercel Project

### Option A: Via Vercel Dashboard (Recommended)

1. Go to https://vercel.com and sign in
2. Click "Add New..." > "Project"
3. Select your GitHub repository
4. Click "Import"

### Option B: Via Vercel CLI

```bash
npm i -g vercel
vercel link
```

## Step 3: Configure Environment Variables in Vercel

In the Vercel dashboard, go to **Settings** > **Environment Variables** and add:

### Required Variables
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
JWT_SECRET=your-strong-random-jwt-secret
NODE_ENV=production
```

### Optional Variables
```
DEFAULT_ADMIN_EMAIL=admin@example.com
DEFAULT_ADMIN_PASSWORD=admin123
DEFAULT_ADMIN_NAME=Administrator
GEMINI_API_KEY=your-gemini-api-key
```

### Environment-Specific Variables

For each environment (Production, Preview, Development), you might want different Supabase projects:

**Production**
- Points to production Supabase project
- Use strong passwords and keys
- Enable all security features

**Preview** (Staging)
- Points to staging Supabase project
- Used for pull request previews
- Can use less strict security

**Development**
- Points to development Supabase project
- Used locally with `vercel env pull`

## Step 4: Build Configuration

The `vercel.json` file already contains optimal settings:
- Build command: `npm run build`
- Output directory: `dist`
- API routes: `/api/**/*.ts` → Serverless functions
- Static files: HTML/CSS/JS served from CDN

## Step 5: Deploy

### Automatic Deployment
Any push to your GitHub repository will automatically trigger a deployment to Vercel.

### Manual Deployment
```bash
vercel --prod
```

### Preview Deployment (from PR)
Vercel automatically creates preview deployments for pull requests.

## Step 6: Verify Deployment

After deployment completes:

1. **Check Frontend**
   - Visit your Vercel URL (e.g., `yourproject.vercel.app`)
   - Should redirect to `/login`
   - Try logging in with admin credentials

2. **Check API Health**
   ```bash
   curl https://yourproject.vercel.app/health
   ```
   Should return:
   ```json
   {
     "status": "ok",
     "timestamp": "2026-05-07T...",
     "environment": "production",
     "uptime": 123.45
   }
   ```

3. **Check API Authentication**
   ```bash
   curl -X POST https://yourproject.vercel.app/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@example.com","password":"admin123"}'
   ```

4. **Check Logs**
   - Go to Vercel dashboard
   - Select your project
   - Go to **Deployments** > **Logs**
   - Check for any errors

## Step 7: Configure Custom Domain (Optional)

1. In Vercel dashboard, go to **Settings** > **Domains**
2. Add your custom domain
3. Update DNS records to point to Vercel

## Step 8: Set Up CI/CD Pipeline

### Automatic Checks Before Deploy

Create `.github/workflows/ci.yml`:
```yaml
name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run lint
      - run: npm run build
```

## Production Checklist

- [ ] All environment variables set in Vercel dashboard
- [ ] Supabase service role key is kept secure
- [ ] JWT_SECRET is a strong random string (32+ characters)
- [ ] Default admin user exists in database
- [ ] Database schema is deployed to Supabase
- [ ] RLS policies are properly configured
- [ ] CORS is configured for your Vercel domain
- [ ] Custom domain is set up and DNS configured
- [ ] SSL/TLS certificate is valid
- [ ] Database backups are enabled
- [ ] Monitoring/logging is configured
- [ ] Error tracking is set up (e.g., Sentry)

## Common Issues & Troubleshooting

### Build Fails: "Cannot find module"

**Solution**: 
- Clear Vercel cache: Dashboard > Settings > Git > "Clear Git Cache"
- Reinstall dependencies: `rm package-lock.json && npm install`
- Push and redeploy

### Login Returns "Invalid credentials"

**Possible causes**:
1. Supabase credentials are incorrect
   - Verify SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
   - Check Supabase project is active

2. Admin user doesn't exist
   - Check Supabase SQL: `SELECT * FROM users;`
   - Create manually if needed

3. Password encoding issue
   - Ensure password is hashed with bcryptjs
   - Check password hash format starts with `$2a$`, `$2b$`, or `$2y$`

### API Returns 500 Error

**Solution**:
1. Check Vercel logs: Dashboard > Deployments > Logs
2. Verify environment variables are set
3. Check Supabase status page
4. Verify database schema exists
5. Check for TypeScript compilation errors: `npm run lint`

### Timeout Errors on API Calls

**Solution**:
- Verify Supabase connection is working
- Check database query performance
- Increase function timeout in `vercel.json` (max 60 seconds)
- Optimize database queries

### CORS Errors

**Solution**:
1. Update CORS configuration in `backend/api-app.ts`:
   ```typescript
   const allowedOrigins = [
     'https://yourproject.vercel.app',
     'https://www.yourproject.vercel.app',
     'https://yourdomain.com'
   ];
   ```

2. Ensure request includes proper headers:
   ```javascript
   fetch('/api/teams', {
     headers: {
       'Content-Type': 'application/json',
       'Authorization': `Bearer ${token}`
     }
   })
   ```

## Monitoring & Analytics

### Enable Vercel Analytics
1. Dashboard > Project Settings > Analytics
2. Click "Enable Web Analytics"

### Set Up Error Tracking (Sentry)

1. Create Sentry project
2. Add Sentry to your frontend:
   ```bash
   npm install @sentry/react
   ```

3. Initialize in `src/main.tsx`:
   ```typescript
   import * as Sentry from "@sentry/react";
   
   Sentry.init({
     dsn: "your-sentry-dsn",
     environment: process.env.NODE_ENV,
   });
   ```

### Enable Database Query Logging
In Supabase dashboard:
1. SQL Editor > Run:
   ```sql
   ALTER SYSTEM SET log_statement = 'all';
   SELECT pg_reload_conf();
   ```

## Scaling

### Database Connection Pooling
1. Use Supabase connection pooling for serverless
2. In Vercel, configure short connection timeouts
3. Monitor connection pool usage in Supabase

### Static Asset Optimization
- Vercel automatically caches static assets
- Images served from Vercel CDN
- Configure cache headers in `vercel.json`

### Performance Monitoring
- Monitor API response times in Vercel Insights
- Use Chrome DevTools for frontend performance
- Set up performance budgets

## Security Best Practices

1. **Keep Secrets Safe**
   - Never commit `.env` files
   - Use Vercel environment variables
   - Rotate keys periodically

2. **Enable HTTPS**
   - Always use https:// in production
   - Vercel provides free SSL certificates
   - Update API endpoints to use https

3. **API Rate Limiting**
   - Consider adding rate limiting middleware
   - Protect login endpoints specifically
   - Monitor for suspicious activity

4. **Database Access**
   - Use service role key only on backend
   - Expose only anon key to frontend
   - Review RLS policies regularly
   - Audit database access logs

5. **CORS Configuration**
   - Whitelist specific origins
   - Never use "*" in production
   - Validate and sanitize inputs

## Rollback Procedure

If something goes wrong:

1. **Check Recent Deployments**
   - Vercel Dashboard > Deployments
   - Select a previous working deployment

2. **Promote Previous Version**
   - Click on previous deployment
   - Click "Promote to Production"

3. **Or Redeploy from GitHub**
   - Push corrected code to GitHub
   - Vercel will automatically redeploy

4. **Emergency Rollback**
   - Update environment variables
   - Redeploy with previous config

## Backup & Disaster Recovery

1. **Database Backups**
   - Enable automated backups in Supabase
   - Store backups in secure location
   - Test restore procedure regularly

2. **Code Backup**
   - GitHub is your code backup
   - Keep releases tagged
   - Document recovery steps

3. **Configuration Backup**
   - Export environment variables periodically
   - Document all custom configurations
   - Keep deployment checklist updated

## Support & Resources

- **Vercel Docs**: https://vercel.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **Express.js Docs**: https://expressjs.com
- **React Router Docs**: https://reactrouter.com

## Post-Deployment

1. **Monitor Logs** for the first 24 hours
2. **Test All Features** thoroughly
3. **Inform Users** of new deployment
4. **Schedule Updates** for off-peak hours
5. **Document Changes** in changelog

---

**Deployment Date**: _______________
**Deployed By**: _______________
**Notes**: _____________________________________
