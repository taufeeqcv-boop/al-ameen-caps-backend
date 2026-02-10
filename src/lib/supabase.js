import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Only create client when env vars are set (avoids crash and blank white screen when not configured)
let supabase = null;
if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
}

export { supabase };

/** Upsert user profile. Uses only columns present in base schema (id, first_name, last_name) so it works before/after 20250209_profiles_columns migration. */
export async function upsertProfile(user) {
  if (!supabase || !user?.id) return;
  const fullName = user.user_metadata?.full_name || user.email?.split("@")[0] || "";
  const parts = fullName.trim().split(/\s+/);
  const first = parts[0] || "";
  const last = parts.slice(1).join(" ") || "";
  try {
    await supabase.from("profiles").upsert(
      {
        id: user.id,
        first_name: first,
        last_name: last,
      },
      { onConflict: "id" }
    );
  } catch (err) {
    if (err?.name === "AbortError") return;
    console.error("Supabase upsertProfile:", err);
  }
}

function norm(s) {
  return String(s ?? '').toLowerCase().trim().replace(/\s+/g, ' ');
}

// Fallback stock from collection when Supabase has 0 / invalid (match by sku or case-insensitive name)
// Supabase may return stock_quantity as number or string; support snake_case and camelCase
function getQuantityAvailable(p, collectionProducts) {
  const raw =
    p.stock_quantity ?? p.stockQuantity ?? p.quantity_available ?? p.quantityAvailable;
  const fromDb = typeof raw === 'number' ? raw : Number(raw);
  const match = findCollectionMatch(p, collectionProducts);
  const fromCollection = match?.quantityAvailable != null ? Math.max(0, Number(match.quantityAvailable)) : 0;
  if (fromDb > 0 && !Number.isNaN(fromDb)) return Math.floor(fromDb);
  return fromCollection;
}

export function findCollectionMatch(p, collectionProducts) {
  if (!collectionProducts?.length) return null;
  const pName = norm(p.name);
  const pSku = String(p.sku ?? '').trim();
  const rawId = p.id != null ? p.id : p.product_id;
  const pId = typeof rawId === 'number' ? rawId : parseInt(String(rawId ?? ''), 10);
  const idStr = `collection-${pId}`;

  if (!Number.isNaN(pId) && pId >= 1 && pId <= 20) {
    const byId = collectionProducts.find((c) => String(c.id ?? '').trim() === idStr);
    if (byId) return byId;
  }
  if (pSku) {
    const bySku = collectionProducts.find((c) => String(c.id ?? '').trim() === pSku);
    if (bySku) return bySku;
  }
  const byName = collectionProducts.find((c) => {
    const cName = norm(c.name);
    return cName && pName && cName === pName;
  });
  if (byName) return byName;
  if (!pName) return null;
  return collectionProducts.find((c) => {
    const cName = norm(c.name);
    if (!cName) return false;
    const cFirst = (cName.split(/\s+/)[0] || '').slice(0, 15);
    const pFirst = (pName.split(/\s+/)[0] || '').slice(0, 15);
    return cFirst && pFirst && (pName.includes(cName) || cName.includes(pName) || cFirst === pFirst);
  }) || null;
}

/** Fill image and stock from collection for products that are missing them (e.g. after auth or wrong env). */
export function mergeProductsWithCollection(list, collectionProducts) {
  if (!Array.isArray(list) || !collectionProducts?.length) return list ?? [];
  return list.map((p) => {
    const needsImage = (p.imageURL == null || p.imageURL === '');
    const needsStock = (p.quantityAvailable ?? 0) <= 0;
    if (!needsImage && !needsStock) return p;
    const match = findCollectionMatch(p, collectionProducts);
    if (!match) return p;
    return {
      ...p,
      imageURL: needsImage ? (normalizeImageUrl(match.imageURL) || p.imageURL) : p.imageURL,
      quantityAvailable: needsStock ? Math.max(0, Number(match.quantityAvailable) || 0) : (p.quantityAvailable ?? 0),
    };
  });
}

// In the browser we always use relative image URLs so each deploy (frontend vs backend) loads
// images from its own origin. Avoids images disappearing when frontend and backend are different Netlify URLs.
const _rawBase = (import.meta.env.VITE_IMAGE_BASE_URL || import.meta.env.VITE_SITE_URL || '').replace(/\/$/, '');
const IMAGE_BASE_URL = typeof window === 'undefined' ? (_rawBase && !_rawBase.toLowerCase().includes('localhost') ? _rawBase : '') : '';

// Normalize image URL: paths like "collection/nalain-cap.png" → "/collection/nalain-cap.png".
// Reject localhost URLs. In browser always return relative path so images load from current origin.
export function normalizeImageUrl(url) {
  if (!url || typeof url !== 'string') return null;
  const s = url.trim();
  if (s.startsWith('http://localhost') || s.startsWith('https://localhost')) return null;
  if (s.startsWith('http://') || s.startsWith('https://')) {
    // Strip to path when in browser so images load from current site (fixes frontend vs backend deploy)
    if (typeof window !== 'undefined') {
      try {
        const u = new URL(s);
        return u.pathname || '/';
      } catch {
        return null;
      }
    }
    return s;
  }
  const path = s.startsWith('/') ? s : `/${s}`;
  if (typeof window !== 'undefined') return path;
  if (IMAGE_BASE_URL) return `${IMAGE_BASE_URL}${path}`;
  return path;
}

// Fetch All Products (Ordered by Price High-to-Low)
export const getProducts = async () => {
  if (!supabase) {
    console.warn("[Supabase getProducts] Not configured: VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY missing. Check .env.local or Netlify env.");
    return [];
  }
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('price', { ascending: false });
    if (error) {
      const msg = error?.message ?? String(error);
      console.error("[Supabase getProducts] Connection/query failed – exact error:", msg, error);
      if (/invalid.*api key|jwt|unauthorized|401|403/i.test(msg)) {
        console.warn("[Supabase getProducts] If you see Invalid API key on localhost, use the anon key (not service_role) in .env as VITE_SUPABASE_ANON_KEY and restart the dev server. See docs/SUPABASE_AUTH_SETUP.md");
      }
      return [];
    }
    const list = data ?? [];
    console.log("[Supabase getProducts] OK – rows:", list.length, "(products table, stock_quantity used for availability)");
    const collectionProducts = await import('../data/collection.js').then((m) => m.COLLECTION_PRODUCTS ?? []);
    const out = list.map((p) => {
      const match = findCollectionMatch(p, collectionProducts);
      const quantityAvailable = getQuantityAvailable(p, collectionProducts);
      const rawImage = p.image_url || (match?.imageURL ?? null);
      let imageURL = normalizeImageUrl(rawImage) || (match?.imageURL ? normalizeImageUrl(match.imageURL) : null) || undefined;
      let qty = quantityAvailable;
      if (match) {
        if (qty <= 0) qty = Math.max(0, Number(match.quantityAvailable) || 0);
        if (imageURL == null || imageURL === '') imageURL = normalizeImageUrl(match.imageURL) || undefined;
      }
      return {
        ...p,
        price: Number(p.price) || 0,
        quantityAvailable: qty,
        imageURL,
      };
    });
    out.forEach((p) => {
      if ((p.imageURL == null || p.imageURL === '') || (p.quantityAvailable ?? 0) <= 0) {
        const m = findCollectionMatch(p, collectionProducts);
        if (m) {
          if (p.imageURL == null || p.imageURL === '') p.imageURL = normalizeImageUrl(m.imageURL) || undefined;
          if ((p.quantityAvailable ?? 0) <= 0) p.quantityAvailable = Math.max(0, Number(m.quantityAvailable) || 0);
        }
      }
    });
    return out;
  } catch (err) {
    console.error("[Supabase getProducts] Unexpected error (e.g. stuck worker / network):", err?.message ?? err, err);
    return [];
  }
};

// Fetch Single Product (same fallbacks as getProducts for incognito / strict RLS)
export const getProductById = async (id) => {
  if (!supabase || !id) return null;
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();
    if (error) return null;
    if (!data) return null;
    const collectionProducts = await import('../data/collection.js').then((m) => m.COLLECTION_PRODUCTS ?? []);
    const match = findCollectionMatch(data, collectionProducts);
    let quantityAvailable = getQuantityAvailable(data, collectionProducts);
    let rawImage = data.image_url || (match?.imageURL ?? null);
    let imageURL = normalizeImageUrl(rawImage) || (match?.imageURL ? normalizeImageUrl(match.imageURL) : null) || undefined;
    if (match) {
      if (quantityAvailable <= 0) quantityAvailable = Math.max(0, Number(match.quantityAvailable) || 0);
      if (imageURL == null || imageURL === '') imageURL = normalizeImageUrl(match.imageURL) || undefined;
    }
    return {
      ...data,
      price: Number(data.price) || 0,
      quantityAvailable,
      imageURL,
    };
  } catch (err) {
    console.error("[Supabase getProductById] Error:", err?.message ?? err, err);
    return null;
  }
};
