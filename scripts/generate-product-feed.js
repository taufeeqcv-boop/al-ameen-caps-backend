#!/usr/bin/env node
/**
 * Generates public/product-feed.xml for Google Merchant Center (Search Shopping tab).
 * RSS 2.0 with Google's product namespace. Run during build.
 * In Merchant Center: Add product data -> Website -> Enter feed URL: https://alameencaps.com/product-feed.xml
 */
const FEED_BASE_URL = 'https://alameencaps.com';

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { COLLECTION_PRODUCTS } from '../src/data/collection.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

const base = FEED_BASE_URL.replace(/\/+$/, '');

function escapeXml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function productToItem(p) {
  const id = (p.id || p.sku || '').toString().trim() || 'unknown';
  const title = (p.name || 'Product').slice(0, 150);
  const description = (p.description || '')
    .replace(/\n/g, ' ')
    .trim()
    .slice(0, 5000);
  const link = base + '/product/' + encodeURIComponent(id);
  const imagePath = p.imageURL && p.imageURL.startsWith('/') ? p.imageURL : (p.imageURL ? '/' + p.imageURL : '');
  const imageLink = imagePath ? base + imagePath : '';
  const qty = Math.max(0, Number(p.quantityAvailable) ?? 0);
  const availability = p.preOrderOnly ? 'preorder' : (qty > 0 ? 'in_stock' : 'out_of_stock');
  const price = Math.max(0, Number(p.price) ?? 0);
  const priceStr = price > 0 ? price.toFixed(2) + ' ZAR' : '0.00 ZAR';
  const googleProductCategory = '166';

  return [
    '  <item>',
    '    <g:id>' + escapeXml(id) + '</g:id>',
    '    <g:title>' + escapeXml(title) + '</g:title>',
    '    <g:description>' + escapeXml(description) + '</g:description>',
    '    <g:link>' + escapeXml(link) + '</g:link>',
    '    <g:image_link>' + escapeXml(imageLink) + '</g:image_link>',
    '    <g:availability>' + availability + '</g:availability>',
    '    <g:price>' + priceStr + '</g:price>',
    '    <g:condition>new</g:condition>',
    '    <g:brand>Al-Ameen Caps</g:brand>',
    '    <g:google_product_category>' + escapeXml(googleProductCategory) + '</g:google_product_category>',
    '  </item>',
  ].join('\n');
}

const items = (COLLECTION_PRODUCTS || []).map(productToItem);
const lastBuildDate = new Date().toUTCString();

const channelParts = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">',
  '  <channel>',
  '    <title>Al-Ameen Caps – Islamic Headwear</title>',
  '    <link>' + base + '/shop</link>',
  '    <description>Handcrafted kufi, fez, taj, turban and Islamic headwear. Cape Town, South Africa.</description>',
  '    <lastBuildDate>' + lastBuildDate + '</lastBuildDate>',
  '    <language>en-za</language>',
  items.join('\n'),
  '  </channel>',
  '</rss>',
];

const xml = channelParts.join('\n');

const outDir = join(__dirname, '..', 'public');
if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, 'product-feed.xml'), xml, 'utf8');
console.log('Product feed: generated', items.length, 'items at public/product-feed.xml');
