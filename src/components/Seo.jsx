/**
 * SEO — Dynamic meta tags and JSON-LD for each page
 * Compatible with Netlify prerendering (bots receive correct meta/schema)
 */

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  injectJsonLd,
  getProductSchema,
  getBreadcrumbSchema,
  getLeadCuratorSchema,
  getHeritageArticleSchema,
  getEvolutionFezKufiArticleSchema,
  getHeritageAboutPageSchema,
  getHeritageCreativeWorkSchema,
  getShopItemListSchema,
  getLocalBusinessSchema,
  getFAQPageSchema,
  getBlogPostingSchema,
  getBaseUrl,
  SEO_KEYWORDS,
} from '../lib/seo';

const BASE_URL = getBaseUrl();
// Canonical domain - always use alameencaps.com (not www) for SEO consistency
const CANONICAL_DOMAIN = 'https://alameencaps.com';
const SITE_NAME = 'Al-Ameen Caps';
const DEFAULT_TITLE = 'Kufi, Fez, Taj & Islamic headwear — Cape Town & South Africa';
const DEFAULT_DESCRIPTION =
  "South Africa's premium Islamic headwear: kufi, fez, taj, turban, Rumal, salaah cap. Cape Town, Durban, Johannesburg, PE. Western Cape, Winelands, Bo-Kaap, Tableview, Bellville. Al-Ameen Caps.";

/**
 * Normalizes a URL path for canonical tags:
 * - Removes trailing slashes (except for root "/")
 * - Removes query parameters and hash fragments (if present)
 * - Ensures consistent format for SEO
 */
function normalizeCanonicalUrl(path) {
  if (!path) return '/';
  
  // Handle both pathname strings and full URLs
  let pathname = path;
  try {
    // If it's a full URL or has query/hash, parse it
    if (path.includes('?') || path.includes('#') || path.startsWith('http')) {
      const url = new URL(path, 'https://example.com');
      pathname = url.pathname;
    }
  } catch {
    // If URL parsing fails, use path as-is (it's likely already a pathname)
    pathname = path;
  }
  
  // Remove trailing slash except for root
  if (pathname !== '/' && pathname.endsWith('/')) {
    pathname = pathname.slice(0, -1);
  }
  
  // Ensure it starts with /
  if (!pathname.startsWith('/')) {
    pathname = '/' + pathname;
  }
  
  return pathname;
}

/**
 * Gets the absolute canonical URL for a path.
 * Always uses the canonical domain (alameencaps.com) for SEO consistency.
 */
function getCanonicalUrl(path) {
  const normalizedPath = normalizeCanonicalUrl(path);
  return `${CANONICAL_DOMAIN}${normalizedPath}`;
}

export default function Seo({
  title,
  description = DEFAULT_DESCRIPTION,
  keywords,
  image,
  url,
  product,
  breadcrumbs,
  leadCurator = false,
  heritageArticle = false,
  evolutionFezKufiArticle = false,
  heritageAboutPage = false,
  heritageCreativeWork = false,
  itemListProducts = null,
  localBusiness = false,
  faqs = null,
  /** Full blog post object from blogPosts.js — injects BlogPosting JSON-LD and sets og:type to article */
  blogPost = null,
  noindex = false,
}) {
  const location = useLocation();
  
  // For canonical URL: ALWAYS use the actual page URL (location.pathname) to ensure it matches the accessed URL
  // This prevents "Alternative page with proper canonical tag" issues where canonical points to a different URL
  const actualPath = location.pathname;
  const normalizedActualPath = normalizeCanonicalUrl(actualPath);
  const canonicalUrl = getCanonicalUrl(actualPath);
  
  // For Open Graph and other metadata: use provided url prop if available, otherwise use actual path
  const metadataPath = url || actualPath;
  const normalizedMetadataPath = normalizeCanonicalUrl(metadataPath);
  const fullUrl = `${BASE_URL}${normalizedMetadataPath}`;
  const ogImage = image?.startsWith('http') ? image : `${BASE_URL}${image || '/collection/nalain-cap.png'}`;
  const metaKeywords = keywords ?? SEO_KEYWORDS;

  useEffect(() => {
    // Title
    document.title = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} | ${DEFAULT_TITLE}`;

    // Meta description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.name = 'description';
      document.head.appendChild(metaDesc);
    }
    metaDesc.content = description.slice(0, 160);

    // Meta keywords (optional; default from central list)
    let metaKw = document.querySelector('meta[name="keywords"]');
    if (!metaKw) {
      metaKw = document.createElement('meta');
      metaKw.name = 'keywords';
      document.head.appendChild(metaKw);
    }
    metaKw.content = (metaKeywords || '').slice(0, 1200);

    // Robots (noindex for checkout, account, 404)
    let metaRobots = document.querySelector('meta[name="robots"]');
    if (noindex) {
      if (!metaRobots) {
        metaRobots = document.createElement('meta');
        metaRobots.name = 'robots';
        document.head.appendChild(metaRobots);
      }
      metaRobots.content = 'noindex, nofollow';
    } else if (metaRobots && metaRobots.content === 'noindex, nofollow') {
      metaRobots.remove();
    }

    // hreflang: South African English + x-default (regional relevance for ZA / Cape Town queries)
    const removeHreflang = () => {
      document.querySelectorAll('link[rel="alternate"][hreflang="en-ZA"], link[rel="alternate"][hreflang="x-default"]').forEach((el) => el.remove());
    };
    if (noindex) {
      removeHreflang();
    } else {
      let hlZa = document.querySelector('link[rel="alternate"][hreflang="en-ZA"]');
      let hlDef = document.querySelector('link[rel="alternate"][hreflang="x-default"]');
      if (!hlZa) {
        hlZa = document.createElement('link');
        hlZa.rel = 'alternate';
        hlZa.hreflang = 'en-ZA';
        document.head.appendChild(hlZa);
      }
      if (!hlDef) {
        hlDef = document.createElement('link');
        hlDef.rel = 'alternate';
        hlDef.hreflang = 'x-default';
        document.head.appendChild(hlDef);
      }
      hlZa.href = canonicalUrl;
      hlDef.href = canonicalUrl;
    }

    // Canonical (skip for noindex pages - they shouldn't have canonical tags)
    // Prefer #spa-canonical from index.html early script so we update one tag (no duplicates).
    let canonical =
      document.getElementById('spa-canonical') || document.querySelector('link[rel="canonical"]');
    if (noindex) {
      document.querySelectorAll('link[rel="canonical"]').forEach((el) => el.remove());
    } else {
      // Set canonical tag for indexable pages - always use canonical domain
      if (!canonical) {
        canonical = document.createElement('link');
        canonical.id = 'spa-canonical';
        canonical.rel = 'canonical';
        document.head.appendChild(canonical);
      }
      // Use canonicalUrl which always uses https://alameencaps.com
      canonical.href = canonicalUrl;
    }

    // Open Graph
    const pageTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} | ${DEFAULT_TITLE}`;
    const ogType = product ? 'product' : blogPost ? 'article' : 'website';
    const ogTags = [
      ['og:locale', 'en_ZA'],
      ['og:title', pageTitle],
      ['og:description', description.slice(0, 160)],
      ['og:url', fullUrl],
      ['og:image', ogImage],
      ['og:type', ogType],
      ['og:site_name', SITE_NAME],
    ];
    ogTags.forEach(([property, content]) => {
      let tag = document.querySelector(`meta[property="${property}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('property', property);
        document.head.appendChild(tag);
      }
      tag.content = content;
    });

    // Twitter Card
    const twTags = [
      ['twitter:card', 'summary_large_image'],
      ['twitter:title', pageTitle],
      ['twitter:description', description.slice(0, 160)],
      ['twitter:image', ogImage],
    ];
    twTags.forEach(([twName, twContent]) => {
      let twTag = document.querySelector(`meta[name="${twName}"]`);
      if (!twTag) {
        twTag = document.createElement('meta');
        twTag.name = twName;
        document.head.appendChild(twTag);
      }
      twTag.content = twContent;
    });
  }, [title, description, metaKeywords, fullUrl, ogImage, noindex, canonicalUrl, blogPost, product]);

  // JSON-LD: Product schema
  useEffect(() => {
    if (!product) return;
    const schema = getProductSchema(product);
    const cleanup = injectJsonLd(schema);
    return cleanup;
  }, [product]);

  // JSON-LD: Breadcrumb schema
  useEffect(() => {
    if (!breadcrumbs?.length) return;
    const schema = getBreadcrumbSchema(breadcrumbs);
    const cleanup = injectJsonLd(schema);
    return cleanup;
  }, [breadcrumbs]);

  // JSON-LD: Lead Curator (Person) for E-E-A-T / author authority
  useEffect(() => {
    if (!leadCurator) return;
    const schema = getLeadCuratorSchema();
    const cleanup = injectJsonLd(schema);
    return cleanup;
  }, [leadCurator]);

  // JSON-LD: Article for Heritage page (links to brand/authority)
  useEffect(() => {
    if (!heritageArticle) return;
    const schema = getHeritageArticleSchema();
    const cleanup = injectJsonLd(schema);
    return cleanup;
  }, [heritageArticle]);

  // JSON-LD: Article for Evolution of Fez and Kufi blog post
  useEffect(() => {
    if (!evolutionFezKufiArticle) return;
    const schema = getEvolutionFezKufiArticleSchema();
    const cleanup = injectJsonLd(schema);
    return cleanup;
  }, [evolutionFezKufiArticle]);

  // JSON-LD: AboutPage + CreativeWork for Heritage page (cultural/historical resource)
  useEffect(() => {
    if (!heritageAboutPage && !heritageCreativeWork) return;
    const cleanups = [];
    if (heritageAboutPage) cleanups.push(injectJsonLd(getHeritageAboutPageSchema()));
    if (heritageCreativeWork) cleanups.push(injectJsonLd(getHeritageCreativeWorkSchema()));
    return () => cleanups.forEach((c) => c());
  }, [heritageAboutPage, heritageCreativeWork]);

  // JSON-LD: ItemList for Shop (Inaugural Collection) + optional LocalBusiness
  useEffect(() => {
    if (!itemListProducts?.length && !localBusiness) return;
    const cleanups = [];
    if (itemListProducts?.length) {
      cleanups.push(injectJsonLd(getShopItemListSchema(itemListProducts)));
    }
    if (localBusiness) {
      cleanups.push(injectJsonLd(getLocalBusinessSchema()));
    }
    return () => cleanups.forEach((c) => c());
  }, [itemListProducts, localBusiness]);

  // JSON-LD: FAQPage for local landing pages (SERP FAQ rich results)
  useEffect(() => {
    const schema = getFAQPageSchema(faqs);
    if (!schema) return;
    const cleanup = injectJsonLd(schema);
    return cleanup;
  }, [faqs]);

  // JSON-LD: BlogPosting for /blog/:slug
  useEffect(() => {
    if (!blogPost) return;
    const schema = getBlogPostingSchema(blogPost);
    if (!schema) return;
    const cleanup = injectJsonLd(schema);
    return cleanup;
  }, [blogPost]);

  return null;
}
