#!/usr/bin/env node
/**
 * Writes IndexNow key file to dist/ for Bing/IndexNow verification.
 * Set INDEXNOW_KEY in Netlify (Build & deploy > Environment) to your API key.
 * File will be at https://yoursite.com/<key>.txt containing the key string.
 */
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const key = process.env.INDEXNOW_KEY || process.env.VITE_INDEXNOW_KEY;
const distDir = join(__dirname, '..', 'dist');

if (!key || typeof key !== 'string') {
  console.log('IndexNow: no INDEXNOW_KEY set — skipping key file.');
  process.exit(0);
}

const trimmed = key.trim();
if (!trimmed) {
  console.log('IndexNow: INDEXNOW_KEY is empty — skipping key file.');
  process.exit(0);
}

if (!existsSync(distDir)) {
  console.log('IndexNow: dist/ not found (run after vite build) — skipping.');
  process.exit(0);
}

const filename = `${trimmed}.txt`;
const filepath = join(distDir, filename);
writeFileSync(filepath, trimmed, 'utf8');
console.log('IndexNow: wrote', filename, 'to dist/');
