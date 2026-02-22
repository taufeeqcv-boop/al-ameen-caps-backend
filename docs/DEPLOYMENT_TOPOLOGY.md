# Deployment Topology (CRITICAL — Single Netlify Site)

**Last updated:** Per critical deployment update. This is the source of truth for deployment and production behavior.

---

## 1. Single Netlify Site

- **Site name:** `al-ameen-caps-backend`
- **Role:** Serves **both** the React frontend and Netlify Functions (one deploy, one site).
- **Production domain:** https://alameencaps.com (primary in Netlify). www.alameencaps.com redirects to apex.

**Do not separate frontend and backend into different repos or Netlify sites.** Treat `src/` and `netlify/functions/` as part of the same deployed unit.

---

## 2. Functions

- **Functions path:** `/.netlify/functions/` (relative paths work; same origin as the frontend).
- **VITE_FUNCTIONS_BASE:** May still point to the backend URL for compatibility; with single-site, same-origin requests work without it.

---

## 3. Production Environment

- **VITE_SITE_URL:** `https://alameencaps.com` — Use this for:
  - Google OAuth redirects
  - PayFast return/cancel/notify URLs
  - Any code that needs the canonical site URL
- **INDEXNOW_KEY:** Optional. When set in Netlify (Build & deploy → Environment), the build writes `dist/<key>.txt` for IndexNow/Bing. Enables faster indexing of new or updated pages. See `scripts/write-indexnow-key.js` and `.env.example`.
- **PayFast:** **LIVE (real money).** `VITE_PAYFAST_SANDBOX = false`. Production merchant ID and key are set. Do not revert to test/sandbox mode without explicit intent.
- **Email:** Gmail SMTP env vars (EMAIL_*) are set for production (e.g. reservation and order emails).

---

## 4. Instructions for Future Edits

1. **Site URL in code:** Always use `import.meta.env.VITE_SITE_URL` (or build-time equivalent) when referencing the site URL (OAuth, PayFast, links).
2. **Payments:** We are in production mode; avoid changing PayFast to sandbox/test unless required.
3. **Architecture:** Frontend and backend are on the same site; no cross-site function calls required for normal operation.

---

---

## 5. Search Console indexing

- **Canonical URL:** Use `https://alameencaps.com` everywhere (sitemap, canonical tags, OAuth, PayFast). Primary domain in Netlify is the apex; www redirects to it.
- **Redirects:** Netlify redirects `al-ameen-caps.netlify.app` → `https://alameencaps.com`. Netlify domain settings redirect www → apex. “Page with redirect” in GSC for www URLs is expected.
- **noindex:** Only `/checkout` and `/account` use `noindex, nofollow` (intentional). All other pages are indexable.

---

## 6. Domain & DNS (Netlify)

- **Primary domain:** alameencaps.com. www.alameencaps.com redirects to it automatically (set in Netlify Domain settings).
- **SSL/TLS:** Netlify provisions Let’s Encrypt. If it shows “Waiting for DNS propagation,” allow 1–2 hours.
- **Netlify DNS:** With Netlify as DNS, SSL and subdomains are managed there. If you use email on the domain (e.g. Zoho, Google Workspace, Titan), add the provider’s **MX records** in Netlify DNS or mail will not be delivered.

---

## 7. Go-live punch list

Use this list to confirm Al-Ameen Caps is officially live and professional after the apex-domain alignment.

- [ ] **1. Netlify environment variable**  
  **Path:** Site settings → Build & deploy → Environment variables.  
  **Key:** `VITE_SITE_URL`  
  **Value:** `https://alameencaps.com`  
  Ensures order/shipping emails and PayFast links use the correct domain (no extra redirects).

- [ ] **2. Google Search Console**  
  - Add a **URL prefix** property for `https://alameencaps.com`.  
  - Submit sitemap: `https://alameencaps.com/sitemap.xml`.  
  - **Note:** URL Inspection may show “Duplicate, Google chose different canonical than user” for a few days while Google processes the www → apex change; the new canonicals will align it.

- [ ] **2b. Google Merchant Center (Search Shopping tab)**  
  To get products on the **Search Shopping** tab, add a product feed in Merchant Center:  
  1. Go to [Google Merchant Center](https://merchantcenter.google.com/) and add or select your business (alameencaps.com).  
  2. **Products** → **Feeds** → **Add feed** (or **Add product data**).  
  3. Choose **Website** (or “Fetch from URL”) and enter: **`https://alameencaps.com/product-feed.xml`**  
  4. Set **Country of sale** to **South Africa** and **Language** to **English**.  
  5. Save and run a fetch. The feed is generated at build time (RSS 2.0 with required attributes).  
  6. After approval, fix any “Needs attention” issues in Merchant Center if the feed reports errors.

- [ ] **3. PayFast & ITN verification**  
  - Run one small test transaction.  
  - Confirm PayFast redirects back to `https://alameencaps.com/success` (not www or .netlify.app) to avoid session/auth issues.  
  - Confirm ITN (Instant Transaction Notification) reaches the site; `itn-listener.ts` and `initiate-payment.ts` use the apex domain.

- [ ] **4. MX records (business email)**  
  With DNS on Netlify, **MX records must be added in Netlify DNS** or mail for the domain will not be delivered.  
  Add the records your provider gives you (e.g. Zoho, Google Workspace, Titan) in Netlify → Domain management → DNS → MX. If you share your provider, the exact records can be listed here.

---

## 8. Monitoring & maintenance

- **GSC:** Use a single **URL prefix** property for `https://alameencaps.com` as the source of truth. You can remove or ignore other properties (e.g. www, netlify.app) to keep the dashboard focused on real traffic.
- **Key metrics to watch:** Performance → Search results (clicks, impressions, average position). For the query **"Caps"**, check periodically; moving into the **top 10** average position is a useful milestone.
- **Automated "Caps in top 10" alert:** Google Search Console does not offer a built-in “notify when keyword reaches position X.” To automate:
  1. Use the [Search Console API](https://developers.google.com/webmaster-tools/search-console-api-original) with a Google Cloud service account that has access to the property.
  2. Run a scheduled job (e.g. weekly cron, GitHub Action, or Netlify scheduled function) that fetches search analytics for the query `Caps`, reads the average position for the chosen date range, and sends an email or Slack message when position ≤ 10.
  3. Store credentials (e.g. `GOOGLE_APPLICATION_CREDENTIALS` or JSON key) in env and never in the repo. A small script can live in `scripts/` (e.g. `scripts/gsc-check-caps-position.js`) when you are ready to add it.

  **Implemented:** The script **`scripts/gsc-check-caps-position.js`** is now the standard for tracking the "Caps" keyword. It targets `https://alameencaps.com`, filters for query **"Caps"** and country **South Africa (zaf)**, uses the last 3 days of data, and logs **SUCCESS** when average position ≤ 10 (otherwise logs current position). Run with `node scripts/gsc-check-caps-position.js`; requires `GSC_CLIENT_EMAIL` and `GSC_PRIVATE_KEY` in env. Can be wired into a deploy smoke test or a GitHub Action (e.g. every Monday 8:00 AM).

---

---

## 9. Google Merchant Center (Search Shopping tab)

To get products on the **Search Shopping** tab, add a product feed in [Google Merchant Center](https://merchantcenter.google.com/):

- **Feed URL:** `https://alameencaps.com/product-feed.xml` (generated at build time; 14 products, RSS 2.0 with Google product attributes).
- **Steps:** Products → Feeds → Add feed → Website / Fetch from URL → enter the feed URL → Country: South Africa, Language: English → Save and run fetch.
- Then check Products → Diagnostics for any "Needs attention" issues.

---

*This file should be kept in sync with Netlify configuration and any domain or env changes.*
