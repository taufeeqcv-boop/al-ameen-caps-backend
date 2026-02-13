# Comprehensive SEO & Technical Implementation Strategy
## Al-Ameen Caps — South African Ecommerce Market

*Last updated: 2026*

---

## 1. Executive Summary

To achieve top-three ranking on Google South Africa in the Islamic headwear niche, Al-Ameen Caps must combine:
- **Technical excellence**: Fast load times, JSON-LD schema, Netlify prerendering
- **Semantic authority**: Dialect-aware keywords, structured taxonomy
- **Local trust**: POPIA compliance, NAP citations, ZAR pricing

---

## 2. Competitive Intelligence

| Competitor | SEO Focal Point | Primary Content Strategy |
|------------|-----------------|--------------------------|
| SUHAYLA | Trust & Authenticity | Scholar-backed, family & gifting |
| Anaqah | Fabric-centric Taxonomy | Texture sub-categories, hijabs |
| Al-Shazia | Volume & Speed | Large inventory, general modest wear |
| Amaani | Luxury & Gifting | Bespoke packaging, occasion wear |
| MuslimMall | Global Diversity | Kufi styles, accessories |

**Al-Ameen differentiation**: Definitive authority on men's headwear — Azhari cap, Na'lain Pak kufi, Syrian Shami, Fez — with deep cultural and religious nuance.

---

## 3. Semantic Keyword Taxonomy (SA Market)

| Product Type | Local Terms | Target Audience | Primary SEO Keywords |
|--------------|-------------|-----------------|----------------------|
| Azhari Cap | Scholar hat, Hard cap | Imams, Scholars | Azhari hard cap South Africa, Qari imamah |
| Kufi | Toppie, Topi | General Muslim | Namaz cap, Kufi hat, Islamic cap |
| Na'lain Cap | Nalayn hat | Spiritual seekers | Nalayn embroidered cap, Prophet sandal symbol |
| Syrian Shami | Shami Imam hat | Traditionalists | Syrian Shami imam hat, Turkish sarik |
| Fez / Rumi | Rumi hat, Tarboush | Cape Malay, Sufi | Ottoman Fez, Tarboush, Black Rumi hat |

---

## 4. Technical Architecture

### 4.1 Stack (Current)

- **Framework**: React 19 + Vite 7
- **Hosting**: Netlify
- **SPA**: Client-side routing (React Router)

### 4.2 Netlify Prerendering (Critical — ACTION REQUIRED)

**Legacy prerendering is deprecated.** Use the **Netlify Prerender extension**:

1. Netlify Dashboard → Your site → Extensions
2. Search for **Prerender** (or similar prerendering extension)
3. Enable and configure for crawlers (Googlebot, Facebook, WhatsApp, etc.)

This ensures crawlers and social bots receive pre-rendered HTML with meta tags and JSON-LD instead of an empty SPA shell. Product links shared in WhatsApp/Facebook will show rich previews with image and price.

### 4.3 JSON-LD Schema

- **Product** (each product page): name, image, description, brand, offers (ZAR, shipping)
- **LocalBusiness** (homepage): NAP, +27 number, address
- **BreadcrumbList** (product/shop): hierarchy for SERP breadcrumbs
- **WebSite**: search action (optional)

---

## 5. Implementation Checklist

- [x] JSON-LD Product schema on product pages
- [x] JSON-LD LocalBusiness on homepage/index
- [x] BreadcrumbList schema
- [x] Enhanced meta tags (title, description, Open Graph, Twitter)
- [x] `netlify.toml` (build, headers)
- [x] `robots.txt` and `sitemap.xml`
- [ ] Netlify Prerender extension (enable in dashboard)
- [ ] Image optimization (AVIF/WebP) — future
- [ ] SSR/SSG (Vite middleware) — future if needed
- [ ] POPIA-compliant privacy policy copy review
- [ ] Local directory citations (Google Business, YellowPages, etc.)

---

## 6. Environment Variables for SEO

| Variable | Purpose |
|----------|---------|
| `VITE_SITE_URL` | Canonical base URL (e.g. https://alameencaps.co.za) |
| `VITE_SITE_NAME` | Al-Ameen Caps |
| `VITE_SITE_DESCRIPTION` | Default meta description |

---

## 7. Local SEO & Trust (POPIA)

- Privacy policy accessible (footer)
- South African contact (+27) when available
- Physical address for LocalBusiness schema when available
- Terms of sale, shipping info clearly linked

---

## 8. Performance Targets

- **LCP**: < 2.5s
- **CLS**: < 0.1
- **INP**: < 200ms
- **Image target**: < 150 KB per page (WebP/AVIF when implemented)

---

*For detailed competitor analysis, AEO strategy, and image optimization pipeline, refer to the full strategy document.*
