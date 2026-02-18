# 2026 Deployment Audit — Final

**Purpose:** Verify the codebase meets 2026 SEO and deployment requirements before push. Use this as the single source of truth for technical verification.

---

## 1. Verification Results

### 1.1 netlify.toml — Node 22 and headless Chromium

- **Requirement:** `NODE_VERSION = 22` to support headless Chromium (e.g. Netlify Prerender / product snapshots).
- **Verified:** `[build.environment]` contains `NODE_VERSION = "22"` in [netlify.toml](../netlify.toml) (line 11).
- **Status:** PASS.

### 1.2 IndexNow script — dist key file and plain-text content

- **Requirement:** Script must target `dist/4ed08a1ef99a4e2c900e1f0cd2eb69f8.txt` and write a plain-text string (key only).
- **Verified:** [scripts/write-indexnow-key.js](../scripts/write-indexnow-key.js):
  - Reads `INDEXNOW_KEY` (or `VITE_INDEXNOW_KEY`) from env.
  - Writes to `dist/` (after Vite build): `join(distDir, \`${trimmed}.txt\`)` → when key is `4ed08a1ef99a4e2c900e1f0cd2eb69f8`, file is `dist/4ed08a1ef99a4e2c900e1f0cd2eb69f8.txt`.
  - Content: `writeFileSync(filepath, trimmed, 'utf8')` — plain-text key string only, no JSON or extra bytes.
- **Status:** PASS. Ensure `INDEXNOW_KEY=4ed08a1ef99a4e2c900e1f0cd2eb69f8` is set in Netlify so the file is produced on deploy.

### 1.3 LocalBusiness schema — areaServed priorities

- **Requirement:** LocalBusiness `areaServed` must prioritise **Bo-Kaap, Athlone, Gatesville**.
- **Verified:** [src/lib/seo.js](../src/lib/seo.js): `AREAS_SERVED` lists `'Bo-Kaap'`, `'Athlone'`, `'Gatesville'` first (lines 18–20), then South Africa, Cape Town, and other areas. `getLocalBusinessSchema()` uses `areaServed: AREAS_SERVED.map(...)`.
- **Status:** PASS.

### 1.4 FAQPage schema — /near/bo-kaap and /near/athlone

- **Requirement:** FAQPage schema active on both local “near me” pages to capture local search intent.
- **Verified:**
  - [src/pages/LocalBoKaap.jsx](../src/pages/LocalBoKaap.jsx): `<Seo … faqs={LOCAL_LANDING_FAQS} />` (line 16).
  - [src/pages/LocalAthlone.jsx](../src/pages/LocalAthlone.jsx): `<Seo … faqs={LOCAL_LANDING_FAQS} />` (line 16).
  - [src/components/Seo.jsx](../src/components/Seo.jsx): When `faqs` is set, injects `getFAQPageSchema(faqs)` as JSON-LD (lines 182–188).
- **Status:** PASS.

---

## 2. Pre-Build Integrity Checklist

| Component | Target requirement | Status |
|-----------|---------------------|--------|
| **Node.js** | Must be v22.x in both netlify.toml and Netlify Dashboard. | [x] netlify.toml has `NODE_VERSION = "22"`. [ ] Confirm in Netlify Dashboard (Build & deploy → Environment) if you override. |
| **Security** | Headers must include Strict-Transport-Security with a long max-age. | [x] netlify.toml has `Strict-Transport-Security = "max-age=31536000; includeSubDomains; preload"` for `"/*"`. |
| **Indexing** | API key file `4ed08a1ef99a4e2c900e1f0cd2eb69f8.txt` must be in the dist root after build when `INDEXNOW_KEY` is set. | [x] Script writes `dist/<key>.txt` with key content. Set `INDEXNOW_KEY` in Netlify so production deploy produces the file. |
| **E-E-A-T** | About page must reference the Lead Curator's expertise in Cape Malay tradition. | [x] About page “About the Artisan” section references “Cape Town Islamic tradition” and “Cape Malay traditional headwear” and Lead Curator expertise. |
| **Local SEO** | NAP (Name, Address, Phone) must be consistent across all schema blocks. | [x] Name “Al-Ameen Caps” and address (Cape Town, Western Cape, ZA) are consistent in LocalBusiness and related schema. Add `telephone` to LocalBusiness when a public number is available. |

---

## 3. Strategic Post-Push Manual Actions

After you build and deploy, complete these three actions to finalise search and indexing:

### 1. IndexNow verification

- **Action:** Open `https://alameencaps.com/4ed08a1ef99a4e2c900e1f0cd2eb69f8.txt` in a browser.
- **Success:** The page shows only the key string `4ed08a1ef99a4e2c900e1f0cd2eb69f8` (no HTML, no extra text).
- **Why:** Bing can then accept your site for IndexNow; new or updated URLs (e.g. new products like Afgani Star or Na'lain Cap) can be pushed to Bing for faster indexing.

### 2. Netlify Prerender check

- **Action:** In Netlify, open your site → **Deploys** or **Functions** (and Edge) → **Logs**.
- **Confirm:** Edge/crawler requests are identified and served prerendered HTML (you should see Prerender/Edge activity when crawler user-agents hit the site).
- **Why:** Ensures the 2026 Prerender extension is serving full HTML to crawlers and AI agents, not an empty SPA shell.

### 3. Local citation push

- **Action:** Submit your live URL to:
  - **YellowPages.co.za**
  - **Brabys.com**
- **Critical:** Use the business name exactly **“Al-Ameen Caps”** (same as in schema and site) everywhere to avoid diluting trust signals and NAP consistency.

---

## 4. Summary

- **netlify.toml:** Node 22 and security headers (including HSTS) are correctly set.
- **IndexNow:** Script correctly targets `dist/4ed08a1ef99a4e2c900e1f0cd2eb69f8.txt` with plain-text key when `INDEXNOW_KEY` is set.
- **LocalBusiness:** areaServed prioritises Bo-Kaap, Athlone, Gatesville.
- **FAQPage:** Active on `/near/bo-kaap` and `/near/athlone` via `faqs={LOCAL_LANDING_FAQS}`.
- **E-E-A-T:** About page references Lead Curator and Cape Malay tradition.
- **NAP:** Name and address are consistent; add telephone to schema when you have a public number.

Complete the three post-push actions above after deploy to activate IndexNow, confirm prerendering, and strengthen local citations.
