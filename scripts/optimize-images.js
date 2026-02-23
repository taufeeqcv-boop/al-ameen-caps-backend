/**
 * Generate WebP (and resized logo) for Lighthouse: logo 192x192, hero-bg full size.
 * Run: node scripts/optimize-images.js
 * Requires: npm install sharp (devDependency)
 * Output: public/logo.webp, public/hero-bg.webp (used by Footer and Hero with <picture>)
 */

import { readFile, writeFile, mkdir } from "fs/promises";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const publicDir = join(root, "public");
const assetsDir = join(root, "src", "assets");

async function run() {
  let sharp;
  try {
    sharp = (await import("sharp")).default;
  } catch {
    console.warn("scripts/optimize-images.js: optional dependency 'sharp' not installed. Run: npm install sharp --save-dev");
    console.warn("Skipping WebP generation. Add public/logo.webp and public/hero-bg.webp manually for best Lighthouse scores.");
    return;
  }

  await mkdir(publicDir, { recursive: true });

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
}

run();
