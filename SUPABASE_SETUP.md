# Supabase Setup Guide for TheCapsRepo

This project is now fully configured for Supabase. Follow these steps to get started.

## Prerequisites

- Node.js 18+ installed
- A Supabase account (https://supabase.com)
- A Supabase project created

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Fill in the project details and click "Create new project"
4. Wait for your project to be provisioned

## 2. Get Your Credentials

1. In your Supabase project dashboard, go to **Settings** > **API**
2. Copy the following:
   - **Project URL** (SUPABASE_URL)
   - **Anon Public Key** (VITE_SUPABASE_ANON_KEY)
   - **Service Role Key** (SUPABASE_SERVICE_ROLE_KEY)

## 3. Setup Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Update the `.env` file with your Supabase credentials:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   JWT_SECRET=your-jwt-secret (keep this secure)
   ```

## 4. Initialize the Database Schema

1. In the Supabase dashboard, go to **SQL Editor**
2. Click **New query**
3. Copy the entire contents of `supabase/schema.sql`
4. Paste it into the SQL editor
5. Click **Run**

This will:
- Create all necessary tables (users, teams, projects, defenses, consultations, panelists)
- Set up indexes for better performance
- Enable Row Level Security (RLS) policies

## 5. Create Admin User (Optional)

You can auto-create an admin user on first run by setting these in `.env`:

```
DEFAULT_ADMIN_EMAIL=admin@example.com
DEFAULT_ADMIN_PASSWORD=admin123
DEFAULT_ADMIN_NAME=Administrator
```

Or manually create a user:

1. In Supabase SQL Editor, run:
```sql
INSERT INTO users (id, email, password, name) 
VALUES (
  gen_random_uuid(),
  'admin@example.com',
  crypt('admin123', gen_salt('bf')),
  'Administrator'
);
```

Note: The backend uses bcryptjs for password hashing. Passwords are securely stored.

## 6. Install Dependencies

```bash
npm install
```

## 7. Run the Development Server

In one terminal, start the backend server:
```bash
npm run dev
```

The server will run on `http://localhost:3000`

## 8. Access the Application

- **Admin Portal**: http://localhost:3000/login
- **Student View**: http://localhost:3000/student

Login with your admin credentials to access the admin panel.

## Project Structure

```
src/
├── contexts/
│   └── AuthContext.tsx          # Auth state management
├── lib/
│   ├── supabase.ts              # Supabase client & helpers
│   └── api.ts                   # API client for backend
├── types/
│   └── supabase.ts              # Auto-generated types
└── pages/
    └── Login.tsx                # Login page
backend/
└── api-app.ts                   # Express API endpoints
supabase/
└── schema.sql                   # Database schema & RLS policies
```

## Key Features

### Authentication
- Custom JWT-based authentication (compatible with existing setup)
- Passwords hashed with bcryptjs (10 rounds)
- Session management via React Context
- Auto-redirect to login when not authenticated

### Database
- Supabase PostgreSQL backend
- Row Level Security (RLS) enabled on all tables
- Automatic timestamp tracking on all records
- Foreign key constraints with cascade delete

### Frontend Integration
- Supabase client initialized with anon key
- Auth context for global session management
- Automatic session persistence across page reloads
- Type-safe database queries with generated types

## API Endpoints

All endpoints are authenticated except for public student endpoints:

### Auth
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PATCH /api/auth/profile` - Update user profile
- `PATCH /api/auth/password` - Change password

### Teams
- `GET /api/teams` - List all teams
- `GET /api/teams/:id` - Get team details
- `POST /api/teams` - Create team (auth required)
- `PATCH /api/teams/:id` - Update team (auth required)
- `DELETE /api/teams/:id` - Delete team (auth required)

### Projects, Defenses, Consultations, Panelists
Similar REST endpoints available for each resource.

### Public Endpoints
- `GET /api/student/team/:accessCode` - Get team info by access code (no auth)

## Troubleshooting

### Missing Environment Variables
If you see "Missing Supabase environment variables", check:
1. `.env` file exists and is properly formatted
2. `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set
3. Restart the dev server after updating `.env`

### Login Fails with "Invalid credentials"
1. Ensure the user exists in the `users` table
2. Verify the password is correct (case-sensitive)
3. Check that the email matches exactly (spaces/case matter)

### Database Connection Errors
1. Verify `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are correct
2. Check that your Supabase project is active
3. Ensure the schema has been executed in SQL Editor

## Security Notes

1. **Service Role Key**: Keep this secret! Only use on the backend
2. **Anon Key**: Safe to expose in frontend code
3. **JWT_SECRET**: Generate a new strong random string for production
4. **RLS Policies**: Review and customize based on your security requirements
5. **Passwords**: Never store plaintext passwords. The backend automatically upgrades old plaintext passwords to bcrypt hashes

## Production Deployment

Before deploying to production:

1. Generate a new, strong `JWT_SECRET`
2. Use strong passwords for all admin accounts
3. Review and tighten RLS policies in `supabase/schema.sql`
4. Enable HTTPS
5. Set proper CORS origins in the backend
6. Backup your Supabase database regularly
7. Monitor logs for suspicious activity

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Express.js Guide](https://expressjs.com)
- [React Router Documentation](https://reactrouter.com)
- [Tailwind CSS Documentation](https://tailwindcss.com)

## Support

For issues or questions:
1. Check the Supabase dashboard for errors
2. Review the browser console for error messages
3. Check server logs for backend errors
4. Verify environment variables are correctly set
