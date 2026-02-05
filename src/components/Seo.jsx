/**
 * SEO — Dynamic meta tags and JSON-LD for each page
 * Compatible with Netlify prerendering (bots receive correct meta/schema)
 */

import { useEffect } from 'react';
import {
  injectJsonLd,
  getProductSchema,
  getBreadcrumbSchema,
  getBaseUrl,
} from '../lib/seo';

const BASE_URL = getBaseUrl();
const SITE_NAME = 'Al-Ameen Caps';
const DEFAULT_DESCRIPTION = 'Premium handcrafted Islamic headwear. Kufi caps, Azhari caps, Na\'lain caps, Fez, and more. South Africa. Restoring the Crown of the Believer.';

export default function Seo({
  title,
  description = DEFAULT_DESCRIPTION,
  image,
  url,
  product,
  breadcrumbs,
}) {
  const fullUrl = url ? `${BASE_URL}${url}` : BASE_URL;
  const ogImage = image?.startsWith('http') ? image : `${BASE_URL}${image || '/favicon.png'}`;

  useEffect(() => {
    // Title
    document.title = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} | Premium Islamic Headwear`;

    // Meta description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.name = 'description';
      document.head.appendChild(metaDesc);
    }
    metaDesc.content = description.slice(0, 160);

    // Canonical
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = fullUrl;

    // Open Graph
    const ogTags = [
      ['og:title', title || SITE_NAME],
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
      ['twitter:title', title || SITE_NAME],
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
  }, [title, description, fullUrl, ogImage]);

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

  return null;
}
