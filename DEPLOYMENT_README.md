# TheCapsRepo - Vercel + Supabase Deployment Guide

Your project is now fully configured for production deployment on Vercel with Supabase as the backend.

## 📋 What's Been Set Up

### Frontend
- ✅ React 19 with TypeScript
- ✅ Vite build optimization
- ✅ Tailwind CSS with Vite plugin
- ✅ React Router for navigation
- ✅ Supabase client integration
- ✅ Auth context for session management

### Backend
- ✅ Express.js API server
- ✅ Serverless function support for Vercel
- ✅ JWT authentication
- ✅ Bcryptjs password hashing
- ✅ Supabase integration
- ✅ CORS configuration

### Database
- ✅ Supabase PostgreSQL
- ✅ Full schema with RLS policies
- ✅ Automatic migrations support
- ✅ UUID primary keys
- ✅ Timestamp tracking

### Deployment
- ✅ Vercel configuration (`vercel.json`)
- ✅ Build optimization
- ✅ Environment variable handling
- ✅ Health check endpoint
- ✅ Security headers
- ✅ Serverless function optimization

## 🚀 Quick Start (15 minutes)

See [QUICK_START_VERCEL.md](QUICK_START_VERCEL.md) for fastest deployment path.

## 📚 Detailed Guides

### Deployment
- [QUICK_START_VERCEL.md](QUICK_START_VERCEL.md) - 15-minute deployment guide
- [VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md) - Comprehensive deployment guide
- [SUPABASE_SETUP.md](SUPABASE_SETUP.md) - Database setup and schema

### Configuration
- [ENV_VARIABLES.md](ENV_VARIABLES.md) - All environment variables explained
- [SUPABASE_FRONTEND_API.md](SUPABASE_FRONTEND_API.md) - Frontend API reference
- [SUPABASE_CHECKLIST.md](SUPABASE_CHECKLIST.md) - Setup verification checklist

## 🔑 Key Files

### Configuration Files
```
vercel.json              # Vercel deployment config
.vercelignore            # Files to ignore in Vercel builds
tsconfig.json            # TypeScript configuration
tsconfig.node.json       # Node.js TypeScript config
vite.config.ts           # Vite build configuration
.env.example             # Environment variables template
```

### Source Code Structure
```
src/                     # Frontend React app
├── contexts/            # Auth context
├── lib/                 # Utilities (Supabase, API)
├── pages/               # Page components
├── components/          # UI components
└── types/               # TypeScript types

backend/                 # Backend Express server
├── api-app.ts           # Express app creation
└── middleware.ts        # Vercel middleware

api/                     # Vercel serverless functions
├── index.ts             # Main API handler
└── health.ts            # Health check endpoint

supabase/                # Database
└── schema.sql           # Full database schema with RLS
```

## ⚙️ Configuration Checklist

Before deploying, ensure:

- [ ] Supabase project created
- [ ] All Supabase credentials copied
- [ ] `.env` file created locally (not committed)
- [ ] GitHub repository is up to date
- [ ] Vercel account created
- [ ] Environment variables ready

See [SUPABASE_CHECKLIST.md](SUPABASE_CHECKLIST.md) for complete verification.

## 🌐 Environment Variables

### Required for Both Local & Vercel

```
VITE_SUPABASE_URL           # Your Supabase URL
VITE_SUPABASE_ANON_KEY      # Supabase anon key (public)
SUPABASE_URL                # Supabase URL (backend)
SUPABASE_SERVICE_ROLE_KEY   # Supabase service role (SECRET!)
JWT_SECRET                  # JWT signing key (SECRET!)
```

### Optional

```
DEFAULT_ADMIN_EMAIL         # Auto-create admin on first run
DEFAULT_ADMIN_PASSWORD      # Admin password
DEFAULT_ADMIN_NAME          # Admin display name
GEMINI_API_KEY             # For AI features
```

See [ENV_VARIABLES.md](ENV_VARIABLES.md) for detailed documentation.

## 🔐 Security

### Keep Secret
- ⚠️ `SUPABASE_SERVICE_ROLE_KEY` - Never expose in frontend
- ⚠️ `JWT_SECRET` - Never commit to git
- ⚠️ `.env` file - Always in .gitignore

### Best Practices
- ✅ Generate strong JWT_SECRET: `openssl rand -base64 32`
- ✅ Use Vercel's encrypted environment variable storage
- ✅ Enable RLS on all Supabase tables
- ✅ Review and customize RLS policies
- ✅ Use HTTPS only in production
- ✅ Rotate secrets every 6-12 months

## 📦 Build & Deployment

### Local Development
```bash
npm install              # Install dependencies
npm run dev             # Start dev server (http://localhost:3000)
```

### Build for Production
```bash
npm run build           # Build frontend and bundle
npm run lint            # Check TypeScript
```

### Deploy to Vercel
```bash
# Option 1: GitHub integration (easiest)
# Push to GitHub, Vercel auto-deploys

# Option 2: Vercel CLI
npm i -g vercel
vercel --prod
```

## ✨ Features

### Authentication
- Custom JWT-based auth
- Bcryptjs password hashing
- Automatic password upgrade from plaintext
- Session persistence
- Auto-logout on token expiry

### API Endpoints
All endpoints have JWT protection except public student routes.

**Auth**
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PATCH /api/auth/profile` - Update profile
- `PATCH /api/auth/password` - Change password

**Teams**
- `GET /api/teams` - List all teams
- `POST /api/teams` - Create team (auth)
- `PATCH /api/teams/:id` - Update team (auth)
- `DELETE /api/teams/:id` - Delete team (auth)

**Projects, Defenses, Consultations, Panelists**
Similar REST endpoints for each resource.

**Public**
- `GET /api/student/team/:accessCode` - Get team by code
- `GET /health` - Health check

### Database Features
- Automatic timestamps (created_at)
- UUID primary keys
- Cascade delete on team deletion
- JSON fields for complex data
- Indexed fields for performance
- Row-level security (RLS)

## 🧪 Testing

### Local Testing
```bash
npm run dev
# Visit http://localhost:3000
# Login and test features
```

### Testing API
```bash
# Check health
curl https://yourapp.vercel.app/health

# Test login
curl -X POST https://yourapp.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'
```

## 📊 Monitoring

### Vercel Analytics
- Automatic Web Analytics
- Real User Monitoring (RUM)
- Core Web Vitals
- Dashboard at https://vercel.com/dashboard

### Supabase Monitoring
- Query performance
- Real-time subscriptions
- Storage usage
- API rate limits
- Dashboard at https://app.supabase.com

## 🐛 Troubleshooting

### Common Issues

**Build fails**
- Check Vercel logs: Deployments > Logs
- Run `npm run lint` locally
- Verify environment variables

**Login fails**
- Check user exists in Supabase
- Verify credentials are correct
- Check SUPABASE_SERVICE_ROLE_KEY

**API returns 500**
- Check Vercel function logs
- Verify Supabase connection
- Ensure database schema exists

See [VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md#troubleshooting) for more solutions.

## 📖 Documentation

Each guide covers specific aspects:

- **QUICK_START_VERCEL.md** - 15-minute setup
- **VERCEL_DEPLOYMENT.md** - Complete deployment guide
- **SUPABASE_SETUP.md** - Database setup
- **SUPABASE_FRONTEND_API.md** - Frontend API usage
- **ENV_VARIABLES.md** - Environment variables
- **SUPABASE_CHECKLIST.md** - Setup verification

## 🔄 Workflow

### Local Development
```
1. npm install
2. cp .env.example .env
3. Update .env with credentials
4. npm run dev
5. Make changes
6. Test locally
7. git push
```

### Deployment to Vercel
```
1. Push to GitHub
2. Vercel auto-deploys
3. Check Vercel logs
4. Verify on production URL
5. Monitor for errors
```

## 📞 Support

- **Vercel Documentation**: https://vercel.com/docs
- **Supabase Documentation**: https://supabase.com/docs
- **Express.js Docs**: https://expressjs.com
- **React Router Docs**: https://reactrouter.com

## 🎯 Next Steps

1. **Deploy Now**
   - Follow [QUICK_START_VERCEL.md](QUICK_START_VERCEL.md)
   - Takes about 15 minutes

2. **Customize**
   - Update branding in Login.tsx
   - Add your logo
   - Customize colors

3. **Scale**
   - Add more users
   - Monitor performance
   - Optimize database queries

4. **Secure**
   - Review RLS policies
   - Set up monitoring
   - Regular security audits

## 📝 Notes

- This project uses Edge SQLite by default locally
- Supabase provides PostgreSQL in production
- Vercel provides serverless backend
- CDN serves frontend assets globally
- All data encrypted in transit (HTTPS)

## ✅ Deployment Verified

Project is ready for production deployment with:
- ✅ Full Supabase integration
- ✅ Vercel serverless optimization
- ✅ Environment configuration
- ✅ Security best practices
- ✅ Error handling
- ✅ CORS configuration
- ✅ Type safety (TypeScript)
- ✅ Performance optimization

---

**Created**: May 7, 2026  
**Last Updated**: May 7, 2026  
**Status**: Production Ready ✅
