# SEO checklist — Al-Ameen Caps (South Africa e-commerce)

Use this **before you push to Git** and **after you deploy to Netlify**, so nothing is missed.

---

## Before you push to Git

- [ ] **Build runs clean**  
  `npm run build` — sitemap is generated and `dist/` contains `sitemap.xml`, `robots.txt`, and all pages.

- [ ] **Env for production**  
  If you use a custom domain, set `VITE_SITE_URL` (e.g. `https://www.al-ameen-caps.co.za`) in Netlify so the sitemap and canonicals use the correct domain.

- [ ] **No secrets in repo**  
  No `.env` or API keys committed; only `.env.local.example` / `env.backend.example` as templates.

---

## After Netlify deploy

1. **Open Google Search Console**  
   [search.google.com/search-console](https://search.google.com/search-console)

2. **Add property** (if not already)  
   - URL prefix: `https://alameencaps.com` (or your custom domain).  
   - Verify via HTML tag (add the meta tag to `index.html` if GSC gives you one) or DNS.

3. **Submit sitemap**  
   - In GSC: **Sitemaps** → Add new sitemap.  
   - Enter: `https://alameencaps.com/sitemap.xml`  
   - Submit. Status will show “Success” once Google has read it.

4. **Request indexing (optional)**  
   - **URL Inspection** → paste your homepage URL → **Request indexing** for a faster first crawl.

5. **"Discovered – currently not indexed" (e.g. 18 pages)**  
   Google has found your URLs but has not yet crawled and indexed them. Normal for new or low-traffic sites.
   - **Submit the sitemap** in GSC (Sitemaps → add `sitemap.xml`) if you haven't.
   - **Request indexing** for key URLs: URL Inspection → enter e.g. `/` and `/shop` → Request indexing.
   - **Redeploy** after changes so sitemap `lastmod` updates.
   - **Wait** — indexing often takes days to a few weeks. No code change required.

---

## What’s already in place (reference)

| Item | Status |
|------|--------|
| **Meta** | Unique title, description (≤160 chars), keywords; canonical on all pages |
| **Open Graph** | og:title, og:description, og:image, og:url, og:locale (en_ZA), og:type |
| **Twitter Card** | summary_large_image with title, description, image |
| **Structured data** | Product (ZAR, availability), Breadcrumb, LocalBusiness (areaServed: SA + cities/suburbs), WebSite (search action) |
| **Sitemap** | Generated at build; includes /, /shop, /about, /contact, /shipping, /privacy, /terms, /product/:id |
| **robots.txt** | Allow / ; Disallow /admin, /success, /checkout, /login ; Sitemap URL |
| **Local SEO** | Keywords and schema for Cape Town, Durban, Johannesburg, PE, Northern/Southern suburbs, Winelands, Bo-Kaap, Tableview, Bellville, Durbanville, etc. |
| **E-commerce** | Product schema with price in ZAR, availability, shipping to ZA |

---

## Optional later improvements

- **Custom domain** — Use your own domain and set it in GSC + Netlify; update `VITE_SITE_URL` and regenerate sitemap.
- **Google Business Profile** — If you have a physical location or serve a specific area, add and verify for local pack.
- **Core Web Vitals** — Monitor in GSC (Experience → Core Web Vitals) and improve if needed.
- **More content** — Blog or category pages (e.g. “Kufi”, “Fez”, “Ramadaan”) can help for long-tail keywords.
