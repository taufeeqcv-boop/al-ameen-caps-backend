#!/usr/bin/env node
/**
 * Generates public/sitemap.xml from static pages + COLLECTION_PRODUCTS.
 * Run during build. Uses VITE_SITE_URL from Netlify env — must match the domain
 * in Google Search Console (netlify.app or custom domain).
 */

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { COLLECTION_PRODUCTS } from '../src/data/collection.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Base URL: strip trailing slash to avoid double slashes. Must match Search Console property.
const rawBase = process.env.VITE_SITE_URL || process.env.VITE_APP_URL || 'https://www.alameencaps.com';
const baseUrl = String(rawBase).trim().replace(/\/+$/, '');

const staticPages = [
  { path: '/', changefreq: 'weekly', priority: '1.0' },
  { path: '/shop', changefreq: 'weekly', priority: '0.9' },
  { path: '/about', changefreq: 'monthly', priority: '0.7' },
  { path: '/contact', changefreq: 'monthly', priority: '0.7' },
  { path: '/shipping', changefreq: 'monthly', priority: '0.6' },
  { path: '/privacy', changefreq: 'yearly', priority: '0.4' },
  { path: '/terms', changefreq: 'yearly', priority: '0.4' },
];

const productPages = (COLLECTION_PRODUCTS || []).map((p) => ({
  path: `/product/${p.id}`,
  changefreq: 'weekly',
  priority: '0.8',
}));

const urls = [...staticPages, ...productPages];

// Build absolute URL: baseUrl (no trailing /) + path (starts with /) = no double slashes
function toAbsoluteUrl(path) {
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${p}`;
}

// lastmod in ISO date format (build date) — helps search engines prioritize crawling
const lastmod = new Date().toISOString().split('T')[0];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${toAbsoluteUrl(u.path)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

const outDir = join(__dirname, '..', 'public');
if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, 'sitemap.xml'), xml, 'utf8');
console.log('Sitemap: generated', urls.length, 'URLs with base', baseUrl);
