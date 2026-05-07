# Quick Start: Deploy to Vercel + Supabase

This guide provides the fastest path to deploying TheCapsRepo to Vercel with Supabase.

## Prerequisites (5 minutes)

- [ ] GitHub account and repository pushed
- [ ] Supabase project created
- [ ] Vercel account (sign up with GitHub)

## Step 1: Get Supabase Credentials (2 minutes)

1. Open your Supabase project: https://app.supabase.com
2. Go to **Settings** > **API**
3. Copy these values:
   - Project URL
   - Anon Key
   - Service Role Key
4. Keep them handy for next step

## Step 2: Deploy to Vercel (3 minutes)

### Option A: GitHub Integration (Easiest)

1. Go to https://vercel.com/new
2. Click "Continue with GitHub"
3. Select your repository
4. Click "Import"
5. **Scroll down to "Environment Variables"**
6. Add these 4 variables:
   ```
   VITE_SUPABASE_URL = (paste your Supabase URL)
   VITE_SUPABASE_ANON_KEY = (paste your Anon Key)
   SUPABASE_URL = (paste your Supabase URL)
   SUPABASE_SERVICE_ROLE_KEY = (paste your Service Role Key)
   JWT_SECRET = (generate: openssl rand -base64 32)
   ```
7. Click "Deploy"
8. Wait 2-3 minutes for build to complete

### Option B: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Follow prompts and add environment variables when asked
```

## Step 3: Initialize Database (2 minutes)

1. Go to your Supabase project
2. Click **SQL Editor** in sidebar
3. Click **New Query**
4. Copy all code from `supabase/schema.sql`
5. Paste into SQL Editor
6. Click **Run**
7. Wait for completion (should see "Your script has been executed successfully")

## Step 4: Create Admin User (1 minute)

Choose one method:

### Method A: Auto-bootstrap (easiest)
1. In Vercel dashboard, go to **Settings** > **Environment Variables**
2. Add these 3 variables to **Production** environment:
   ```
   DEFAULT_ADMIN_EMAIL=admin@example.com
   DEFAULT_ADMIN_PASSWORD=admin123
   DEFAULT_ADMIN_NAME=Administrator
   ```
3. In Vercel, click **Deployments** tab
4. Find latest deployment
5. Click the three dots (⋯) 
6. Click "Redeploy"
7. Wait for deployment to complete
8. Check Vercel logs - should see "Admin user created" message

### Method B: Manual database insert
1. In Supabase, click **SQL Editor**
2. Click **New Query**
3. Paste and run:
   ```sql
   INSERT INTO users (email, password, name)
   VALUES (
     'admin@example.com',
     'plaintext-password',
     'Administrator'
   );
   ```
4. Note: Password will be auto-hashed on first login

## Step 5: Test Login (2 minutes)

1. Open your Vercel deployment URL (e.g., `yourapp.vercel.app`)
2. Should redirect to `/login`
3. Enter:
   - Email: `admin@example.com`
   - Password: `admin123` (or what you set)
4. Click "Login as Admin"
5. Should redirect to `/teams` dashboard

## Done! 🎉

Your app is now live on Vercel with Supabase backend!

### What's Running

- **Frontend**: React SPA served from Vercel CDN
- **API**: Express.js running as serverless functions in `/api`
- **Database**: Supabase PostgreSQL with automatic backups
- **Auth**: JWT-based with bcrypt password hashing

## Next Steps

1. **Add custom domain** (optional)
   - Vercel Settings > Domains
   - Add your domain
   - Follow DNS instructions

2. **Enable monitoring** (recommended)
   - Vercel Dashboard > Analytics
   - Enable Web Analytics
   - Set up error tracking

3. **Customize** the app
   - Update branding in `src/pages/Login.tsx`
   - Add your logo in `index.html`
   - Customize colors in Tailwind config

4. **Invite team members**
   - Create users in Supabase users table
   - Share login credentials securely

## Troubleshooting

### Build failed
- Check Vercel logs: Deployments > Logs
- Verify all environment variables are set
- Run `npm run lint` locally to check TypeScript errors

### Login doesn't work
- Check admin user exists in Supabase
- Run in SQL Editor: `SELECT * FROM users;`
- Verify SUPABASE_SERVICE_ROLE_KEY is correct
- Check browser console for errors

### API returns 500 error
- Check Vercel Function logs
- Verify Supabase credentials
- Check database tables exist
- Verify RLS policies aren't blocking access

### "Cannot find module" errors
- Clear Vercel build cache: Settings > Git > "Clear Git Cache"
- Redeploy

## Key Files for Reference

- `vercel.json` - Deployment configuration
- `.env.example` - Environment variables reference
- `supabase/schema.sql` - Database schema
- `VERCEL_DEPLOYMENT.md` - Detailed deployment guide
- `ENV_VARIABLES.md` - All environment variables explained

## Important Security Notes

1. ⚠️ Keep `SUPABASE_SERVICE_ROLE_KEY` SECRET - never expose in frontend
2. ⚠️ Keep `JWT_SECRET` SECRET - never commit to GitHub
3. ⚠️ Use strong passwords for admin accounts
4. ✅ Vercel encrypts environment variables by default
5. ✅ All data encrypted in transit (HTTPS)
6. ✅ Database access controlled by RLS policies

## Getting Help

- **Vercel Docs**: https://vercel.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **Our Guides**:
  - `VERCEL_DEPLOYMENT.md` - Full deployment guide
  - `ENV_VARIABLES.md` - Environment variables reference
  - `SUPABASE_SETUP.md` - Database setup guide

## Useful Commands

```bash
# Pull environment variables from Vercel
vercel env pull

# Run locally with production env vars
NODE_ENV=production npm run dev

# Check types
npm run lint

# View Vercel logs
vercel logs --tail

# Redeploy without changes
vercel --prod
```

---

**Estimated Total Time**: 15 minutes  
**Difficulty**: Beginner  
**Cost**: Free tier (Vercel + Supabase)
