# Supabase Integration - Frontend API Reference

## Overview

The frontend now has full Supabase integration with:
- Centralized Supabase client in `src/lib/supabase.ts`
- Auth context for session management in `src/contexts/AuthContext.tsx`
- Type-safe database types in `src/types/supabase.ts`
- Existing API layer in `src/lib/api.ts` for backward compatibility

## Using Supabase Client

### Importing the Client

```typescript
import { supabase } from '../lib/supabase';
```

### Authentication Methods

```typescript
// Sign in with email and password
import { signIn } from '../lib/supabase';
const { data, error } = await signIn(email, password);

// Sign out
import { signOut } from '../lib/supabase';
await signOut();

// Get current user
import { getCurrentUser } from '../lib/supabase';
const user = await getCurrentUser();

// Get current session
import { getCurrentSession } from '../lib/supabase';
const session = await getCurrentSession();

// Update user profile
import { updateUserProfile } from '../lib/supabase';
await updateUserProfile({ email: 'newemail@example.com' });

// Listen to auth state changes
import { onAuthStateChange } from '../lib/supabase';
const unsubscribe = onAuthStateChange((session) => {
  console.log('Session updated:', session);
});
```

## Using Auth Context

### In Components

```typescript
import { useAuth } from '../contexts/AuthContext';

function MyComponent() {
  const { session, user, loading, error } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!session) return <div>Not logged in</div>;

  return (
    <div>
      <p>Welcome {user?.email}</p>
      <p>Session expires: {session.expires_at}</p>
    </div>
  );
}
```

### Available Context Values

- `session`: Current Supabase session object
- `user`: Current authenticated user
- `loading`: Boolean indicating if auth state is being checked
- `error`: Any auth initialization errors

## Database Operations

### Using Supabase Client Directly

```typescript
import { supabase } from '../lib/supabase';
import type { Tables } from '../types/supabase';

// Read
const { data: teams, error } = await supabase
  .from('teams')
  .select('*')
  .order('created_at', { ascending: false });

// Create
const { data, error } = await supabase
  .from('teams')
  .insert([
    {
      id: crypto.randomUUID(),
      team_name: 'Team A',
      proponents: [],
    },
  ])
  .select();

// Update
const { data, error } = await supabase
  .from('teams')
  .update({ team_name: 'New Name' })
  .eq('id', teamId);

// Delete
const { data, error } = await supabase
  .from('teams')
  .delete()
  .eq('id', teamId);
```

### Using Existing API Layer

The current `src/lib/api.ts` still works as before and handles JWT authentication:

```typescript
import { api } from '../lib/api';

// List teams
const teams = await api.teams.list();

// Get team details
const team = await api.teams.get(teamId);

// Create team
const result = await api.teams.create({ team_name: 'New Team' });

// Update team
await api.teams.update(teamId, { team_name: 'Updated Name' });

// Delete team
await api.teams.delete(teamId);
```

## TypeScript Support

All database tables have generated types:

```typescript
import type { 
  Tables,
  TablesInsert,
  TablesUpdate,
} from '../types/supabase';

// Table row type
type Team = Tables<'teams'>;

// Insert data type
type TeamInsert = TablesInsert<'teams'>;

// Update data type
type TeamUpdate = TablesUpdate<'teams'>;

// Usage in components
const handleTeamCreate = (team: TeamInsert) => {
  return api.teams.create(team);
};
```

## Real-time Subscriptions

Subscribe to real-time changes:

```typescript
import { supabase } from '../lib/supabase';

const subscription = supabase
  .channel('teams')
  .on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'teams' },
    (payload) => {
      console.log('Change received!', payload);
    }
  )
  .subscribe();

// Clean up subscription
subscription.unsubscribe();
```

## Error Handling

```typescript
import { supabase } from '../lib/supabase';

try {
  const { data, error } = await supabase
    .from('teams')
    .select('*');

  if (error) {
    // Handle specific error codes
    if (error.code === 'PGRST116') {
      console.log('Not found');
    } else {
      console.error('Error:', error.message);
    }
  }

  return data;
} catch (err) {
  console.error('Unexpected error:', err);
}
```

## Migration Path

### For New Components
Use the Supabase client directly for better type safety and real-time capabilities:

```typescript
import { supabase } from '../lib/supabase';

// New components - use supabase client
const { data: teams } = await supabase
  .from('teams')
  .select('*');
```

### For Existing Components
Continue using the existing API layer for now:

```typescript
import { api } from '../lib/api';

// Existing components - use api client
const teams = await api.teams.list();
```

Both methods work seamlessly together!

## Session Persistence

The Supabase client is configured to:
- Automatically refresh tokens
- Persist sessions in localStorage
- Detect sessions from URL (for OAuth redirects)

Sessions are automatically restored when the page reloads.

## Row Level Security (RLS)

All tables have RLS enabled with policies that:
- Allow public read access for non-sensitive data
- Require authentication for write operations
- Protect sensitive user information

The backend service role key has full access for administrative operations.

## Environment Variables

Required for frontend:
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase public anon key

These are automatically loaded from `.env` file and prefixed with `VITE_` to be available in the browser.

## Common Patterns

### Protected Data Fetch

```typescript
import { useAuth } from '../contexts/AuthContext';

function ProtectedDataComponent() {
  const { session, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!session) return <div>Please log in</div>;

  return <DataList />;
}
```

### Form Submission with Auth

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  const { session } = useAuth();
  if (!session) {
    toast.error('Please log in first');
    return;
  }

  try {
    const result = await api.teams.create(formData);
    toast.success('Team created!');
  } catch (err: any) {
    toast.error(err.message);
  }
};
```

## Debugging

### Check Authentication State

```typescript
import { supabase } from '../lib/supabase';

const session = await supabase.auth.getSession();
console.log('Current session:', session);

const user = await supabase.auth.getUser();
console.log('Current user:', user);
```

### Enable Detailed Logging

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(url, key, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// Check browser console for detailed logs
```

## Best Practices

1. **Always wrap Supabase calls in try-catch** for error handling
2. **Use the Auth context** to access session state instead of checking localStorage
3. **Keep sensitive operations** on the backend (use API layer)
4. **Subscribe to real-time updates** for collaborative features
5. **Clean up subscriptions** when components unmount
6. **Type your data** using the generated types
7. **Use parameterized queries** to prevent SQL injection (Supabase does this automatically)
