# Deployment Topology (CRITICAL — Single Netlify Site)

**Last updated:** Per critical deployment update. This is the source of truth for deployment and production behavior.

---

## 1. Single Netlify Site

- **Site name:** `al-ameen-caps-backend`
- **Role:** Serves **both** the React frontend and Netlify Functions (one deploy, one site).
- **Production domain:** https://www.alameencaps.com (mapped to this site).

**Do not separate frontend and backend into different repos or Netlify sites.** Treat `src/` and `netlify/functions/` as part of the same deployed unit.

---

## 2. Functions

- **Functions path:** `/.netlify/functions/` (relative paths work; same origin as the frontend).
- **VITE_FUNCTIONS_BASE:** May still point to the backend URL for compatibility; with single-site, same-origin requests work without it.

---

## 3. Production Environment

- **VITE_SITE_URL:** `https://www.alameencaps.com` — Use this for:
  - Google OAuth redirects
  - PayFast return/cancel/notify URLs
  - Any code that needs the canonical site URL
- **PayFast:** **LIVE (real money).** `VITE_PAYFAST_SANDBOX = false`. Production merchant ID and key are set. Do not revert to test/sandbox mode without explicit intent.
- **Email:** Gmail SMTP env vars (EMAIL_*) are set for production (e.g. reservation and order emails).

---

## 4. Instructions for Future Edits

1. **Site URL in code:** Always use `import.meta.env.VITE_SITE_URL` (or build-time equivalent) when referencing the site URL (OAuth, PayFast, links).
2. **Payments:** We are in production mode; avoid changing PayFast to sandbox/test unless required.
3. **Architecture:** Frontend and backend are on the same site; no cross-site function calls required for normal operation.

---

*This file should be kept in sync with Netlify configuration and any domain or env changes.*
