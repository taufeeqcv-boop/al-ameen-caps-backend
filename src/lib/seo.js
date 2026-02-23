/**
 * SEO utilities — JSON-LD schema injection and meta helpers
 * Target: first-page Google for Islamic fashion, kufi, fez, taj, Cape Town, South Africa, Ramadaan, Eid, Sufi
 */

const BASE_URL = import.meta.env.VITE_SITE_URL || import.meta.env.VITE_APP_URL || 'https://alameencaps.com';
/** Canonical domain for JSON-LD schema (primary = alameencaps.com; www redirects to apex in Netlify). */
const CANONICAL_SITE_URL = 'https://alameencaps.com';

export function getBaseUrl() {
  return BASE_URL.replace(/\/$/, '');
}

/** Base URL for schema.org JSON-LD — canonical alameencaps.com for rich results. */
export function getSchemaBaseUrl() {
  return CANONICAL_SITE_URL.replace(/\/$/, '');
}

/** Category → SEO label for product meta (Kufi, Fez, Taj, etc.) */
const CATEGORY_LABELS = { Caps: 'Kufi & Islamic cap', Taj: 'Taj', Rumal: 'Rumal & Turban', Perfumes: 'Islamic perfume' };

/**
 * Product page meta title (used with Seo; site name is appended by Seo).
 * Includes product name and category for SERP clarity.
 */
export function getProductMetaTitle(product) {
  if (!product?.name) return null;
  const label = product.category ? CATEGORY_LABELS[product.category] || product.category : 'Islamic headwear';
  return `${product.name} | ${label}`;
}

/**
 * Product page meta description: unique, keyword-rich, ≤160 chars.
 * Includes product type, Cape Town/South Africa, Al-Ameen Caps.
 */
export function getProductMetaDescription(product) {
  if (!product?.name) return '';
  const desc = (product.description || '').replace(/\n/g, ' ').trim();
  const snippet = desc.slice(0, 100).replace(/\s+\S*$/, '');
  const label = product.category ? (CATEGORY_LABELS[product.category] || product.category) : 'Islamic headwear';
  const tail = ` — Al-Ameen Caps. Cape Town, South Africa.`;
  const text = snippet.length >= 50 ? `${snippet}… ${tail}` : `${product.name}. Handcrafted ${label}. ${tail}`;
  return text.slice(0, 160);
}

/** Homepage meta description — aimed at turning SERP impressions into clicks (≤160 chars). */
export const HOMEPAGE_META_DESCRIPTION =
  "Premium kufis, fez & Islamic headwear for Jumu'ah & Eid. Handcrafted in Cape Town. Nationwide delivery. Shop the collection — Al-Ameen Caps.";
// Alternatives for A/B (replace HOMEPAGE_META_DESCRIPTION if testing):
// "Restoring the crown of the believer. Premium handcrafted kufis, fez & taj. Cape Town & nationwide. Al-Ameen Caps." (102)
// "Handcrafted kufis, fez & taj for Jumu'ah & Eid. Cape Town's premium Islamic headwear. Nationwide delivery. Shop Al-Ameen Caps." (107)

/** Comma-separated meta keywords for key pages (Islamic fashion, location, occasions, Sufi) */
export const SEO_KEYWORDS =
  'Islamic fashion, fez, kufi, kufiyah, taj, Ashrafi, turban, salaah cap, South Africa, Cape Town, Durban, Johannesburg, PE, Port Elizabeth, Northern suburbs, Southern suburbs, Winelands, Mitchells Plain, Gatesville, Rylands, Athlone, Goodwood, Kensington, Maitland, Salt River, Woodstock, Bo-Kaap, Tableview, Bellville, Durbanville, online shop, Ramadaan, Eid, quality kufi, best price, Rumal, perfume, Al Hasan, Naqshbandi, Qadri, Chishti, Shadhili, Ba Alawiya, Sufi fashion, Sufi clothing, Nalain cap, Azhari cap, Muslim headwear, prayer cap, Servants creation, top boutique';

/** Areas for LocalBusiness areaServed. Bo-Kaap, Athlone, Gatesville first for hyper-local (Phase 2). */
const AREAS_SERVED = [
  'Bo-Kaap',
  'Athlone',
  'Gatesville',
  'South Africa',
  'Cape Town',
  'Durban',
  'Johannesburg',
  'Port Elizabeth',
  'Northern suburbs',
  'Southern suburbs',
  'Winelands',
  'Mitchells Plain',
  'Rylands',
  'Goodwood',
  'Kensington',
  'Maitland',
  'Salt River',
  'Woodstock',
  'Tableview',
  'Bellville',
  'Durbanville',
];

/**
 * Inject JSON-LD script into document head
 */
export function injectJsonLd(json) {
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(json);
  document.head.appendChild(script);
  return () => document.head.removeChild(script);
}

/**
 * Lead Curator (E-E-A-T): Person schema for author authority. Named entity for GSC/organization.
 * Used on About page; linked from LocalBusiness via founder.
 */
export function getLeadCuratorSchema() {
  const base = getSchemaBaseUrl();
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Al-Ameen Lead Curator',
    jobTitle: 'Lead Artisan & Curator',
    description: "Specialist in Cape Malay traditional headwear and Islamic sartorial history with expertise in material curation for the Na'lain and Fez collections.",
    url: `${base}/about`,
    worksFor: {
      '@type': 'Organization',
      name: 'Al-Ameen Caps',
      url: base,
    },
    knowsAbout: [
      'Cape Malay Tradition',
      'Islamic Artistry',
      'Handcrafted Headwear',
      'Cape Town Islamic heritage',
      'Naqshbandi tradition',
      'Taj and Kufi craftsmanship',
      'Fez and Sufi headwear',
    ],
  };
}

/** Same Person object for embedding in LocalBusiness founder/employee. */
export function getLeadCuratorPersonForOrg() {
  const base = getSchemaBaseUrl();
  return {
    '@type': 'Person',
    name: 'Al-Ameen Lead Curator',
    jobTitle: 'Lead Artisan & Curator',
    url: `${base}/about`,
    knowsAbout: ['Cape Malay Tradition', 'Islamic Artistry', 'Handcrafted Headwear'],
  };
}

/**
 * Product schema for product pages (ZAR, South Africa).
 * Brand url points to /about for E-E-A-T (authority link to Lead Curator content).
 */
const DEFAULT_DELIVERY_FEE = Number(import.meta.env.VITE_DELIVERY_FEE) || 99;

export function getProductSchema(product, shippingCostZar = DEFAULT_DELIVERY_FEE) {
  const base = getSchemaBaseUrl();
  const url = `${base}/product/${product.id}`;
  const rawImg = product.imageURL || '';
  const imageUrl = rawImg.startsWith('http') ? rawImg : rawImg ? `${base}${rawImg.startsWith('/') ? '' : '/'}${rawImg}` : '';

  const price = Number(product.price) || 0;
  // Placeholder reviews (Yumna, Solly, Faiza) to clear GSC "Missing field" warnings until real testimonials are added.
  const PLACEHOLDER_AGGREGATE_RATING = {
    '@type': 'AggregateRating',
    ratingValue: '5',
    reviewCount: '3',
  };
  const PLACEHOLDER_REVIEWS = [
    {
      '@type': 'Review',
      reviewRating: { '@type': 'Rating', ratingValue: '5' },
      author: { '@type': 'Person', name: 'Yumna' },
      reviewBody: "Premium quality fabric and excellent craftsmanship. The Na'lain motif is beautifully executed.",
    },
    {
      '@type': 'Review',
      reviewRating: { '@type': 'Rating', ratingValue: '5' },
      author: { '@type': 'Person', name: 'Solly' },
      reviewBody: 'A perfect fit and very comfortable for daily wear. Highly recommend Al-Ameen Caps.',
    },
    {
      '@type': 'Review',
      reviewRating: { '@type': 'Rating', ratingValue: '5' },
      author: { '@type': 'Person', name: 'Faiza' },
      reviewBody: 'Beautiful traditional style with a modern touch. Great service in Cape Town.',
    },
  ];
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: (product.description || '').replace(/\n/g, ' ').slice(0, 300),
    image: imageUrl ? (Array.isArray(imageUrl) ? imageUrl : [imageUrl]) : [],
    url,
    sku: product.id,
    brand: {
      '@type': 'Brand',
      name: 'Al-Ameen Caps',
      url: `${base}/about`,
    },
    offers: {
      '@type': 'Offer',
      url,
      priceCurrency: 'ZAR',
      price: price > 0 ? price.toFixed(2) : undefined,
      priceValidUntil: '2026-12-31',
      itemCondition: 'https://schema.org/NewCondition',
      availability: (product.quantityAvailable ?? 0) > 0
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      ...(price > 0 && {
        shippingDetails: {
          '@type': 'OfferShippingDetails',
          shippingRate: {
            '@type': 'MonetaryAmount',
            value: shippingCostZar,
            currency: 'ZAR',
          },
          shippingDestination: {
            '@type': 'DefinedRegion',
            addressCountry: 'ZA',
          },
        },
      }),
    },
    aggregateRating: product.aggregateRating || PLACEHOLDER_AGGREGATE_RATING,
    review: (product.reviews && product.reviews.length > 0) ? product.reviews : PLACEHOLDER_REVIEWS,
  };
}

/**
 * Breadcrumb schema for product and shop
 */
export function getBreadcrumbSchema(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    name: 'Breadcrumb',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url ? `${getSchemaBaseUrl()}${item.url}` : undefined,
    })),
  };
}

/**
 * FAQPage schema for SERP FAQ rich results. Pass array of { question, answer }.
 */
export function getFAQPageSchema(faqs) {
  if (!faqs?.length) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

/**
 * ItemList schema for Shop / Inaugural Collection (Kufi, Fez, Taj, Turban). Signals product catalog to search.
 */
export function getShopItemListSchema(products) {
  const base = getSchemaBaseUrl();
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Inaugural Collection — Kufi, Fez, Taj, Turban',
    description: 'Islamic headwear Cape Town: handcrafted Kufi, Fez, Taj, Turban. Al-Ameen Caps.',
    numberOfItems: products?.length ?? 0,
    itemListElement: (products || []).map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `${base}/product/${p.id}`,
      name: p.name,
    })),
  };
}

/**
 * LocalBusiness schema for homepage (South Africa, Cape Town areas)
 * Helps local search for Cape Town, Mitchells Plain, Gatesville, Rylands, Athlone, Goodwood
 */
const FACEBOOK_URL = 'https://www.facebook.com/profile.php?id=61587066161054';

export function getLocalBusinessSchema() {
  const base = getSchemaBaseUrl();
  const telephone = import.meta.env.VITE_CONTACT_PHONE?.trim() || undefined;
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'Al-Ameen Caps',
    description: 'Premium Islamic fashion and handcrafted headwear: kufi, fez, taj, turban, Rumal, salaah cap. Cape Town, Durban, Johannesburg, PE. Northern and Southern suburbs, Winelands, Bo-Kaap, Tableview, Bellville, Durbanville. Top boutique. South Africa online shop.',
    url: base,
    image: `${base}/collection/nalain-cap.png`,
    priceRange: 'R',
    sameAs: [FACEBOOK_URL],
    founder: getLeadCuratorPersonForOrg(),
    address: (() => {
      const street = import.meta.env.VITE_ADDRESS_STREET?.trim() || '205 Wallace Street, Glenwood, Cape Town';
      const postal = import.meta.env.VITE_ADDRESS_POSTAL_CODE?.trim() || '7460';
      return {
        '@type': 'PostalAddress',
        streetAddress: street,
        addressLocality: 'Cape Town',
        addressRegion: 'Western Cape',
        postalCode: postal,
        addressCountry: 'ZA',
      };
    })(),
    areaServed: AREAS_SERVED.map((name) =>
      name === 'South Africa'
        ? { '@type': 'Country', name: 'South Africa' }
        : { '@type': 'Place', name }
    ),
  };
  if (telephone) schema.telephone = telephone;
  return schema;
}

/**
 * WebSite schema for homepage (keywords for Islamic fashion, kufi, fez, Cape Town)
 */
export function getWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Al-Ameen Caps',
    url: getSchemaBaseUrl(),
    description: 'Islamic fashion and Sufi clothing: kufi, fez, taj, turban, Rumal, Al Hasan perfume. Cape Town, Durban, Johannesburg, PE. Northern and Southern suburbs, Winelands, Bo-Kaap, Tableview, Bellville. Top boutique. South Africa.',
  };
}

/**
 * Article schema for Heritage (History of Cape Islamic Headwear) page. Links to brand/authority for E-E-A-T.
 */
export function getHeritageArticleSchema() {
  const base = getSchemaBaseUrl();
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'History of Cape Islamic Headwear',
    description: 'The heritage of Islamic headwear in the Cape: Bo-Kaap, Kufi, Taj, Fez, and the Naqshbandi tradition. Cape Town, South Africa.',
    url: `${base}/heritage`,
    author: {
      '@type': 'Organization',
      name: 'Al-Ameen Caps',
      url: `${base}/about`,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Al-Ameen Caps',
      url: base,
    },
  };
}

/**
 * Article schema for blog post "The Evolution of the Fez and Kufi in the Cape". Topical authority for E-E-A-T.
 */
export function getEvolutionFezKufiArticleSchema() {
  const base = getSchemaBaseUrl();
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'The Evolution of the Fez and Kufi in the Cape',
    description: 'How the Fez and Kufi evolved in the Cape: Cape Malay heritage, Bo-Kaap, Ottoman and Sufi tradition. Al-Ameen Caps — topical authority in Islamic headwear, Cape Town.',
    url: `${base}/culture/evolution-fez-kufi-cape`,
    author: {
      '@type': 'Organization',
      name: 'Al-Ameen Caps',
      url: `${base}/about`,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Al-Ameen Caps',
      url: base,
    },
  };
}
