# Image loading plan – Heritage & product pages

Pictures on the **Heritage** page and **product** (and shop) pages are loading too slowly. This doc outlines causes and a phased plan to fix them.

---

## Current state

### Heritage page (`/heritage`)
- **~15+ images** under `/images/heritage/*.png` (static from `public/`).
- **1 video**: `/videos/heritage-timeline.mp4`.
- `HeritageImage` and several raw `<img>` tags use `loading="lazy"` but:
  - No responsive sizes (`srcset`).
  - No modern formats (WebP/AVIF).
  - No blur/placeholder while loading.
  - No explicit dimensions on some images (can cause layout shift).
- Video uses `preload="metadata"` (good) but is likely large; no poster or lazy-load strategy.

### Product page (`/product/:id`) & shop
- **Product images**: from Vite-bundled imports (`src/assets/collection/*.png`) or `getCollectionImageUrl()` → `https://alameencaps.com/collection/{filename}` (files in `public/collection/`).
- **ImageMagnifier**: single `<img>` with `loading="eager"`, fixed `width={600} height={600}`; no responsive image, no WebP, no low-res placeholder.
- **ProductCard** (shop): same full-size image URL; first 3 cards `eager`, rest `lazy` — but still one large asset per product.

**Likely causes of slowness:**
1. Large file sizes (full-resolution PNGs served everywhere).
2. No responsive images (mobile downloads desktop-sized assets).
3. No modern formats (WebP/AVIF much smaller than PNG).
4. No perceived-performance tricks (blur placeholder, LQIP).
5. Heritage: many images on one page; product: one heavy hero image.

---

## Plan (phased)

### Phase 1 – Quick wins (no new infra)
1. **Optimise assets at source**
   - **Heritage**: Resize and compress all `/public/images/heritage/*.png` (e.g. max width 1200–1600px for content images, 800px for portraits). Export WebP (and keep PNG fallback if needed). Compress PNGs (e.g. TinyPNG, ImageOptim, or build script with `sharp`).
   - **Product**: Same for `/public/collection/*.png` and/or `src/assets/collection/*.png`: e.g. 800–1200px max, WebP + compressed PNG.
   - **Video**: Compress `heritage-timeline.mp4` (smaller resolution/bitrate if acceptable). Add `poster="/images/heritage/video-poster.jpg"` so the slot is filled before playback.
2. **Dimensions and layout**
   - Give every `<img>` explicit `width` and `height` (or `aspect-ratio` in CSS) to avoid layout shift; keep `loading="lazy"` for below-the-fold Heritage images.
3. **Product hero**
   - Keep `loading="eager"` for the main product image, but ensure the file served is already optimised (Phase 1.1). Optionally add a small inline or first-frame placeholder (e.g. 20px blur data URL) in a follow-up.

**Deliverables:** Smaller files, WebP where we add it, video poster + lighter video, no layout shift.

---

### Phase 2 – Responsive images
1. **Generate multiple sizes**
   - Script (e.g. Node + `sharp`) to generate:
     - Heritage: e.g. 400w, 800w, 1200w (and WebP/AVIF if desired).
     - Products: e.g. 400w (cards), 800w (detail), 1200w (magnifier zoom).
   - Put generated files in `public/` (e.g. `public/images/heritage/400/`, `800/`, or `images/heritage/img-name-800.webp`).
2. **Use `srcset` + `sizes`**
   - **Heritage**: Replace each Heritage image with `<img srcset="... 400w, ... 800w, ... 1200w" sizes="(max-width: 768px) 100vw, ..." />` (and `<picture>` with WebP if we don’t use only WebP).
   - **Product**: Same for ProductDetails hero and ProductCard: `sizes` so mobile gets 400w, desktop 800w or 1200w.
3. **Fallback**
   - `src` = best PNG or default WebP; older browsers get PNG.

**Deliverables:** Right-sized image per device, fewer bytes on mobile, faster LCP on product page.

---

### Phase 3 – Perceived performance
1. **Blur placeholder (LQIP)**
   - Option A: Inline tiny base64 (e.g. 20×20 blur) in `HeritageImage` and product hero; swap to real image on load.
   - Option B: Pre-generate tiny (e.g. 40px) images or data URLs in build script; use as `placeholder` in a small `OptimizedImage` component.
2. **Heritage**
   - Wrap all Heritage images in one shared component that supports `src`, `srcset`, `sizes`, and placeholder; use for both `HeritageImage` and the raw `<img>` usages so behaviour is consistent.
3. **Product**
   - In ImageMagnifier (or parent): show blur/LQIP until main image has loaded, then reveal (optional fade).

**Deliverables:** No blank gaps; content feels faster even if total bytes are similar in Phase 3.

---

### Phase 4 – Optional (CDN / advanced)
- Serve static images (and video) from a CDN (e.g. Netlify’s asset optimisations, or Cloudinary/Imgix) with on-the-fly resizing/WebP.
- If you add a CDN, point `getCollectionImageUrl()` and Heritage `src`/`srcset` at CDN URLs and optionally add cache headers.

---

## Suggested order of implementation

| Step | Action | Impact |
|------|--------|--------|
| 1.1 | Resize + compress Heritage PNGs; add WebP; add video poster + compress video | High – Heritage loads much faster |
| 1.2 | Resize + compress product images (public + assets); WebP | High – Product/Shop faster |
| 1.3 | Explicit dimensions on all Heritage and product images | Medium – No layout shift, stable CLS |
| 2.1 | Script to generate 400/800/1200 (and WebP) for Heritage + products | High – Right size per device |
| 2.2 | Add `srcset`/`sizes` (and `<picture>` if needed) on Heritage | High |
| 2.3 | Add `srcset`/`sizes` on ProductDetails + ProductCard | High |
| 3.1 | LQIP/blur placeholder component; use on Heritage + product hero | Medium – Perceived speed |

---

## Files to touch

- **Heritage:** `src/pages/Heritage.jsx` (HeritageImage, all `<img>` and video).
- **Product:** `src/pages/ProductDetails.jsx`, `src/components/ImageMagnifier.jsx`, `src/components/ProductCard.jsx`.
- **Data:** `src/data/collection.js` / `collectionImages.js` if we switch to multi-size URLs.
- **Assets:** `public/images/heritage/`, `public/collection/`, `src/assets/collection/`, `public/videos/`.
- **Build:** Optional `scripts/optimize-images.js` (or similar) for resize/WebP/sizes; run in CI or pre-deploy.

---

## Success metrics

- **LCP** (Largest Contentful Paint): product page and Heritage hero/above-fold image improve (target: &lt; 2.5s on 4G).
- **CLS** (Cumulative Layout Shift): 0 from images (explicit dimensions + placeholder).
- **Total image bytes**: Lower on mobile (responsive + WebP); Heritage and product page payloads reduced.

Once Phase 1 is done, we can implement Phase 2 (responsive) and Phase 3 (placeholders) in code while keeping asset generation in the script.
