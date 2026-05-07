# Supabase Configuration Checklist

Complete this checklist to ensure your Supabase setup is complete and secure.

## Phase 1: Supabase Account & Project Setup

- [ ] Create Supabase account at https://supabase.com
- [ ] Create a new Supabase project
- [ ] Wait for project provisioning to complete
- [ ] Verify project is accessible from dashboard

## Phase 2: Environment Variables Setup

- [ ] Copy `.env.example` to `.env`
- [ ] Get Project URL from Settings > API
- [ ] Get Anon Public Key from Settings > API
- [ ] Get Service Role Key from Settings > API (keep this secret!)
- [ ] Update `.env` with all Supabase credentials
- [ ] Generate a new JWT_SECRET (recommended: 32+ random characters)
- [ ] Save `.env` to `.gitignore` (should already be there)
- [ ] Do NOT commit `.env` file

## Phase 3: Database Schema Setup

- [ ] Go to Supabase SQL Editor
- [ ] Create a new query
- [ ] Copy entire contents of `supabase/schema.sql`
- [ ] Paste into SQL Editor
- [ ] Click "Run"
- [ ] Verify tables are created: users, teams, projects, defenses, consultations, panelists
- [ ] Verify indexes are created
- [ ] Verify RLS policies are enabled

## Phase 4: Create Initial Admin User

Choose one method:

### Option A: Auto-create (on first server run)
- [ ] Set in `.env`:
  ```
  DEFAULT_ADMIN_EMAIL=admin@example.com
  DEFAULT_ADMIN_PASSWORD=admin123
  DEFAULT_ADMIN_NAME=Administrator
  ```
- [ ] Run `npm run dev`
- [ ] Verify user was created in Supabase: SQL Editor > SELECT * FROM users

### Option B: Manual creation
- [ ] Go to Supabase SQL Editor
- [ ] Run SQL to create user:
  ```sql
  INSERT INTO users (id, email, password, name) 
  VALUES (
    gen_random_uuid(),
    'admin@example.com',
    crypt('admin123', gen_salt('bf')),
    'Administrator'
  );
  ```
- [ ] Verify user was created

### Option C: Use bcryptjs (Node.js)
- [ ] Run in terminal:
  ```bash
  node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('admin123', 10));"
  ```
- [ ] Copy the hash
- [ ] Update user with hash in Supabase

## Phase 5: Dependencies & Installation

- [ ] Run `npm install` to ensure all dependencies are installed
- [ ] Verify no vulnerabilities: `npm audit`
- [ ] Check TypeScript compilation: `npm run lint`

## Phase 6: Development Server Testing

- [ ] Start backend server: `npm run dev`
- [ ] Verify server starts on http://localhost:3000
- [ ] Check for any error messages in terminal

## Phase 7: Frontend Testing

- [ ] Open http://localhost:3000 in browser
- [ ] Verify redirect to /login
- [ ] Test login with admin credentials
- [ ] Verify successful login and redirect to /teams
- [ ] Check browser console for any errors
- [ ] Verify auth token is stored in localStorage

## Phase 8: API Testing

- [ ] GET /api/teams - should return list (may be empty)
- [ ] GET /api/panelists - should return list
- [ ] POST /api/teams (with auth token) - should create team
- [ ] GET /api/student/team/invalid-code - should return 404

## Phase 9: Security Review

- [ ] [ ] Verify `.env` is in `.gitignore`
- [ ] [ ] Review CORS settings for your domain
- [ ] [ ] Check RLS policies in schema.sql for appropriateness
- [ ] [ ] Verify service role key is not exposed in frontend code
- [ ] [ ] Test that unauthenticated users cannot access protected endpoints
- [ ] [ ] Verify password reset functionality works
- [ ] [ ] Check that JWT_SECRET is strong and random

## Phase 10: Production Preparation

- [ ] [ ] Generate production JWT_SECRET
- [ ] [ ] Set up separate Supabase project for production
- [ ] [ ] Configure production environment variables
- [ ] [ ] Enable HTTPS for frontend
- [ ] [ ] Set appropriate CORS origins (not "*")
- [ ] [ ] Enable database backups
- [ ] [ ] Set up monitoring/alerting
- [ ] [ ] Review RLS policies for production requirements
- [ ] [ ] Set up error logging/tracking
- [ ] [ ] Document deployment process

## Phase 11: Team Setup (Optional)

- [ ] [ ] Create test teams in database
- [ ] [ ] Generate access codes for student testing
- [ ] [ ] Test student view with access code
- [ ] [ ] Verify students can see their projects and defenses

## Phase 12: Backup & Recovery

- [ ] [ ] Enable automated backups in Supabase
- [ ] [ ] Test database restore procedure
- [ ] [ ] Document recovery steps
- [ ] [ ] Store backup credentials securely

## Phase 13: Documentation & Training

- [ ] [ ] Review SUPABASE_SETUP.md
- [ ] [ ] Review SUPABASE_FRONTEND_API.md
- [ ] [ ] Train team on adding new features
- [ ] [ ] Document custom business logic
- [ ] [ ] Create runbooks for common operations

## Troubleshooting Checklist

If something isn't working, check:

### Login Issues
- [ ] User exists in `users` table
- [ ] Password hash is valid (check database directly)
- [ ] Email is lowercase (backend normalizes)
- [ ] Check server console for errors
- [ ] Verify SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in backend .env

### Database Connection Issues
- [ ] Verify SUPABASE_URL format (https://xxx.supabase.co)
- [ ] Verify SUPABASE_SERVICE_ROLE_KEY is complete
- [ ] Check Supabase project status
- [ ] Verify database tables exist
- [ ] Check RLS policies aren't blocking access

### Frontend Issues
- [ ] Clear browser cache and localStorage
- [ ] Verify VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env
- [ ] Restart dev server after .env changes
- [ ] Check browser console for errors
- [ ] Verify API endpoint is correct

### API Issues
- [ ] Check server console for error messages
- [ ] Verify authentication headers are sent
- [ ] Check request/response in Network tab
- [ ] Verify CORS is configured correctly
- [ ] Check that POST/PATCH/DELETE requests have Content-Type: application/json

## Support Resources

- **Supabase Docs**: https://supabase.com/docs
- **Express Docs**: https://expressjs.com
- **React Router**: https://reactrouter.com
- **TypeScript**: https://www.typescriptlang.org/docs

## Sign-off

- [ ] All checklist items completed
- [ ] Application tested and working
- [ ] Team trained on Supabase integration
- [ ] Documentation reviewed and updated
- [ ] Ready for production deployment

---

**Date Completed**: _______________
**Completed By**: _______________
**Notes**: _______________________________________________
