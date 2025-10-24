# Password Reset Link Fix

## Problem
Password reset links are directing to `localhost:3000` instead of your production domain `nexusaisuite.com`.

## Solution

### Step 1: Configure Supabase Dashboard

1. **Go to Supabase Dashboard**: https://supabase.com/dashboard
2. **Select your project**: `zxcdgyebqgyjzmheqbhy`
3. **Navigate to: **Authentication** → **URL Configuration**
4. **Update these settings**:

```
Site URL: https://nexusaisuite.com
Redirect URLs: 
  - https://nexusaisuite.com/**
  - https://nexusaisuite.com/auth/reset-password
  - https://nexusaisuite.com/auth/callback
```

### Step 2: Update Environment Variables

Create a `.env` file in your project root with:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://zxcdgyebqgyjzmheqbhy.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp4Y2RneWVicWd5anptaGVxYmh5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4NzA0MjUsImV4cCI6MjA3NjQ0NjQyNX0.t40U5ecUG2KoXLTp_AiJtHO_1wWbE5wa52vA2c40blY

# Production Domain
VITE_SITE_URL=https://nexusaisuite.com
VITE_REDIRECT_URL=https://nexusaisuite.com
```

### Step 3: Update Supabase Client Configuration

The `src/lib/supabase.ts` file should automatically use the environment variables, but you can also explicitly set the redirect URL:

```typescript
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    redirectTo: import.meta.env.VITE_SITE_URL || 'https://nexusaisuite.com'
  }
})
```

### Step 4: Test the Fix

1. **Deploy your changes** to production
2. **Test password reset**:
   - Go to your login page
   - Click "Forgot Password"
   - Check the email link - it should now point to `nexusaisuite.com`

## Why This Happens

Supabase uses the **Site URL** setting in the dashboard to generate password reset links. If this is set to `localhost:3000` (from development), all reset links will point there.

## Additional Notes

- Make sure your production domain is properly configured in your hosting platform (Netlify, Vercel, etc.)
- The redirect URLs should include all possible paths where users might land after authentication
- Test both sign-up and password reset flows after making these changes

## Quick Fix Commands

If you have access to your hosting platform's environment variables:

```bash
# Set these in your hosting platform's environment variables
VITE_SITE_URL=https://nexusaisuite.com
VITE_REDIRECT_URL=https://nexusaisuite.com
```
