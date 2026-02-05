/**
 * SEO utilities — JSON-LD schema injection and meta helpers
 * Compatible with Netlify and South African ecommerce
 */

const BASE_URL = import.meta.env.VITE_APP_URL || 'https://alameencaps.netlify.app';

export function getBaseUrl() {
  return BASE_URL.replace(/\/$/, '');
}

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
export function getProductSchema(product, shippingCostZar = 99) {
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
 * LocalBusiness schema for homepage (South Africa)
 * Update NAP when address/phone are available
 */
export function getLocalBusinessSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'Al-Ameen Caps',
    description: 'Premium handcrafted Islamic headwear. Kufi caps, Azhari caps, Na\'lain caps, Syrian Shami, Fez, and more. South Africa.',
    url: getBaseUrl(),
    image: `${getBaseUrl()}/favicon.png`,
    priceRange: 'R',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'ZA',
    },
    // Add when available: telephone: '+27 XX XXX XXXX', address.streetAddress, etc.
  };
}

/**
 * WebSite schema for homepage
 */
export function getWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Al-Ameen Caps',
    url: getBaseUrl(),
    description: 'Premium handcrafted Islamic headwear. Restoring the Crown of the Believer. Spirituality meets luxury.',
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
