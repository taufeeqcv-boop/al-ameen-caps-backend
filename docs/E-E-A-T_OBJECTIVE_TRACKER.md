# E-E-A-T & Author Authority — Objective Tracker

Al-Ameen Caps: building authority without exposing suppliers. Lead Curator is the designated brand expert.

| Objective | Task | Status |
|-----------|------|--------|
| **E-E-A-T** | Designate a "Lead Curator" as the Brand Expert | [x] |
| **E-E-A-T** | Document the "Artisanal Process" (not the supplier) | [x] |
| **Content** | Create a "History of Cape Islamic Headwear" page | [x] |
| **Technical** | Link this content to Product Schemas | [x] |

## Where it lives

- **Lead Curator (Person schema):** [src/lib/seo.js](src/lib/seo.js) — `getLeadCuratorSchema()`. Injected on the About page via [src/components/Seo.jsx](src/components/Seo.jsx) when `leadCurator` is true.
- **About the Artisan + Artisanal Process:** [src/pages/About.jsx](src/pages/About.jsx) — sections "About the Artisan" and "Our Artisanal Process". No supplier names; process only.
- **History of Cape Islamic Headwear:** [src/pages/Heritage.jsx](src/pages/Heritage.jsx) at `/heritage`. Article schema in [src/lib/seo.js](src/lib/seo.js) — `getHeritageArticleSchema()`, author links to `/about`.
- **Product → authority link:** Product schema in [src/lib/seo.js](src/lib/seo.js) — `brand.url` set to `/about` so every product page signals the brand’s authority page to AI/search agents.
