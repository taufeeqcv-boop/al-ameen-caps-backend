#!/usr/bin/env node
/**
 * Copies product images from src/assets/collection/ to public/collection/
 * so feed (g:image_link) and Product schema URLs work: https://alameencaps.com/collection/*.png
 * Run before or during build (e.g. before generate-product-feed).
 */
import { copyFileSync, mkdirSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { COLLECTION_IMAGE_FILENAMES } from '../src/data/collection.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const srcDir = join(root, 'src', 'assets', 'collection');
const outDir = join(root, 'public', 'collection');

if (!existsSync(srcDir)) {
  console.warn('copy-collection-images: src/assets/collection not found; skipping. Add images there so feed/schema URLs work.');
  process.exit(0);
}

if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

const filenames = Object.values(COLLECTION_IMAGE_FILENAMES || {});
let copied = 0;
for (const name of filenames) {
  const src = join(srcDir, name);
  const dest = join(outDir, name);
  if (existsSync(src)) {
    copyFileSync(src, dest);
    copied++;
  }
}
console.log('copy-collection-images: copied', copied, 'images to public/collection/');
