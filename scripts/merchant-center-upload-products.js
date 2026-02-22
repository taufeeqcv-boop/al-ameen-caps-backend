#!/usr/bin/env node
/**
 * Upload products to Google Merchant Center via Content API for Shopping.
 * Use when you have chosen "Add products using API" as the feed source in Merchant Center.
 *
 * Prerequisites:
 * 1. In Merchant Center: Products → Feeds → Add feed → "Add products using API".
 * 2. Google Cloud project with Content API for Shopping enabled.
 * 3. OAuth 2.0 credentials and an access token (see docs/MERCHANT_CENTER_API.md).
 *
 * Env:
 *   MERCHANT_ID     – Your Merchant Center account ID (numeric).
 *   CONTENT_API_ACCESS_TOKEN – OAuth2 access token with scope https://www.googleapis.com/auth/content.
 *
 * Run: node scripts/merchant-center-upload-products.js
 */
const FEED_BASE_URL = process.env.VITE_SITE_URL || "https://alameencaps.com";
const MERCHANT_ID = process.env.MERCHANT_ID;
const ACCESS_TOKEN = process.env.CONTENT_API_ACCESS_TOKEN;

import { COLLECTION_PRODUCTS } from "../src/data/collection.js";

const base = FEED_BASE_URL.replace(/\/+$/, "");

function toApiProduct(p) {
  const id = (p.id || p.sku || "").toString().trim() || "unknown";
  const title = (p.name || "Product").slice(0, 150);
  const description = (p.description || "")
    .replace(/\n/g, " ")
    .trim()
    .slice(0, 5000);
  const link = `${base}/product/${encodeURIComponent(id)}`;
  const imagePath =
    p.imageURL && p.imageURL.startsWith("/")
      ? p.imageURL
      : p.imageURL
        ? `/${p.imageURL}`
        : "";
  const imageLink = imagePath ? base + imagePath : "";
  const qty = Math.max(0, Number(p.quantityAvailable) ?? 0);
  const availability = p.preOrderOnly
    ? "preorder"
    : qty > 0
      ? "in_stock"
      : "out_of_stock";
  const price = Math.max(0, Number(p.price) ?? 0);
  const priceValue = price > 0 ? price.toFixed(2) : "0.00";

  return {
    offerId: id,
    title,
    description,
    link,
    imageLink,
    contentLanguage: "en",
    targetCountry: "ZA",
    channel: "online",
    availability,
    condition: "new",
    brand: "Al-Ameen Caps",
    googleProductCategory: "166",
    price: {
      value: priceValue,
      currency: "ZAR",
    },
  };
}

async function insertProduct(product) {
  const url = `https://shoppingcontent.googleapis.com/content/v2.1/${MERCHANT_ID}/products`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${ACCESS_TOKEN}`,
    },
    body: JSON.stringify(product),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`HTTP ${res.status}: ${err}`);
  }
  return res.json();
}

async function main() {
  if (!MERCHANT_ID || !ACCESS_TOKEN) {
    console.error(
      "Set MERCHANT_ID and CONTENT_API_ACCESS_TOKEN. See docs/MERCHANT_CENTER_API.md"
    );
    process.exit(1);
  }

  const products = (COLLECTION_PRODUCTS || []).map(toApiProduct);
  console.log(`Uploading ${products.length} products to Merchant Center...`);

  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    try {
      await insertProduct(p);
      console.log(`  OK ${i + 1}/${products.length}: ${p.offerId}`);
    } catch (e) {
      console.error(`  FAIL ${p.offerId}:`, e.message);
    }
  }

  console.log("Done.");
}

main();
