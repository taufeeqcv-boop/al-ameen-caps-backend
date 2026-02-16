/**
 * SEO utilities — JSON-LD schema injection and meta helpers
 * Target: first-page Google for Islamic fashion, kufi, fez, taj, Cape Town, South Africa, Ramadaan, Eid, Sufi
 */

const BASE_URL = import.meta.env.VITE_SITE_URL || import.meta.env.VITE_APP_URL || 'https://www.alameencaps.com';

export function getBaseUrl() {
  return BASE_URL.replace(/\/$/, '');
}

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
  const base = getBaseUrl();
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
  const base = getBaseUrl();
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
  const base = getBaseUrl();
  const url = `${base}/product/${product.id}`;
  const rawImg = product.imageURL || '';
  const imageUrl = rawImg.startsWith('http') ? rawImg : rawImg ? `${base}${rawImg.startsWith('/') ? '' : '/'}${rawImg}` : '';

  const price = Number(product.price) || 0;
  const hasReviews = product.reviewCount > 0 || (product.aggregateRating && product.aggregateRating.reviewCount > 0);
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: (product.description || '').replace(/\n/g, ' ').slice(0, 300),
    image: imageUrl,
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
    ...(hasReviews && product.aggregateRating
      ? { aggregateRating: product.aggregateRating }
      : {}),
    review: product.reviews && product.reviews.length > 0 ? product.reviews : [],
  };
}

/**
 * Breadcrumb schema for product and shop
 */
export function getBreadcrumbSchema(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url ? `${getBaseUrl()}${item.url}` : undefined,
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
  const base = getBaseUrl();
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
  const base = getBaseUrl();
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'Al-Ameen Caps',
    description: 'Premium Islamic fashion and handcrafted headwear: kufi, fez, taj, turban, Rumal, salaah cap. Cape Town, Durban, Johannesburg, PE. Northern and Southern suburbs, Winelands, Bo-Kaap, Tableview, Bellville, Durbanville. Top boutique. South Africa online shop.',
    url: base,
    image: `${base}/collection/nalain-cap.png`,
    priceRange: 'R',
    sameAs: [FACEBOOK_URL],
    founder: getLeadCuratorPersonForOrg(),
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'ZA',
      addressRegion: 'Western Cape',
      addressLocality: 'Cape Town',
    },
    areaServed: AREAS_SERVED.map((name) =>
      name === 'South Africa'
        ? { '@type': 'Country', name: 'South Africa' }
        : { '@type': 'Place', name }
    ),
  };
}

/**
 * WebSite schema for homepage (keywords for Islamic fashion, kufi, fez, Cape Town)
 */
export function getWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Al-Ameen Caps',
    url: getBaseUrl(),
    description: 'Islamic fashion and Sufi clothing: kufi, fez, taj, turban, Rumal, Al Hasan perfume. Cape Town, Durban, Johannesburg, PE. Northern and Southern suburbs, Winelands, Bo-Kaap, Tableview, Bellville. Top boutique. South Africa.',
  };
}

/**
 * Article schema for Heritage (History of Cape Islamic Headwear) page. Links to brand/authority for E-E-A-T.
 */
export function getHeritageArticleSchema() {
  const base = getBaseUrl();
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
  const base = getBaseUrl();
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
