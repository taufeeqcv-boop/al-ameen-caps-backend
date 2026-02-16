/**
 * SEO — Dynamic meta tags and JSON-LD for each page
 * Compatible with Netlify prerendering (bots receive correct meta/schema)
 */

import { useEffect } from 'react';
import {
  injectJsonLd,
  getProductSchema,
  getBreadcrumbSchema,
  getLeadCuratorSchema,
  getHeritageArticleSchema,
  getEvolutionFezKufiArticleSchema,
  getShopItemListSchema,
  getLocalBusinessSchema,
  getFAQPageSchema,
  getBaseUrl,
  SEO_KEYWORDS,
} from '../lib/seo';

const BASE_URL = getBaseUrl();
const SITE_NAME = 'Al-Ameen Caps';
const DEFAULT_TITLE = 'Islamic Fashion, Kufi, Fez, Taj – Cape Town & South Africa';
const DEFAULT_DESCRIPTION = 'Islamic fashion and Sufi clothing: kufi, fez, taj, turban, Rumal, salaah cap. Cape Town, Durban, Johannesburg, PE. Northern and Southern suburbs, Winelands, Bo-Kaap, Tableview, Bellville. Top boutique. South Africa.';

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
  itemListProducts = null,
  localBusiness = false,
  faqs = null,
  noindex = false,
}) {
  const fullUrl = url ? `${BASE_URL}${url}` : BASE_URL;
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
    metaKw.content = (metaKeywords || '').slice(0, 500);

    // Robots (noindex for checkout, account)
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

    // Canonical
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = fullUrl;

    // Open Graph
    const pageTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} | ${DEFAULT_TITLE}`;
    const ogTags = [
      ['og:locale', 'en_ZA'],
      ['og:title', pageTitle],
      ['og:description', description.slice(0, 160)],
      ['og:url', fullUrl],
      ['og:image', ogImage],
      ['og:type', product ? 'product' : 'website'],
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
  }, [title, description, metaKeywords, fullUrl, ogImage, noindex]);

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

  return null;
}
