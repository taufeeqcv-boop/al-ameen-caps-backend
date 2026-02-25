/**
 * Generate WebP (and resized) for faster loading. Keeps visuals identical.
 * - Logo 192x192, hero-bg full size (existing).
 * - public/images/heritage/*.png|jpg → max width 1200, WebP alongside.
 * - public/collection/*.png → max width 1200, WebP alongside (run after copy-collection-images).
 * Run: node scripts/optimize-images.js
 * Requires: npm install sharp (devDependency)
 */

import { readFile, readdir, mkdir } from "fs/promises";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const publicDir = join(root, "public");
const assetsDir = join(root, "src", "assets");

const MAX_WIDTH_HERITAGE = 1200;
const MAX_WIDTH_PRODUCT = 1200;
const WEBP_QUALITY = 82;

async function toWebP(sharp, buf, outPath, maxWidth = null) {
  let pipeline = sharp(buf);
  const meta = await sharp(buf).metadata();
  const w = meta.width || 0;
  if (maxWidth && w > maxWidth) {
    pipeline = pipeline.resize(maxWidth, null, { withoutEnlargement: true });
  }
  await pipeline.webp({ quality: WEBP_QUALITY }).toFile(outPath);
}

async function processDir(sharp, dir, maxWidth, label) {
  let names = [];
  try {
    names = await readdir(dir);
  } catch {
    return 0;
  }
  const imageExt = /\.(png|jpg|jpeg)$/i;
  let count = 0;
  for (const name of names) {
    if (!imageExt.test(name)) continue;
    const srcPath = join(dir, name);
    const base = name.replace(imageExt, "");
    const webpPath = join(dir, `${base}.webp`);
    try {
      const buf = await readFile(srcPath);
      await toWebP(sharp, buf, webpPath, maxWidth);
      count++;
    } catch (e) {
      console.warn(`${label} ${name}:`, e.message);
    }
  }
  return count;
}

async function run() {
  let sharp;
  try {
    sharp = (await import("sharp")).default;
  } catch {
    console.warn("scripts/optimize-images.js: optional dependency 'sharp' not installed. Run: npm install sharp --save-dev");
    return;
  }

  await mkdir(publicDir, { recursive: true });

  // Logo + hero (existing)
  const logoPath = join(assetsDir, "logo.png");
  const heroPath = join(assetsDir, "hero-bg.png");
  try {
    const logoBuf = await readFile(logoPath);
    await sharp(logoBuf)
      .resize(192, 192)
      .webp({ quality: 85 })
      .toFile(join(publicDir, "logo.webp"));
    console.log("Wrote public/logo.webp (192x192)");
  } catch (e) {
    console.warn("Logo:", e.message);
  }
  try {
    const heroBuf = await readFile(heroPath);
    await sharp(heroBuf)
      .webp({ quality: 82 })
      .toFile(join(publicDir, "hero-bg.webp"));
    console.log("Wrote public/hero-bg.webp");
  } catch (e) {
    console.warn("Hero:", e.message);
  }

  // Heritage images: public/images/heritage/
  const heritageDir = join(publicDir, "images", "heritage");
  const heritageCount = await processDir(sharp, heritageDir, MAX_WIDTH_HERITAGE, "Heritage");
  if (heritageCount > 0) console.log(`Wrote ${heritageCount} WebP(s) in public/images/heritage/`);

  // Product images: public/collection/
  const collectionDir = join(publicDir, "collection");
  const collectionCount = await processDir(sharp, collectionDir, MAX_WIDTH_PRODUCT, "Collection");
  if (collectionCount > 0) console.log(`Wrote ${collectionCount} WebP(s) in public/collection/`);
}

run();
