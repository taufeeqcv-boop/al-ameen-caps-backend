# 2026 SEO Pre-Flight Audit — Al-Ameen Caps

**Audit date:** Run before commit/push/build. Use this to verify the technical foundation.

---

## 1. Pre-Flight Command Check (Results)

### netlify.toml
- **NODE_VERSION = "22"** — Present in `[build.environment]`.
- **[[headers]] for "/*"** — Present with:
  - `X-Frame-Options = "DENY"`
  - `X-Content-Type-Options = "nosniff"`
  - `Referrer-Policy = "strict-origin-when-cross-origin"`
  - `Strict-Transport-Security = "max-age=31536000; includeSubDomains; preload"`
- **Verdict:** Passes 2026 security audit.

### IndexNow verification file
- **Mechanism:** Build script `scripts/write-indexnow-key.js` writes `dist/<KEY>.txt` when `INDEXNOW_KEY` is set at build time. File contains only the key string.
- **Required:** Set `INDEXNOW_KEY=4ed08a1ef99a4e2c900e1f0cd2eb69f8` in **Netlify** (Build & deploy → Environment variables). After deploy, the file will be at `https://www.alameencaps.com/4ed08a1ef99a4e2c900e1f0cd2eb69f8.txt`.
- **Local test:** Run `INDEXNOW_KEY=4ed08a1ef99a4e2c900e1f0cd2eb69f8 npm run build` (or set in .env and build); confirm `dist/4ed08a1ef99a4e2c900e1f0cd2eb69f8.txt` exists and contains only the key.
- **Verdict:** Compliant when `INDEXNOW_KEY` is set in Netlify; do not commit the key file to the repo.

### Schema (LD+JSON)
- **Product:** Injected via `Seo.jsx` using `getProductSchema(product)` on each product page. JSON-LD in `<script type="application/ld+json">` in document head. No `itemscope`/microdata; schema is LD+JSON only.
- **LocalBusiness:** Injected on Home (Home.jsx), Shop (Seo with `localBusiness`), and local landing pages (LocalBoKaap, LocalAthlone). Contains name, description, url, image, address, areaServed, priceRange, sameAs.
- **Verdict:** Product and LocalBusiness schemas present via LD+JSON.

### Product images (width, height, loading)
- **Shop grid (ProductCard):** `width={400}` `height={400}`; `loading={index < 3 ? "eager" : "lazy"}` (first 3 eager, rest lazy).
- **Product detail (ImageMagnifier):** `width={600}` `height={600}`; `loading="eager"`.
- **Hero:** Uses CSS `background-image` (no `<img>`); no CLS from img.
- **Navbar/Footer logos:** Explicit `width`/`height` added for layout stability (CLS).
- **Verdict:** Major product images have explicit dimensions and lazy loading where appropriate; hero is background-image.

---

## 2. Technical Integrity Verification

### Infrastructure & Indexing
| Item | Status |
|------|--------|
| IndexNow key file name | `4ed08a1ef99a4e2c900e1f0cd2eb69f8.txt` (generated when `INDEXNOW_KEY` is set) |
| IndexNow file content | Key string only (script writes `trimmed` value) |
| Netlify security headers | X-Frame-Options, X-Content-Type-Options, HSTS present |

### Schema & E-E-A-T
| Page | Schema | Required fields check |
|------|--------|------------------------|
| **Home** | LocalBusiness, WebSite | LocalBusiness: name, image, url, address. WebSite: name, url, description. |
| **Shop** | ItemList, LocalBusiness, BreadcrumbList | ItemList: itemListElement, numberOfItems. LocalBusiness: same as Home. |
| **Product (detail)** | Product, BreadcrumbList | Product: name, image, url, brand, offers (priceCurrency, price, availability). |
| **/near/bo-kaap, /near/athlone** | LocalBusiness, FAQPage | FAQPage: mainEntity (Question/Answer). |

**Product (JSON-LD) required for rich results:** name, image, offers (with price). All present.  
**LocalBusiness:** name, image, address. All present.

### Core Web Vitals (2026)
| Check | Status |
|-------|--------|
| Hero image format | Hero uses PNG via CSS background (Vite bundles as asset). AVIF/WebP can be added in a future build step for hero if desired. |
| Layout stability (CLS) | Product and detail images have explicit width/height; Navbar and Footer logos have width/height. |

---

## 3. Final Manual Steps (Before Push)

1. **Environment variables:** In Netlify UI (Site → Build & deploy → Environment), set `INDEXNOW_KEY` = `4ed08a1ef99a4e2c900e1f0cd2eb69f8` (not only in local `.env`).
2. **Prerender extension:** In Netlify, confirm the **Prerender** extension is installed for this site (Extensions → Prerender → Enable). Legacy prerendering must be OFF (Build & deploy → Post processing → Prerendering).
3. **Local build test:** Run `npm run build` in the project root. No errors = ready to push. With `INDEXNOW_KEY` set, build output should include: `IndexNow: wrote 4ed08a1ef99a4e2c900e1f0cd2eb69f8.txt to dist/`.

---

## 4. Quick Reference

- **IndexNow:** [Bing IndexNow](https://www.bing.com/indexnow) — use the same key in the `.txt` filename and content.
- **Prerendering:** [docs/PRERENDERING_AND_PERFORMANCE.md](PRERENDERING_AND_PERFORMANCE.md).
- **Deploy checklist:** [DEPLOY_CHECKLIST.md](../DEPLOY_CHECKLIST.md).
