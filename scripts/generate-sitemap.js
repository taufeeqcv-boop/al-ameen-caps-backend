#!/usr/bin/env node
/**
 * Generates public/sitemap.xml from static pages + COLLECTION_PRODUCTS.
 * Run during build. Always uses production domain so sitemap URLs match the
 * Search Console property (alameencaps.com). Netlify build env may set
 * VITE_SITE_URL to netlify.app — we ignore that for sitemap to avoid "URL not allowed" errors.
 */
const SITEMAP_BASE_URL = 'https://alameencaps.com';

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { COLLECTION_PRODUCTS } from '../src/data/collection.js';
import { BLOG_POSTS } from '../src/data/blogPosts.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

const baseUrl = SITEMAP_BASE_URL.replace(/\/+$/, '');

const staticPages = [
  { path: '/', changefreq: 'weekly', priority: '1.0' },
  { path: '/shop', changefreq: 'weekly', priority: '0.9' },
  { path: '/blog', changefreq: 'weekly', priority: '0.8' },
  { path: '/guides', changefreq: 'monthly', priority: '0.7' },
  { path: '/guides/kufi-care', changefreq: 'monthly', priority: '0.6' },
  { path: '/guides/eid-headwear-south-africa', changefreq: 'monthly', priority: '0.6' },
  { path: '/guides/islamic-headwear-cape-town', changefreq: 'monthly', priority: '0.6' },
  { path: '/community', changefreq: 'weekly', priority: '0.6' },
  { path: '/about', changefreq: 'monthly', priority: '0.7' },
  { path: '/heritage', changefreq: 'monthly', priority: '0.7', video: true },
  { path: '/culture/evolution-fez-kufi-cape', changefreq: 'monthly', priority: '0.6' },
  { path: '/near/bo-kaap', changefreq: 'monthly', priority: '0.7' },
  { path: '/near/athlone', changefreq: 'monthly', priority: '0.7' },
  { path: '/contact', changefreq: 'monthly', priority: '0.7' },
  { path: '/shipping', changefreq: 'monthly', priority: '0.6' },
  { path: '/privacy', changefreq: 'yearly', priority: '0.4' },
  { path: '/terms', changefreq: 'yearly', priority: '0.4' },
  { path: '/review', changefreq: 'monthly', priority: '0.5' },
];

const blogPages = (BLOG_POSTS || []).map((p) => ({
  path: `/blog/${p.slug}`,
  changefreq: 'monthly',
  priority: '0.7',
}));

const productPages = (COLLECTION_PRODUCTS || []).map((p) => ({
  path: `/product/${p.id}`,
  changefreq: 'weekly',
  priority: '0.8',
}));

const urls = [...staticPages, ...blogPages, ...productPages];

// Build absolute URL: baseUrl (no trailing /) + path (starts with /) = no double slashes
function toAbsoluteUrl(path) {
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${p}`;
}

// lastmod in ISO date format (build date) — helps search engines prioritize crawling
const lastmod = new Date().toISOString().split('T')[0];

// Video sitemap extension: one video on /heritage so "Discovered videos" > 0
const VIDEO_HERITAGE = {
  content_loc: `${baseUrl}/videos/heritage-timeline.mp4`,
  thumbnail_loc: `${baseUrl}/images/heritage/present-cape-town.png`,
  title: 'Development of Cape Islamic heritage and headwear (1600s to today)',
  description: 'The journey of faith, scholarship, and craft from the 1600s to today. Cape Malay and Islamic headwear heritage.',
};

function urlBlock(u) {
  const loc = toAbsoluteUrl(u.path);
  let videoBlock = '';
  if (u.video && u.path === '/heritage') {
    videoBlock = `
    <video:video>
      <video:thumbnail_loc>${VIDEO_HERITAGE.thumbnail_loc}</video:thumbnail_loc>
      <video:title>${escapeXml(VIDEO_HERITAGE.title)}</video:title>
      <video:description>${escapeXml(VIDEO_HERITAGE.description)}</video:description>
      <video:content_loc>${VIDEO_HERITAGE.content_loc}</video:content_loc>
    </video:video>`;
  }
  return `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>${videoBlock}
  </url>`;
}

function escapeXml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

const hasVideo = urls.some((u) => u.video);
const urlsetAttrs = hasVideo
  ? 'xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1"'
  : 'xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"';

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset ${urlsetAttrs}>
${urls.map(urlBlock).join('\n')}
</urlset>`;

const outDir = join(__dirname, '..', 'public');
if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, 'sitemap.xml'), xml, 'utf8');
console.log('Sitemap: generated', urls.length, 'URLs with base', baseUrl);
