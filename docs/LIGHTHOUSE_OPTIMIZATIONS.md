# Lighthouse Optimizations (alameencaps.com)

Summary of changes made to improve Performance and Accessibility scores.

## 1. Critical Path & Render Blocking

- **Preconnect:** `fonts.googleapis.com`, `fonts.gstatic.com` (crossorigin), `googletagmanager.com` in `index.html`.
- **Fonts:** Google Fonts loaded with `rel="preload" as="style"` and applied via `onload` so they don’t block first paint (~750ms savings).
- **Critical CSS:** Small inline `<style>` in `index.html` for `#root` and `.loading-placeholder` to avoid FOUC and layout shift before the main CSS loads.
- **GTM:** GTM script is deferred with `requestIdleCallback` (fallback `setTimeout(500)`) so the main thread is free for first paint; dataLayer and consent/default still run immediately.

## 2. Image Optimization

- **Hero (LCP):** `<picture>` with `/hero-bg.webp` (WebP) and PNG fallback; `fetchPriority="high"`, `loading="eager"`, explicit `width`/`height` to reduce CLS.
- **Footer logo:** `<picture>` with `/logo.webp` (192×192 WebP) and PNG fallback; `loading="lazy"`, `decoding="async"`, explicit dimensions.
- **Script:** `scripts/optimize-images.js` generates `public/logo.webp` (resized 192×192) and `public/hero-bg.webp` from `src/assets`. Requires `sharp` (devDependency). Run `npm run optimize-images` or rely on `npm run build` (which runs it).

## 3. JavaScript & Third Parties

- **GTM:** Deferred as above; no Partytown (would require more infra).
- **Framer Motion:** Only used in Hero and ProductCard; routes (including Home) are lazy-loaded so framer is in chunked JS, not the initial bundle.
- **Home:** Already lazy in `App.jsx`, so Hero + framer load with the home route.

## 4. Accessibility (Contrast)

- **WCAG AA:** `.btn-outline-contrast` for outline buttons on light (`bg-secondary`) backgrounds: primary (black) text and border, hover to black fill and cream text.
- **Usage:** Home “Shop now”, NotFound “Shop”, ErrorBoundary “Go to home”, CartSidebar “Continue shopping”, Shop “Clear filters”, and all product/place links on the Home “Browse the collection” section use `text-primary` (or `btn-outline-contrast`) so contrast passes.

## 5. Image Dimensions

- All key images have explicit `width` and `height`: Hero, Footer logo, Navbar logo, OrderTracking logo, Checkout avatar, ProductCard (400×400) to avoid layout shift.

## Commands

- `npm run optimize-images` — generate WebP assets (optional; build runs it).
- `npm run build` — runs sitemap, product feed, image optimization, then Vite build.

## Re-testing

After deploy, run [PageSpeed Insights](https://pagespeed.web.dev/) (mobile and desktop) and check Performance, Accessibility, and “Improve image delivery” / “Reduce unused JavaScript” if further gains are needed.
