# Environment Variables Reference

This document explains all environment variables used by the TheCapsRepo project on Vercel + Supabase.

## Frontend Variables (VITE_*)

These are accessible in the browser and exposed in `window.__ENV__`. Always prefix with `VITE_`.

### Required Frontend Variables

#### `VITE_SUPABASE_URL`
- **Type**: String (URL)
- **Example**: `https://itwjzdjyvbdfbvufwxqn.supabase.co`
- **Description**: Your Supabase project URL
- **Where to find**: Supabase Dashboard > Settings > API > URL
- **Required**: Yes
- **Safe to expose**: Yes (public URL)

#### `VITE_SUPABASE_ANON_KEY`
- **Type**: String (Token)
- **Length**: ~50 characters
- **Description**: Supabase anonymous/public key for frontend authentication
- **Where to find**: Supabase Dashboard > Settings > API > Anon Key
- **Required**: Yes
- **Safe to expose**: Yes (limited permissions via RLS)

### Optional Frontend Variables

#### `GEMINI_API_KEY`
- **Type**: String (API Key)
- **Description**: Google Gemini API key for AI features
- **Where to find**: Google Cloud Console > Gemini API
- **Required**: No
- **Safe to expose**: No (keep in backend only or use proxy)
- **Workaround**: Create backend endpoint that proxies Gemini requests

## Backend Variables (Server-side only)

These should NOT be prefixed with `VITE_` and are only available on the server. Keep these secret.

### Required Backend Variables

#### `SUPABASE_URL`
- **Type**: String (URL)
- **Example**: `https://itwjzdjyvbdfbvufwxqn.supabase.co`
- **Description**: Your Supabase project URL (same as frontend)
- **Where to find**: Supabase Dashboard > Settings > API > URL
- **Required**: Yes
- **Safe to expose**: No (server-only)

#### `SUPABASE_SERVICE_ROLE_KEY`
- **Type**: String (Token)
- **Length**: ~150+ characters
- **Description**: Supabase service role key with full database access
- **Where to find**: Supabase Dashboard > Settings > API > Service Role Key
- **Required**: Yes
- **Safe to expose**: NO - KEEP SECRET! Has full database access
- **Warning**: ⚠️ Never expose this in frontend code or commit to repository

#### `JWT_SECRET`
- **Type**: String (Random)
- **Length**: Minimum 32 characters (recommended 64+)
- **Description**: Secret key for signing JWT tokens
- **How to generate**: 
  ```bash
  # On Linux/Mac:
  openssl rand -base64 32
  
  # On Windows with Node:
  node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
  ```
- **Required**: Yes
- **Safe to expose**: NO - KEEP SECRET!
- **Rotation**: Change every 6-12 months

### Optional Backend Variables

#### `NODE_ENV`
- **Type**: String
- **Values**: `development`, `production`, `staging`
- **Default**: `production` (in Vercel)
- **Description**: Application environment
- **Required**: No

#### `SERVER_PORT`
- **Type**: Integer
- **Default**: `3000`
- **Description**: Port for local development server
- **Used in**: Local development only, ignored on Vercel
- **Required**: No

#### `FRONTEND_URL`
- **Type**: String (URL)
- **Example**: `https://thecapsrepo.vercel.app`
- **Description**: Frontend URL for CORS configuration
- **Used for**: Setting allowed origins in API
- **Required**: For production, No for development
- **Safe to expose**: Yes (public URL)

#### `DEFAULT_ADMIN_EMAIL`
- **Type**: String (Email)
- **Example**: `admin@example.com`
- **Description**: Email of default admin user
- **Created when**: Server starts for the first time (if all 3 DEFAULT_ADMIN_* are set)
- **Required**: No (optional bootstrap)
- **Safe to expose**: No (username exposure)

#### `DEFAULT_ADMIN_PASSWORD`
- **Type**: String (Password)
- **Description**: Password for default admin user
- **Length**: Recommended 12+ characters with mixed case, numbers, symbols
- **Required if**: Using admin bootstrap
- **Safe to expose**: NO - KEEP SECRET!
- **Note**: Will be hashed with bcryptjs on storage

#### `DEFAULT_ADMIN_NAME`
- **Type**: String
- **Default**: `Administrator`
- **Description**: Display name of default admin user
- **Required**: No
- **Safe to expose**: Yes

## Environment Configuration by Deployment Stage

### Development (Local)

Create `.env` in project root:
```
VITE_SUPABASE_URL=https://your-dev-project.supabase.co
VITE_SUPABASE_ANON_KEY=dev-anon-key
SUPABASE_URL=https://your-dev-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=dev-service-role-key
JWT_SECRET=dev-jwt-secret-min-32-chars
NODE_ENV=development
SERVER_PORT=3000
```

### Staging/Preview (Vercel Preview)

Set in Vercel Dashboard > Settings > Environment Variables > Preview:
```
VITE_SUPABASE_URL=https://your-staging-project.supabase.co
VITE_SUPABASE_ANON_KEY=staging-anon-key
SUPABASE_URL=https://your-staging-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=staging-service-role-key
JWT_SECRET=staging-jwt-secret-min-32-chars
FRONTEND_URL=https://pr-123.your-preview-domain.vercel.app
```

### Production (Vercel Production)

Set in Vercel Dashboard > Settings > Environment Variables > Production:
```
VITE_SUPABASE_URL=https://your-production-project.supabase.co
VITE_SUPABASE_ANON_KEY=production-anon-key
SUPABASE_URL=https://your-production-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=production-service-role-key (encrypted)
JWT_SECRET=production-jwt-secret-min-64-chars (strong & random)
FRONTEND_URL=https://your-production-domain.com
NODE_ENV=production
```

## Setting Environment Variables

### Local Development

1. Create `.env` file in project root (copy from `.env.example`):
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` with your actual values:
   ```bash
   nano .env  # or open in your editor
   ```

3. Never commit `.env` (should be in `.gitignore`)

### Vercel Deployment

#### Via Vercel Dashboard

1. Go to your Vercel project
2. Click **Settings** > **Environment Variables**
3. Add each variable:
   - Key: `VITE_SUPABASE_URL`
   - Value: `https://...supabase.co`
   - Select environments: Production/Preview/Development
4. Click "Save"
5. Redeploy for changes to take effect

#### Via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Link to your Vercel project
vercel link

# Pull environment variables
vercel env pull

# This creates a .env.local file (add to .gitignore)
```

#### Via Git Push (using GitHub Secrets)

Create `.github/workflows/deploy.yml` to automatically set environment variables when deploying.

## Validation Checklist

Before deploying, verify:

- [ ] All `VITE_*` variables are set in Vercel
- [ ] All backend variables are set in Vercel
- [ ] `SUPABASE_SERVICE_ROLE_KEY` is encrypted/hidden in UI
- [ ] `JWT_SECRET` is strong and random
- [ ] `NODE_ENV=production` in production
- [ ] `FRONTEND_URL` matches your actual domain
- [ ] No environment variables are committed to git
- [ ] `.env` file is in `.gitignore`
- [ ] Supabase credentials are correct
- [ ] Database schema is deployed to Supabase

## Troubleshooting

### "Missing Supabase environment variables"

**Cause**: Frontend variables not set

**Solution**:
1. Verify `VITE_SUPABASE_URL` is set
2. Verify `VITE_SUPABASE_ANON_KEY` is set
3. Restart dev server: `npm run dev`
4. Clear browser cache
5. In Vercel, redeploy after setting variables

### "SUPABASE_SERVICE_ROLE_KEY or SUPABASE_URL not set"

**Cause**: Backend variables not set

**Solution**:
1. Verify `SUPABASE_URL` is set
2. Verify `SUPABASE_SERVICE_ROLE_KEY` is set
3. Check Vercel logs for actual error
4. Redeploy in Vercel

### Login fails with "Invalid credentials"

**Cause**: Could be several issues

**Debugging**:
1. Verify SUPABASE_SERVICE_ROLE_KEY is correct (copy from Supabase Dashboard again)
2. Check user exists: `SELECT * FROM users;` in Supabase SQL Editor
3. Verify password hash format (should start with `$2a$`, `$2b$`, or `$2y$`)
4. Check server logs in Vercel Deployments > Logs

### "Cannot read property of undefined"

**Cause**: Environment variable not loaded

**Solution**:
1. Verify variable is set in Vercel (not just locally)
2. Check variable name (case-sensitive)
3. Verify `VITE_` prefix for frontend variables
4. Redeploy after changes

## Security Best Practices

1. **Rotate Secrets Regularly**
   - Change `JWT_SECRET` every 6-12 months
   - Rotate `SUPABASE_SERVICE_ROLE_KEY` if exposed
   - Update credentials after team changes

2. **Never Expose Backend Variables**
   - Keep in `.env.local` locally
   - Only set in Vercel environment
   - Never log or output them
   - Don't send to frontend

3. **Use Strong Secrets**
   - `JWT_SECRET`: 32+ random characters
   - Passwords: 12+ characters with variety
   - Generate with cryptographic tools

4. **Monitor Access**
   - Review Vercel environment variable access logs
   - Limit who can edit environment variables
   - Audit Supabase access logs

5. **Encryption in Transit**
   - Always use HTTPS
   - Vercel provides free SSL certificates
   - Update .env references to https://

## Reference

- Supabase API Keys: https://app.supabase.com/project/_/settings/api
- Vercel Environment Variables: https://vercel.com/docs/projects/environment-variables
- Generate JWT Secret: `openssl rand -base64 32`
- bcryptjs Documentation: https://github.com/dcodeIO/bcrypt.js

---

**Last Updated**: May 7, 2026
**Valid For**: Latest deployment
