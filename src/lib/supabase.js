import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Only create client when env vars are set (avoids crash and blank white screen when not configured)
let supabase = null;
if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
}

export { supabase };

/** Upsert user profile (Name, Email, Avatar) and mark marketing_opt_in. Call after sign-in. */
export async function upsertProfile(user) {
  if (!supabase || !user?.id) return;
  const fullName = user.user_metadata?.full_name || user.email?.split("@")[0] || "";
  const parts = fullName.trim().split(/\s+/);
  const nameFirst = parts[0] || "";
  const nameLast = parts.slice(1).join(" ") || "";
  try {
    await supabase.from("profiles").upsert(
      {
        id: user.id,
        email: user.email || "",
        full_name: fullName,
        name_first: nameFirst,
        name_last: nameLast,
        avatar_url: user.user_metadata?.avatar_url || null,
        marketing_opt_in: true,
        updated_at: new Date().toISOString(),
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

function findCollectionMatch(p, collectionProducts) {
  if (!collectionProducts?.length) return null;
  const pName = norm(p.name);
  const pSku = String(p.sku ?? '').trim();
  return collectionProducts.find((c) => {
    if (pSku && pSku === String(c.id ?? '').trim()) return true;
    const cName = norm(c.name);
    return cName && pName && cName === pName;
  }) || null;
}

// Normalize image URL: ensure paths like "collection/nalain-cap.png" become "/collection/nalain-cap.png"
// so they resolve to public/collection/ when served by Vite. Reject localhost URLs (broken after deploy).
function normalizeImageUrl(url) {
  if (!url || typeof url !== 'string') return null;
  const s = url.trim();
  if (s.startsWith('http://localhost') || s.startsWith('https://localhost')) return null;
  if (s.startsWith('http://') || s.startsWith('https://')) return s;
  return s.startsWith('/') ? s : `/${s}`;
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
      console.error("[Supabase getProducts] Connection/query failed – exact error:", error?.message ?? error, error);
      return [];
    }
    const list = data ?? [];
    console.log("[Supabase getProducts] OK – rows:", list.length, "(products table, stock_quantity used for availability)");
    const collectionProducts = await import('../data/collection.js').then((m) => m.COLLECTION_PRODUCTS ?? []);
    return list.map((p) => {
      const match = findCollectionMatch(p, collectionProducts);
      const quantityAvailable = getQuantityAvailable(p, collectionProducts);
      const rawImage = p.image_url || (match?.imageURL ?? null);
      const imageURL = normalizeImageUrl(rawImage) || (match?.imageURL ? normalizeImageUrl(match.imageURL) : null) || undefined;
      return {
        ...p,
        price: Number(p.price) || 0,
        quantityAvailable,
        imageURL,
      };
    });
  } catch (err) {
    console.error("[Supabase getProducts] Unexpected error (e.g. stuck worker / network):", err?.message ?? err, err);
    return [];
  }
};

// Fetch Single Product
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
    const rawImage = data.image_url || (match?.imageURL ?? null);
    const imageURL = normalizeImageUrl(rawImage) || (match?.imageURL ? normalizeImageUrl(match.imageURL) : null) || undefined;
    return {
      ...data,
      price: Number(data.price) || 0,
      quantityAvailable: getQuantityAvailable(data, collectionProducts),
      imageURL,
    };
  } catch (err) {
    console.error("[Supabase getProductById] Error:", err?.message ?? err, err);
    return null;
  }
};
