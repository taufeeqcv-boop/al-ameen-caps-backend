# Sitemap Verification for Entity Success

The sitemap is a map of your authority in the Cape Malay and Islamic headwear space. Keeping it healthy helps Google discover your LCP-optimized, schema-heavy pages faster and supports the "Caps" keyword push from position 13 into the Top 10.

---

## 1. URL check

**Visit:** [https://alameencaps.com/sitemap.xml](https://alameencaps.com/sitemap.xml)

**What you should see:**

- Valid XML with `<urlset>` and multiple `<url>` entries.
- **Total URLs:** 34 (17 static pages + 3 blog posts + 14 product/collection pages).
- Each `<url>` has `<loc>`, `<lastmod>`, `<changefreq>`, and `<priority>`.

**Local check (before deploy):**

```bash
npm run build
```

During build you’ll see: `Sitemap: generated 34 URLs with base https://alameencaps.com`.  
Then open `public/sitemap.xml` (or `dist/sitemap.xml` after build) in a browser or editor.

---

## 2. Entity presence

The sitemap **must** include your ranking collection paths so Google can crawl them and pick up entity-rich metadata and schema.

**Required product paths (examples):**

| Path | Entity / product |
|------|------------------|
| `/product/collection-1` | Na'lain Cap (ranking #1 for specific queries) |
| `/product/collection-2` | Afgani Star Cap |
| `/product/collection-12` | Royal Ottoman Fez |
| `/product/collection-14` | Turkish Naqshbandi Taj |
| … | All 14 collection IDs from `src/data/collection.js` |

**Other entity-rich paths included:**

- `/shop` — catalog
- `/heritage` — Cape Islamic headwear history
- `/near/bo-kaap`, `/near/athlone` — local landing pages
- `/culture/evolution-fez-kufi-cape` — Fez/Kufi evolution
- `/guides/kufi-care`, `/guides/eid-headwear-south-africa`, `/guides/islamic-headwear-cape-town`

**Source of truth:** `scripts/generate-sitemap.js` builds the sitemap from:

- `staticPages` (17 routes)
- `BLOG_POSTS` from `src/data/blogPosts.js` (3 posts)
- `COLLECTION_PRODUCTS` from `src/data/collection.js` (14 products → `/product/{id}`)

Adding a new product or blog post and rebuilding will automatically add the new URL to the sitemap.

---

## 3. GSC submission

1. Go to [Google Search Console](https://search.google.com/search-console) and select the property **alameencaps.com**.
2. Open **Sitemaps** (left sidebar).
3. If the sitemap is not yet submitted, enter: `sitemap.xml` and click **Submit**.
4. Confirm status is **Success** (green). This means Google has processed the sitemap and can crawl your entity-rich pages.

If status is "Couldn't fetch" or "Has errors", fix the reported issues (e.g. wrong domain, invalid XML, or blocked by robots.txt).

---

## Why this matters for the "Caps" keyword

- **Faster discovery** — A correct sitemap helps bots find LCP-optimized and schema-heavy product pages without relying only on links.
- **Less resource load delay** — Quicker discovery supports faster indexing and can reduce the impact of "Resource load delay" (e.g. the ~1,420 ms noted in Lighthouse) in terms of when Google can assess your page.
- **Entity coverage** — All key collection URLs (including Na'lain Cap and other caps) are declared in one place, so Google can prioritize crawling the pages that target "Caps" and related queries in South Africa.

---

## Regenerating the sitemap

The sitemap is generated at **build time**:

```bash
npm run build
```

The build runs `node scripts/generate-sitemap.js`, which writes `public/sitemap.xml`. Vite then copies `public/` into `dist/`, so the live sitemap at `https://alameencaps.com/sitemap.xml` is always from the last deploy.

To generate **only** the sitemap (e.g. for a quick local check):

```bash
node scripts/generate-sitemap.js
```

Then open `public/sitemap.xml`.
