# Al-Ameen Caps: Strategic Deployment Manifesto (2026) — Completion Tracker

Objective: Search engine dominance for the Inaugural Collection (Kufi, Fez, Taj, Turban) in Cape Town via Netlify high-performance infrastructure and hyper-local E-E-A-T signals.

---

## Phase 1: Infrastructure & Security (Netlify & Node 22.x)

| Task | Cursor AI | Manual | Status |
|------|------------|--------|--------|
| Node 22.x & netlify.toml | Done | — | [x] |
| Netlify Prerender Extension | — | Install/Enable in dashboard | [ ] |
| Legacy Prerendering OFF | — | Build & Deploy > Post Processing | [ ] |
| IndexNow key file | Done (build script) | Set `INDEXNOW_KEY` in Netlify env; get key from Bing IndexNow | [ ] |

**Implemented:**  
- [netlify.toml](netlify.toml): `NODE_VERSION = "22"`, security headers (X-Frame-Options, X-Content-Type-Options, Referrer-Policy, **Strict-Transport-Security**).  
- [scripts/write-indexnow-key.js](scripts/write-indexnow-key.js): Writes `dist/<KEY>.txt` when `INDEXNOW_KEY` is set at build time. Add `INDEXNOW_KEY` in Netlify (Build & deploy > Environment).

---

## Phase 2: Semantic SEO & Product Architecture

| Task | Cursor AI | Manual | Status |
|------|------------|--------|--------|
| Semantic HTML & AVIF | Done (HTML + dimensions + lazy) | AVIF: optional build step later | [x] |
| JSON-LD (Product & LocalBusiness) | Done | — | [x] |

**Implemented:**  
- Shop: [src/pages/Shop.jsx](src/pages/Shop.jsx) — `<h1>` Inaugural Collection, each product in `<article>` with `<h2>` ([ProductCard](src/components/ProductCard.jsx)).  
- JSON-LD: ItemList for shop collection + LocalBusiness on shop; Product schema on each product page; LocalBusiness `areaServed` includes **Bo-Kaap, Athlone, Gatesville** first.  
- Images: `width={400}` `height={400}`, `loading="lazy"` for non-hero (first 3 eager). AVIF can be added later via build-time conversion.

---

## Phase 3: E-E-A-T & Author Authority

| Task | Cursor AI | Manual | Status |
|------|------------|--------|--------|
| Lead Curator / E-E-A-T content | Done | — | [x] |
| Google Business Profile | — | Verify "Al-Ameen Caps" in Google | [ ] |

**Implemented:**  
- [src/pages/About.jsx](src/pages/About.jsx): "About the Artisan" (Lead Curator, Cape Town Islamic tradition, Cape Malay headwear, Na'lain materials, premium Taj, authentic Bo-Kaap Fez) + "Our Artisanal Process".  
- Blog: [src/pages/EvolutionFezKufi.jsx](src/pages/EvolutionFezKufi.jsx) — "The Evolution of the Fez and Kufi in the Cape" at `/culture/evolution-fez-kufi-cape` with Article schema.  
- Person (Lead Curator) schema on About; brand url on products points to `/about`.

---

## Phase 4: Local Nuance & Citations

| Task | Cursor AI | Manual | Status |
|------|------------|--------|--------|
| Neighborhood landing pages | Done | — | [x] |
| SA directory submissions | — | Submit to YellowPages.co.za, Brabys, SAYellow | [ ] |
| Reddit (r/capetown) | — | Post when relevant, don’t spam | [ ] |

**Implemented:**  
- [src/pages/LocalBoKaap.jsx](src/pages/LocalBoKaap.jsx): `/near/bo-kaap` — "Best Kufi Shop Near Bo-Kaap", LocalBusiness + FAQPage schema.  
- [src/pages/LocalAthlone.jsx](src/pages/LocalAthlone.jsx): `/near/athlone` — "Best Kufi Shop Near Athlone", LocalBusiness + FAQPage schema.  
- [src/data/localFAQs.js](src/data/localFAQs.js): Shared FAQs (sizing, traditional wear, delivery); JSON-LD FAQPage on both local pages.

---

## Quick reference

- **IndexNow:** Set `INDEXNOW_KEY` in Netlify to your Bing IndexNow API key; build will emit `<key>.txt` in `dist/`.  
- **Netlify build fails on Node 22:** Ensure Netlify build environment has `NODE_VERSION = 22` (set in [netlify.toml](netlify.toml) or in dashboard).  
- **AVIF:** Current setup uses PNG with explicit width/height and lazy loading. For AVIF, add a build step (e.g. sharp or vite plugin) to generate and serve AVIF; update img tags to use `<picture>` with `source type="image/avif"` where needed.
