/**
 * SEO utilities — JSON-LD schema injection and meta helpers
 * Target: first-page Google for Islamic fashion, kufi, fez, taj, Cape Town, South Africa, Ramadaan, Eid, Sufi
 */

const BASE_URL = import.meta.env.VITE_SITE_URL || import.meta.env.VITE_APP_URL || 'https://al-ameen-caps.netlify.app';

export function getBaseUrl() {
  return BASE_URL.replace(/\/$/, '');
}

/** Comma-separated meta keywords for key pages (Islamic fashion, location, occasions, Sufi) */
export const SEO_KEYWORDS =
  'Islamic fashion, fez, kufi, kufiyah, taj, Ashrafi, turban, salaah cap, South Africa, Cape Town, Durban, Johannesburg, PE, Port Elizabeth, Northern suburbs, Southern suburbs, Winelands, Mitchells Plain, Gatesville, Rylands, Athlone, Goodwood, Kensington, Maitland, Salt River, Woodstock, Bo-Kaap, Tableview, Bellville, Durbanville, online shop, Ramadaan, Eid, quality kufi, best price, Rumal, perfume, Al Hasan, Naqshbandi, Qadri, Chishti, Shadhili, Ba Alawiya, Sufi fashion, Sufi clothing, Nalain cap, Azhari cap, Muslim headwear, prayer cap, Servants creation, top boutique';

/** Areas for LocalBusiness areaServed (Cape Town, major cities, suburbs, regions) */
const AREAS_SERVED = [
  'South Africa',
  'Cape Town',
  'Durban',
  'Johannesburg',
  'Port Elizabeth',
  'Northern suburbs',
  'Southern suburbs',
  'Winelands',
  'Mitchells Plain',
  'Gatesville',
  'Rylands',
  'Athlone',
  'Goodwood',
  'Kensington',
  'Maitland',
  'Salt River',
  'Woodstock',
  'Bo-Kaap',
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
 * Product schema for product pages (ZAR, South Africa)
 */
const DEFAULT_DELIVERY_FEE = Number(import.meta.env.VITE_DELIVERY_FEE) || 99;

export function getProductSchema(product, shippingCostZar = DEFAULT_DELIVERY_FEE) {
  const url = `${getBaseUrl()}/product/${product.id}`;
  const imageUrl = product.imageURL?.startsWith('http')
    ? product.imageURL
    : `${getBaseUrl()}${product.imageURL || ''}`;

  const price = Number(product.price) || 0;
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
    },
    offers: {
      '@type': 'Offer',
      url,
      priceCurrency: 'ZAR',
      price: price > 0 ? price.toFixed(2) : undefined,
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
 * LocalBusiness schema for homepage (South Africa, Cape Town areas)
 * Helps local search for Cape Town, Mitchells Plain, Gatesville, Rylands, Athlone, Goodwood
 */
export function getLocalBusinessSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'Al-Ameen Caps',
    description: 'Premium Islamic fashion and handcrafted headwear: kufi, fez, taj, turban, Rumal, salaah cap. Cape Town, Durban, Johannesburg, PE. Northern and Southern suburbs, Winelands, Bo-Kaap, Tableview, Bellville, Durbanville. Top boutique. South Africa online shop.',
    url: getBaseUrl(),
    image: `${getBaseUrl()}/favicon.png`,
    priceRange: 'R',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'ZA',
      addressRegion: 'Western Cape',
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
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${getBaseUrl()}/shop?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}
