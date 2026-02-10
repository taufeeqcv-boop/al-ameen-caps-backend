# Supabase Auth & Google Sign-in Setup

## Environment Variables

Set these in Netlify (Site settings → Environment variables) and in local `.env`:

```
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_SITE_URL=https://www.alameencaps.com
```

- **VITE_SUPABASE_URL**: From Supabase Dashboard → Project Settings → API → Project URL  
- **VITE_SUPABASE_ANON_KEY**: From Project Settings → API → Project API keys → `anon` `public`  
- **VITE_SITE_URL**: Your live site URL (no trailing slash). Used as OAuth redirect target.

## Supabase Dashboard — URL Configuration

In **Supabase Dashboard → Authentication → URL Configuration**:

1. **Site URL** (default redirect):  
   `https://www.alameencaps.com`

2. **Redirect URLs** (allowed OAuth redirect targets):  
   Add **all** environments where users sign in, or Google will redirect to Site URL (production) instead of localhost:
   - `https://www.alameencaps.com/**`
   - `https://al-ameen-caps.netlify.app/**` (legacy/backup)
   - `http://localhost:8888/**` (for **netlify dev**)
   - `http://localhost:5173/**` (for **npm run dev** / Vite only)

   If localhost is missing, signing in with Google will send users to the production URL after login.

## Google Provider

1. In **Authentication → Providers**, enable Google.
2. Add your Google OAuth Client ID and Secret (from [Google Cloud Console](https://console.cloud.google.com/) credentials).
3. In Google Cloud Console, add `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback` to **Authorized redirect URIs**.

## “Signups not allowed” / access_denied (signup_disabled)

If users are redirected to your site with `?error=access_denied&error_code=signup_disabled` (or similar in the hash), **sign-ups are disabled** in Supabase for that provider.

**Fix:** In **Supabase Dashboard → Authentication → Providers → Google** (or the provider you use), ensure **“Enable Sign ups”** is turned **on** so new users can register. If you want only existing users to sign in, leave it off and add users manually in **Authentication → Users** (e.g. by email invite).

The app will show a short message when this error is present and clean the URL after redirect.

## “Invalid API key” on localhost:8888 (or after Google login)

- **Frontend (shop / login):** Use the **anon** key in `.env` as `VITE_SUPABASE_ANON_KEY` (from Supabase → Project Settings → API → anon public). Do **not** use the service_role key here. Remove any extra spaces or quotes around the key. Restart the dev server (`npm run dev` or `netlify dev`) after changing `.env`.
- **Reservation / serverless function:** The reservation function needs `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in `.env` (service_role key, not anon). Restart `netlify dev` after changing `.env`.

## “Invalid API key” when placing a reservation (localhost or Netlify)

- **Local (netlify dev):** The reservation function needs `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in your project `.env`. Get the **service_role** key from Supabase Dashboard → Project Settings → API → Project API keys (not the anon key). Restart `netlify dev` after changing `.env`.
- **Production (Netlify):** In Netlify → Site configuration → Environment variables, add `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` (same values as your Supabase project), then trigger a new deploy.

## Shop shows “Out of stock” or no images after sign-in or on production

- **Redirecting to production after Google sign-in:** Add `http://localhost:8888/**` and `http://localhost:5173/**` to Supabase Redirect URLs (see above). Otherwise Supabase sends users to the Site URL (production) after OAuth.
- **Production: no images / out of stock:** Ensure Netlify has **VITE_SUPABASE_URL** and **VITE_SUPABASE_ANON_KEY** set (same Supabase project as `SUPABASE_URL`), then **redeploy**. The build bakes these into the frontend; without them the shop can’t load products and images.

## DNS_PROBE_FINISHED_NXDOMAIN

If you see this error when signing in with Google, the Supabase project URL cannot be resolved:

- **Check project status**: Supabase free-tier projects are paused after 7 days of inactivity. Go to [Supabase Dashboard](https://supabase.com/dashboard) and ensure the project is active.
- **Verify VITE_SUPABASE_URL**: It must match exactly the Project URL from Supabase (e.g. `https://YOUR_PROJECT_REF.supabase.co`). If you see `DNS_PROBE_FINISHED_NXDOMAIN`, the project may be paused, deleted, or the URL is wrong — check [Supabase Dashboard](https://supabase.com/dashboard).
- **Redeploy after env changes**: Netlify builds with env vars at build time. After changing `VITE_SUPABASE_*`, trigger a new deploy.
