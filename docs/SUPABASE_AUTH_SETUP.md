# Supabase Auth & Google Sign-in Setup

## Environment Variables

Set these in Netlify (Site settings → Environment variables) and in local `.env`:

```
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_SITE_URL=https://al-ameen-caps.netlify.app
```

- **VITE_SUPABASE_URL**: From Supabase Dashboard → Project Settings → API → Project URL  
- **VITE_SUPABASE_ANON_KEY**: From Project Settings → API → Project API keys → `anon` `public`  
- **VITE_SITE_URL**: Your live site URL (no trailing slash). Used as OAuth redirect target.

## Supabase Dashboard — URL Configuration

In **Supabase Dashboard → Authentication → URL Configuration**:

1. **Site URL** (default redirect):  
   `https://al-ameen-caps.netlify.app`

2. **Redirect URLs** (allowed OAuth redirect targets):  
   Add:
   - `https://al-ameen-caps.netlify.app/**`
   - `http://localhost:5173/**` (for local dev)

   Use `al-ameen-caps.netlify.app` (without `-app` in the name).

## Google Provider

1. In **Authentication → Providers**, enable Google.
2. Add your Google OAuth Client ID and Secret (from [Google Cloud Console](https://console.cloud.google.com/) credentials).
3. In Google Cloud Console, add `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback` to **Authorized redirect URIs**.

## DNS_PROBE_FINISHED_NXDOMAIN

If you see this error when signing in with Google, the Supabase project URL cannot be resolved:

- **Check project status**: Supabase free-tier projects are paused after 7 days of inactivity. Go to [Supabase Dashboard](https://supabase.com/dashboard) and ensure the project is active.
- **Verify VITE_SUPABASE_URL**: It must match exactly the Project URL from Supabase (e.g. `https://fswivlxhqonscymszwre.supabase.co`).
- **Redeploy after env changes**: Netlify builds with env vars at build time. After changing `VITE_SUPABASE_*`, trigger a new deploy.
