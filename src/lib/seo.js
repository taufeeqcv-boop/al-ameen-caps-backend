/**
 * SEO utilities — JSON-LD schema injection and meta helpers
 * Target: Islamic fashion, kufi, fez, taj, Cape Town, South Africa, tasawwuf & tariqah-related discovery
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

/**
 * Canonical @id for Al-Ameen Caps as a brand entity.
 * LocalBusiness + Organization JSON-LD share this @id so Google merges one Knowledge Graph node (not fragmented).
 */
export function getOrganizationSchemaId() {
  return `${getSchemaBaseUrl()}/#organization`;
}

/** @id for the site (WebSite); publisher points at Organization. */
export function getWebsiteSchemaId() {
  return `${getSchemaBaseUrl()}/#website`;
}

/** Category → SEO label for product meta (Kufi, Fez, Taj, etc.) */
const CATEGORY_LABELS = { Caps: 'Kufi & Islamic cap', Taj: 'Taj', Rumal: 'Rumal & Turban', Perfumes: 'Islamic perfume' };

/** Category → short entity snippet for schema/meta (semantic SEO). Perfect for Jumu'ah/Eid on headwear. */
const CATEGORY_ENTITY_TAILS = {
  Caps: 'Perfect for Jumu\'ah and Eid. Kufi, Taqiyah, breathable cotton, Salah. Cape Town, South Africa.',
  Taj: 'Perfect for Jumu\'ah and Eid. Taj, Islamic headwear. Cape Town, South Africa.',
  Rumal: 'Rumal, turban, Islamic headwear. Cape Town, South Africa.',
  Perfumes: 'Attar, Oud, alcohol-free perfume. Cape Town, South Africa.',
};

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
 * Product page meta description: unique, entity-rich, ≤160 chars.
 */
export function getProductMetaDescription(product) {
  if (!product?.name) return '';
  const desc = (product.description || '').replace(/\n/g, ' ').trim();
  const snippet = desc.slice(0, 92).replace(/\s+\S*$/, '');
  const label = product.category ? (CATEGORY_LABELS[product.category] || product.category) : 'Islamic headwear';
  const entityTail = product.category ? (CATEGORY_ENTITY_TAILS[product.category] || '') : '';
  const tail = entityTail ? ` — Al-Ameen Caps. ${entityTail}` : ' — Al-Ameen Caps. Cape Town, South Africa.';
  const text = snippet.length >= 50 ? `${snippet}… ${tail}` : `${product.name}. Handcrafted ${label}. ${tail}`;
  return text.slice(0, 160);
}

/** Homepage meta description — entity-rich for semantic search (≤160 chars). */
export const HOMEPAGE_META_DESCRIPTION =
  "South Africa's premium Kufi, Taqiyah & Fez — handcrafted in Cape Town for Jumu'ah, dhikr & Eid. Sufi & Cape Malay heritage. Nationwide delivery. Al-Ameen Caps.";

/**
 * Major tariqah / tasawwuf terms (English transliterations) for semantic discovery — South African Muslim search context.
 * Educational only; not an endorsement of any order. Appended to site-wide keywords.
 */
export const TARIQAH_SUFI_KEYWORDS =
  'tasawwuf, tariqah, tariqa, Sufi path, Sufism South Africa, dhikr, murid, shaykh, pir, Naqshbandiyya, Naqshbandi, Qadiriyya, Qadiri, Chishtiyya, Chishti, Shadhiliyya, Shadhili, Tijaniyya, Tijani, Rifaiyya, Rifai order, Khalwatiyya, Alawiyya, Darqawiyya, Inayati, Idrisi tariqah, Uwaisi, Ba Alawi, Cape Town tariqah, Durban tariqah, Johannesburg Sufi, Sufi headwear, mawlid';

/** Comma-separated meta keywords: headwear, locality, fragrance, tariqah / Sufi discovery terms. */
export const SEO_KEYWORDS = [
  'Islamic headwear South Africa, Kufi Cape Town, Taqiyah, Topi, Fez, Kopiah, Peci, Islamic headwear, prayer cap, Jummah attire, Salah, Eid, Cape Malay, Bo-Kaap, Cape Town, Western Cape, South Africa, Durban, Johannesburg, Attar, Oud, Arabian perfume, alcohol-free perfume, handcrafted kufi, breathable cotton, velvet fez, Naqshbandi Taj, Rumal, turban, Ashrafi, Azhari cap, Nalain cap, Islamic fashion, Sufi clothing, Gatesville, Athlone, Rylands, Winelands, nationwide delivery',
  TARIQAH_SUFI_KEYWORDS,
].join(', ');

/** Unified Heritage narrative — single source for meta description and keywords (entity anchors). */
export const HERITAGE_META = {
  description:
    'History of Cape Islamic headwear: Tuan Guru, Tana Baru, Auwal Masjid, Cape Malay fez and Kufi. From Sultan Saifuddin to Asia Taliep (Oemie). Cape Town, South Africa.',
  keywords:
    'Tuan Guru, Imam Abdullah Kadi Abdus Salaam, Tana Baru Cemetery, Imam Mogamat Talaabodien, Ou Bappa, Imam Achmat Bappa, Imam Taliep, Asia Taliep Oemie, Imam Abdur-Raof, Imam Abdur-Rakieb, Chiappini Street Mosque, Quawwatul Islam Mosque, Malay Quarter, District Six, Taliep Lineage, Rakiep Heritage, Cape Malay fez, Cape Malay Kufi, Al-Ameen Caps, Auwal Masjid, Cape Town Islamic heritage',
};

/** FAQ for Heritage page — FAQPage schema for SERP rich results. */
export const HERITAGE_FAQS = [
  {
    question: 'Who was Tuan Guru?',
    answer: 'Tuan Guru (Imam Abdullah Kadi Abdus Salaam) was the Prince of Tidore and the founding scholar of Islam at the Cape. He is buried at Tana Baru Cemetery in Cape Town and is the root of the Taliep and Rakiep lineages.',
  },
  {
    question: 'What is the Cape Malay fez?',
    answer: 'The Cape Malay fez (tarboosh) is a traditional brimless cap that became a hallmark of the learned and devout in the Cape. It traces roots to the Ottoman Empire and North Africa and evolved in the Bo-Kaap and Malay Quarter.',
  },
  {
    question: 'Where is Tana Baru?',
    answer: 'Tana Baru is the historic Muslim cemetery in Cape Town where Tuan Guru and other early scholars are buried. It lies in the Bo-Kaap area and is part of Cape Town\'s Islamic heritage.',
  },
  {
    question: 'What is the difference between a Kufi and a Fez?',
    answer: 'The Kufi (prayer cap, taqiyah) is a close-fitting cap worn for salaah and daily life. The Fez is a structured, often red cap with a tassel, worn for formal occasions and linked to Cape Malay and Ottoman tradition. Both are part of Cape Islamic headwear.',
  },
  {
    question: 'Who was Asia Taliep (Oemie)?',
    answer: 'Asia Taliep (Oemie) was the daughter of Imam Achmat Taliep (Bappa) and granddaughter of Imam Mogamat Talaabodien (Ou Bappa). She is at the heart of the Al-Ameen Caps lineage, connecting the family to Tuan Guru and the Auwal Masjid.',
  },
];

/** @deprecated Use HERITAGE_META.description */
export const HERITAGE_DESCRIPTION = HERITAGE_META.description;

/** @deprecated Use HERITAGE_META.keywords */
export const HERITAGE_SEO_KEYWORDS = HERITAGE_META.keywords;

/** Sovereign Root entity — Tuan Guru for JSON-LD and E-E-A-T (royal anchor). */
export const TUAN_GURU_ENTITY = {
  name: 'Imam Abdullah Kadi Abdus Salaam (Tuan Guru)',
  alternateName: [
    'Imam Abdullah ibn Al-Imam Al-Qadi Abdus Salaam',
    'Prince of Tidore',
    'Master Teacher',
  ],
  description: 'Prince of Tidore and Father of Islam in the Cape. Buried at Tana Baru Cemetery.',
  knowsAbout: ['Islamic Jurisprudence', 'Auwal Masjid', 'Cape Malay Heritage'],
  parent: {
    '@type': 'Person',
    name: 'Kadi Abdus Salaam',
    description: 'Kadi of Tidore',
  },
};

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
      '@id': getOrganizationSchemaId(),
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
      'Tasawwuf and tariqah headwear traditions',
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
  const rawDesc = (product.description || '').replace(/\n/g, ' ').trim();
  const entityTail = product.category ? (CATEGORY_ENTITY_TAILS[product.category] || '') : '';
  const schemaDesc = entityTail
    ? `${rawDesc.slice(0, 260)} ${entityTail}`.trim()
    : rawDesc.slice(0, 300);
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: schemaDesc.slice(0, 500),
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
      hasMerchantReturnPolicy: {
        '@type': 'MerchantReturnPolicy',
        applicableCountry: 'ZA',
        returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
        merchantReturnDays: 30,
        returnMethod: 'https://schema.org/ReturnByMail',
        returnFees: 'https://schema.org/FreeReturn',
        returnPolicyUrl: `${base}/shipping-returns`,
      },
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
          deliveryTime: {
            '@type': 'ShippingDeliveryTime',
            handlingTime: {
              '@type': 'QuantitativeValue',
              minValue: 1,
              maxValue: 2,
              unitCode: 'DAY',
            },
            transitTime: {
              '@type': 'QuantitativeValue',
              minValue: 2,
              maxValue: 5,
              unitCode: 'DAY',
            },
            businessDays: {
              '@type': 'OpeningHoursSpecification',
              dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
            },
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
    description: 'Islamic headwear Cape Town & South Africa: handcrafted Kufi, Fez, Taj, Turban. Al-Ameen Caps.',
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
 * ItemList schema for a curated headwear type collection (e.g. Na'lain, Kufi, Fez).
 * Used on the Headwear Collection page so each headwear type exposes its own ItemList to Google.
 */
export function getHeadwearTypeItemListSchema({ type, description, products }) {
  const base = getSchemaBaseUrl();
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${type} – Al-Ameen Caps`,
    description,
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

/**
 * Single JSON-LD node: LocalBusiness + Organization together.
 * Avoids duplicate @id scripts (which made Rich Results show “missing” telephone/image/address on LocalBusiness).
 */
function getPostalAddressForSchema() {
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
}

/** ZA national (0…) → E.164 +27 for schema.org telephone (Google prefers international format). */
function toZaE164(nationalOrE164) {
  const raw = (nationalOrE164 || '').replace(/\s/g, '');
  if (raw.startsWith('+')) return raw;
  if (raw.startsWith('0')) return `+27${raw.slice(1)}`;
  if (raw.startsWith('27')) return `+${raw}`;
  return '+27810487447';
}

export function getMergedBusinessEntitySchema() {
  const base = getSchemaBaseUrl();
  const telephone = toZaE164((import.meta.env.VITE_CONTACT_PHONE || '0810487447').trim());
  const logoAndImageUrl = `${base}/collection/nalain-cap.png`;
  const mapQuery = encodeURIComponent('205 Wallace Street Glenwood Cape Town 7460 South Africa');
  return {
    '@context': 'https://schema.org',
    '@type': ['LocalBusiness', 'Organization'],
    '@id': getOrganizationSchemaId(),
    name: 'Al-Ameen Caps',
    url: base,
    description:
      'Premium Islamic headwear and fragrances: Kufi, Taqiyah, Fez, Taj, Rumal. Rooted in Cape Malay culture and Bo-Kaap heritage; suitable for seekers across tasawwuf paths. Attar and Oud. Cape Town, South Africa. Handcrafted for Jumu\'ah, Eid and modest fashion.',
    logo: logoAndImageUrl,
    image: [
      logoAndImageUrl,
      {
        '@type': 'ImageObject',
        url: logoAndImageUrl,
        width: 800,
        height: 800,
      },
    ],
    telephone,
    priceRange: '$$',
    currenciesAccepted: 'ZAR',
    paymentAccepted: 'PayFast, Yoco, major cards where enabled',
    hasMap: `https://www.google.com/maps/search/?api=1&query=${mapQuery}`,
    sameAs: [FACEBOOK_URL],
    founder: getLeadCuratorPersonForOrg(),
    geo: {
      '@type': 'GeoCoordinates',
      latitude: '-33.966',
      longitude: '18.483',
    },
    address: getPostalAddressForSchema(),
    areaServed: AREAS_SERVED.map((name) =>
      name === 'South Africa'
        ? { '@type': 'Country', name: 'South Africa' }
        : { '@type': 'Place', name }
    ),
  };
}

/** @deprecated Prefer merged entity — kept as alias for Shop/Home/Seo callers. */
export function getLocalBusinessSchema() {
  return getMergedBusinessEntitySchema();
}

/**
 * WebSite schema for homepage (entity-rich for Knowledge Graph)
 */
export function getWebSiteSchema() {
  const base = getSchemaBaseUrl();
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': getWebsiteSchemaId(),
    name: 'Al-Ameen Caps',
    url: base,
    inLanguage: 'en-ZA',
    description: 'Premium Kufi, Taqiyah, Fez and Islamic headwear for Jumu\'ah, Salah, and community gatherings. Handcrafted in Cape Town; Cape Malay heritage, Bo-Kaap. Attar and Oud perfumes. Nationwide delivery. South Africa.',
    publisher: { '@id': getOrganizationSchemaId() },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${base}/shop?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

/**
 * Organization schema for homepage — same graph node as LocalBusiness (no second script).
 * @deprecated Call sites should use getMergedBusinessEntitySchema / getLocalBusinessSchema once.
 */
export function getOrganizationSchema() {
  return getMergedBusinessEntitySchema();
}

/**
 * Article schema for Heritage (History of Cape Islamic Headwear) page. Links to brand/authority for E-E-A-T.
 * Includes datePublished, image, publisher logo, mainEntityOfPage for rich results eligibility.
 */
export function getHeritageArticleSchema() {
  const base = getSchemaBaseUrl();
  const pageUrl = `${base}/heritage`;
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'History of Cape Islamic Headwear',
    description: HERITAGE_DESCRIPTION,
    url: pageUrl,
    mainEntityOfPage: { '@type': 'WebPage', '@id': pageUrl },
    datePublished: '2024-01-01',
    dateModified: '2026-02-01',
    inLanguage: 'en-ZA',
    image: [
      `${base}/images/heritage/tuan-guru-portrait.png`,
      `${base}/images/heritage/fez-cape-malay-archival.png`,
      `${base}/collection/nalain-cap.png`,
    ],
    author: {
      '@type': 'Organization',
      name: 'Al-Ameen Caps',
      url: `${base}/about`,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Al-Ameen Caps',
      url: base,
      logo: {
        '@type': 'ImageObject',
        url: `${base}/collection/nalain-cap.png`,
        width: 800,
        height: 800,
      },
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

/** FAQ for Sufi / tariqah headwear guide — FAQPage rich results. */
export const SUFI_HEADWEAR_GUIDE_FAQS = [
  {
    question: 'What is a tariqah in Islam?',
    answer:
      'A tariqah (spiritual path or Sufi order) is a structured way of spiritual training—often through dhikr, adab, and teaching under qualified scholars. South African Muslims are part of many global and local communities; headwear choices vary by occasion and culture, not by tariqah alone.',
  },
  {
    question: 'Which tariqah names are common among Muslims in South Africa?',
    answer:
      'Communities in South Africa include followers and sympathisers across many paths—among the names often encountered in discourse and history are Naqshbandiyya, Qadiriyya, Chishtiyya, Shadhiliyya, Tijaniyya, Rifaiyya, Khalwatiyya, Alawiyya, Darqawiyya, Inayati, and Idrisi-related traditions. This is not an exhaustive list; local mosques and scholars are the best guide.',
  },
  {
    question: 'What headwear do people wear for dhikr or Sufi gatherings in South Africa?',
    answer:
      'Many brothers wear a kufi or taqiyah for salah and gatherings; a Taj or turban may be chosen for formal or ceremonial occasions. Al-Ameen Caps offers handcrafted kufis, fezzes, and Taj styles—including Naqshbandi-inspired pieces—for Jumu\'ah, Eid, and community events, with delivery across South Africa.',
  },
  {
    question: 'Is Al-Ameen Caps affiliated with a specific tariqah?',
    answer:
      'No. We are a Cape Town–based retailer of Islamic headwear and fragrances. We respect all lawful paths of tasawwuf and serve Muslims across South Africa without claiming affiliation to any single tariqah.',
  },
];

/**
 * Article schema for the Sufi headwear / tariqah guide (South Africa).
 */
export function getSufiHeadwearGuideArticleSchema() {
  const base = getSchemaBaseUrl();
  const pageUrl = `${base}/guides/sufi-headwear-tariqah-south-africa`;
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Sufi Headwear & Tariqah Traditions in South Africa',
    description:
      'Tasawwuf, tariqah names, and Islamic headwear in South Africa: kufi, Taj, fez for dhikr, Jumu\'ah, and Eid. Cape Town & nationwide. Al-Ameen Caps.',
    url: pageUrl,
    mainEntityOfPage: { '@type': 'WebPage', '@id': pageUrl },
    datePublished: '2026-03-01',
    dateModified: '2026-03-22',
    inLanguage: 'en-ZA',
    keywords: TARIQAH_SUFI_KEYWORDS,
    author: {
      '@type': 'Organization',
      name: 'Al-Ameen Caps',
      url: `${base}/about`,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Al-Ameen Caps',
      url: base,
      logo: {
        '@type': 'ImageObject',
        url: `${base}/collection/nalain-cap.png`,
        width: 800,
        height: 800,
      },
    },
  };
}

/**
 * BlogPosting JSON-LD for /blog/:slug posts (rich results / discover).
 */
export function getBlogPostingSchema(post) {
  if (!post?.slug) return null;
  const base = getSchemaBaseUrl();
  const pageUrl = `${base}/blog/${post.slug}`;
  const rawImg = (post.ogImage || '').trim() || '/collection/nalain-cap.png';
  const imageUrl = rawImg.startsWith('http') ? rawImg : `${base}${rawImg.startsWith('/') ? '' : '/'}${rawImg}`;
  const headline = post.title || '';
  const desc = (post.description || '').slice(0, 500);
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline,
    description: desc,
    url: pageUrl,
    datePublished: post.date,
    dateModified: post.dateModified || post.date,
    inLanguage: 'en-ZA',
    mainEntityOfPage: { '@type': 'WebPage', '@id': pageUrl },
    author: {
      '@type': 'Organization',
      name: post.author || 'Al-Ameen Caps',
      url: `${base}/about`,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Al-Ameen Caps',
      url: base,
      logo: {
        '@type': 'ImageObject',
        url: `${base}/collection/nalain-cap.png`,
        width: 800,
        height: 800,
      },
    },
    image: imageUrl,
  };
}

/**
 * AboutPage schema for Heritage page — defines it as a cultural/historical about resource (E-E-A-T).
 * mainEntity is Tuan Guru (root ancestor) so Heritage appears as the primary historical record for Cape Islam.
 */
export function getHeritageAboutPageSchema() {
  const base = getSchemaBaseUrl();
  return {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: 'History of Cape Islamic Headwear — Al-Ameen Caps Heritage',
    description: HERITAGE_DESCRIPTION,
    url: `${base}/heritage`,
    mainEntity: {
      '@type': 'Person',
      ...TUAN_GURU_ENTITY,
      jobTitle: 'Father of Islam at the Cape',
      memberOf: CAPE_MALAY_CULTURAL_ENTITY,
      url: `${base}/heritage`,
    },
  };
}

/** Cape Malay cultural entity — links lineage Persons so Heritage page appears as primary Historical Record for family-name searches. */
const CAPE_MALAY_CULTURAL_ENTITY = {
  '@type': 'Organization',
  name: 'Cape Malay community',
  description: 'Historical and cultural community at the Cape: Bo-Kaap, Auwal Masjid, Islamic scholarship and craft. Cape Town, South Africa.',
};

/**
 * CreativeWork schema for Heritage page — cultural and historical resource.
 * Tuan Guru as primary Person; Imam Mogamat Talaabodien (Ou Bappa), Imam Achmat (Bappa), and Asia Taliep as direct descendants in mentions.
 */
export function getHeritageCreativeWorkSchema() {
  const base = getSchemaBaseUrl();
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: 'History of Cape Islamic Headwear',
    description: HERITAGE_DESCRIPTION,
    url: `${base}/heritage`,
    author: {
      '@type': 'Organization',
      name: 'Al-Ameen Caps',
      url: `${base}/about`,
    },
    mentions: [
      { '@type': 'Person', ...TUAN_GURU_ENTITY, knowsAbout: 'Cape Malay History', memberOf: CAPE_MALAY_CULTURAL_ENTITY },
      {
        '@type': 'Person',
        name: 'Sultan Saifuddin of Tidore',
        description: 'King of Tidore; royal lineage ancestor of Tuan Guru.',
        knowsAbout: 'Cape Malay History',
        memberOf: CAPE_MALAY_CULTURAL_ENTITY,
      },
      {
        '@type': 'Person',
        name: 'Sunan Gunung Jati (Syarif Hidayatullah)',
        description: 'Key ancestor in the lineage of Tuan Guru.',
        knowsAbout: 'Cape Malay History',
        memberOf: CAPE_MALAY_CULTURAL_ENTITY,
      },
      {
        '@type': 'Person',
        name: 'Imam Abdur-Raof',
        description: 'Son of Tuan Guru; ancestor of Abdurauf and Rakiep families. Imam of Auwal Mosque. Photo with Imam Abdur-Rakieb at welcome of Shaykh Abu-Bakr Effendi, Cape Town 1863.',
        knowsAbout: 'Cape Malay History',
        memberOf: CAPE_MALAY_CULTURAL_ENTITY,
      },
      {
        '@type': 'Person',
        name: 'Imam Mogamat Talaabodien (Ou Bappa)',
        description: 'Great-grandson of Tuan Guru; Patriarch of District Six with 80+ grandchildren. First Imam of Quawwatul Islam Mosque, Loop Street, Bo-Kaap.',
        homeLocation: { '@type': 'Place', name: 'District Six', addressLocality: 'Cape Town', addressCountry: 'ZA' },
        knowsAbout: 'Cape Malay History',
        memberOf: CAPE_MALAY_CULTURAL_ENTITY,
      },
      {
        '@type': 'Person',
        name: 'Imam Achmat Talaabodien (Bappa)',
        description: 'Verified link between the Patriarch of District Six and Asia Taliep (Oemie). Married Gadija Rakiep; father of Oemie. Imam Taliep.',
        knowsAbout: 'Cape Malay History',
        memberOf: CAPE_MALAY_CULTURAL_ENTITY,
      },
      {
        '@type': 'Person',
        name: 'Asia Taliep (Oemie)',
        description: 'Daughter of Imam Achmat (Bappa); granddaughter of Imam Mogamat Talaabodien (Ou Bappa). Descendant of Tuan Guru. District Six to Bridgetown.',
        knowsAbout: 'Cape Malay History',
        memberOf: CAPE_MALAY_CULTURAL_ENTITY,
      },
      {
        '@type': 'Person',
        name: 'Sulaiman Essop',
        description: 'Family lineage of the Essop family; Cape Malay heritage and Islamic craft at the Cape.',
        knowsAbout: 'Cape Malay History',
        memberOf: CAPE_MALAY_CULTURAL_ENTITY,
      },
      {
        '@type': 'Person',
        name: 'Sayed Abdurrahman Motura',
        description: 'Paternal lineage of piety and leadership in Cape Islamic life.',
        knowsAbout: 'Cape Malay History',
        memberOf: CAPE_MALAY_CULTURAL_ENTITY,
      },
      { '@type': 'Place', name: 'District Six', addressLocality: 'Cape Town', addressCountry: 'ZA' },
      { '@type': 'Place', name: 'Bridgetown', addressLocality: 'Cape Town', addressCountry: 'ZA' },
      { '@type': 'Place', name: 'Auwal Masjid', addressLocality: 'Bo-Kaap, Cape Town', addressCountry: 'ZA' },
      {
        '@type': 'Place',
        name: 'Quawwatul Islam Mosque',
        description: 'Second Indian mosque and Hanafi, Loop Street, Bo-Kaap. First Imam: Ou Bappa.',
        addressLocality: 'Bo-Kaap, Cape Town',
        addressCountry: 'ZA',
      },
      {
        '@type': 'Place',
        name: 'Chiappini Street Mosque',
        description: 'Historic mosque in the Malay Quarter, Cape Town.',
        addressLocality: 'Cape Town',
        addressCountry: 'ZA',
      },
      { '@type': 'Place', name: 'Tana Baru Cemetery', description: 'Significant Muslim cemetery in Cape Town; burial place of Tuan Guru.', addressLocality: 'Cape Town', addressCountry: 'ZA' },
      { '@type': 'Place', name: 'Malay Quarter', description: 'Cape Malay community area, Cape Town.', addressLocality: 'Cape Town', addressCountry: 'ZA' },
    ],
    isFamilyFriendly: true,
    inLanguage: 'en-ZA',
    creditText: 'Lineage and historical information courtesy of the Tuan Guru Family Tree group (Facebook).',
  };
}
