import { createClient } from '@supabase/supabase-js';
import { COLLECTION_PRODUCTS as STATIC_COLLECTION } from '../data/collection.js';

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

/** Find a Supabase product that matches this collection product (for overlay price/quantity). */
function findSupabaseMatch(collectionProduct, supabaseList) {
  if (!Array.isArray(supabaseList) || !collectionProduct) return null;
  for (const p of supabaseList) {
    if (findCollectionMatch(p, [collectionProduct])) return p;
  }
  return null;
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
  if (IMAGE_BASE_URL) return `${IMAGE_BASE_URL}${path}`;
  return path;
}

const IMAGE_BASE_HARDCODED = 'https://alameencaps.com';

/** Force collection images to load from hardcoded URL. */
export function sameOriginImageSrc(url) {
  if (!url || typeof url !== 'string') return url;
  const s = url.trim();
  if (s.startsWith('/collection')) {
    const path = s.includes('?') ? s.split('?')[0] : s;
    return `${IMAGE_BASE_HARDCODED}${path}`;
  }
  if (s.startsWith('http://') || s.startsWith('https://')) {
    try {
      const u = new URL(s);
      if (u.pathname.startsWith('/collection')) return `${IMAGE_BASE_HARDCODED}${u.pathname}`;
    } catch {
      return url;
    }
  }
  return url;
}

// Fetch All Products — collection-first so images always work with or without login.
// Uses static collection (no dynamic import) so list and images never depend on auth or chunk loading.
export const getProducts = async () => {
  const collectionProducts = STATIC_COLLECTION ?? [];
  if (!collectionProducts.length) return [];

  try {
    let supabaseList = [];
    if (supabase) {
      try {
        const { data, error } = await supabase.from('products').select('*').order('price', { ascending: false });
        if (!error && Array.isArray(data)) supabaseList = data;
      } catch (_) {}
    }

    return collectionProducts.map((c) => {
      const sb = findSupabaseMatch(c, supabaseList);
      const imageURL = normalizeImageUrl(c.imageURL) || (c.imageURL ? (c.imageURL.startsWith('/') ? c.imageURL : `/${c.imageURL}`) : undefined) || undefined;
      const quantityAvailable = sb != null ? Math.max(0, getQuantityAvailable(sb, [c])) : Math.max(0, Number(c.quantityAvailable) || 0);
      const price = sb != null ? Number(sb.price) || 0 : Number(c.price) || 0;
      return {
        id: c.id,
        name: c.name,
        description: c.description,
        sku: sb?.sku ?? c.id,
        price,
        quantityAvailable,
        imageURL,
        category: c.category,
        product_id: sb?.id ?? (typeof c.id === 'string' ? parseInt(c.id.replace(/^collection-/, ''), 10) : c.id),
        preOrderOnly: c.preOrderOnly ?? false,
      };
    });
  } catch {
    return collectionProducts.map((c) => ({
      id: c.id,
      name: c.name,
      description: c.description,
      sku: c.id,
      price: Number(c.price) || 0,
      quantityAvailable: Math.max(0, Number(c.quantityAvailable) || 0),
      imageURL: normalizeImageUrl(c.imageURL) || (c.imageURL ? (c.imageURL.startsWith('/') ? c.imageURL : `/${c.imageURL}`) : undefined) || undefined,
      category: c.category,
      product_id: typeof c.id === 'string' ? parseInt(c.id.replace(/^collection-/, ''), 10) : c.id,
      preOrderOnly: c.preOrderOnly ?? false,
    }));
  }
};

/** Fetch all product_variants (for admin). Returns [] if no Supabase or error. */
export const getAllVariants = async () => {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from('product_variants')
      .select('id, product_id, sku, size, color, stock_quantity, price, price_adjustment')
      .order('product_id')
      .order('size', { ascending: true })
      .order('color', { ascending: true });
    if (error) return [];
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
};

/** Fetch product_variants for a product (by Supabase product id). Returns [] if no Supabase or error. */
export const getVariantsByProductId = async (productId) => {
  if (!supabase || productId == null) return [];
  try {
    const { data, error } = await supabase
      .from('product_variants')
      .select('id, sku, size, color, stock_quantity, price, price_adjustment')
      .eq('product_id', Number(productId))
      .order('size', { ascending: true })
      .order('color', { ascending: true });
    if (error) return [];
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
};

/** Update variant stock (admin). Returns { error } or {}. */
export const updateVariantStock = async (variantId, stockQuantity) => {
  if (!supabase || variantId == null) return { error: 'Not configured' };
  const qty = Math.max(0, Math.floor(Number(stockQuantity) || 0));
  const { error } = await supabase
    .from('product_variants')
    .update({ stock_quantity: qty })
    .eq('id', variantId);
  return error ? { error: error.message } : {};
};

/** Update product stock (admin, for products with no variants). Returns { error } or {}. */
export const updateProductStock = async (productId, stockQuantity) => {
  if (!supabase || productId == null) return { error: 'Not configured' };
  const qty = Math.max(0, Math.floor(Number(stockQuantity) || 0));
  const { error } = await supabase
    .from('products')
    .update({ stock_quantity: qty })
    .eq('id', productId);
  return error ? { error: error.message } : {};
};

/** Insert a new product variant (admin). Returns { error } or { data }. */
export const insertVariant = async (payload) => {
  if (!supabase || !payload?.product_id || !payload?.sku) return { error: 'product_id and sku required' };
  const row = {
    product_id: Number(payload.product_id),
    sku: String(payload.sku).trim(),
    size: payload.size != null ? String(payload.size).trim() || null : null,
    color: payload.color != null ? String(payload.color).trim() || null : null,
    stock_quantity: Math.max(0, Math.floor(Number(payload.stock_quantity) || 0)),
    price_adjustment: payload.price_adjustment != null ? Number(payload.price_adjustment) || 0 : 0,
  };
  const { data, error } = await supabase.from('product_variants').insert(row).select('id').single();
  if (error) return { error: error.message };
  return { data };
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
    const collectionProducts = STATIC_COLLECTION ?? [];
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
  } catch {
    return null;
  }
};

// -----------------------------------------------------------------------------
// Digital Majlis (Heritage page): submissions, wall, comments
// -----------------------------------------------------------------------------

const MAJLIS_BUCKET = 'heritage-majlis';

/** Upload a photo to heritage-majlis storage. Returns public URL or null. */
export async function uploadMajlisImage(file) {
  if (!supabase || !file?.size) return null;
  const ext = (file.name || '').split('.').pop() || 'jpg';
  const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await supabase.storage.from(MAJLIS_BUCKET).upload(path, file, { upsert: false });
  if (error) return null;
  const { data } = supabase.storage.from(MAJLIS_BUCKET).getPublicUrl(path);
  return data?.publicUrl ?? null;
}

/** Insert a new Majlis submission. Returns { data } or { error }. */
export async function insertMajlisSubmission(payload) {
  if (!supabase) return { error: 'Not configured' };
  const email = String(payload.contributor_email ?? '').trim() || null;
  const row = {
    contributor_name: String(payload.contributor_name ?? payload.user_name ?? '').trim() || null,
    contributor_email: email,
    ancestor_name: String(payload.ancestor_name ?? '').trim() || null,
    approximate_dates: payload.approximate_dates != null ? String(payload.approximate_dates).trim() || null : null,
    relation: payload.relation != null ? String(payload.relation).trim() || null : null,
    story_text: String(payload.story_text ?? '').trim() || null,
    image_url: payload.image_url || null,
    lineage_branch: String(payload.lineage_branch ?? payload.family_branch ?? '').trim() || null,
    consent_photo_shared: Boolean(payload.consent_photo_shared),
    parent_id: payload.parent_id || null,
    birth_year: payload.birth_year != null ? (Number(payload.birth_year) || null) : null,
    death_year: payload.death_year != null ? (Number(payload.death_year) || null) : null,
    resting_place: payload.resting_place != null ? String(payload.resting_place).trim() || null : null,
    maiden_name: payload.maiden_name != null ? String(payload.maiden_name).trim() || null : null,
  };
  if (!row.ancestor_name || !row.story_text) return { error: 'Ancestor name and story are required.' };
  if (!row.contributor_email) return { error: 'Email address is required so we can notify you when your story is approved.' };
  const { data, error } = await supabase.from('heritage_majlis').insert(row).select('id').single();
  if (error) return { error: error.message };
  return { data };
}

/** Fetch approved Majlis posts for the wall and tree. Admin post (Tana Baru Spotlight) first, then oldest first. */
export async function getApprovedMajlis() {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('heritage_majlis')
    .select('id, contributor_name, ancestor_name, approximate_dates, relation, story_text, image_url, lineage_branch, is_verified, is_custodian, is_admin_post, parent_id, birth_year, death_year, resting_place, maiden_name, seo_alt_text, created_at')
    .eq('is_approved', true)
    .order('is_admin_post', { ascending: false })
    .order('created_at', { ascending: true });
  if (error || !Array.isArray(data)) return [];
  return data;
}

/** Fetch first approved majlis image URL for Heritage page og:image (prefer community submission, not admin spotlight). */
export async function getFirstApprovedMajlisImageUrl() {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('heritage_majlis')
    .select('image_url')
    .eq('is_approved', true)
    .or('is_admin_post.is.null,is_admin_post.eq.false')
    .not('image_url', 'is', null)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();
  if (error || !data?.image_url) return null;
  return data.image_url;
}

/** Fetch approved ancestor id + name for parent dropdown. Excludes admin posts (e.g. Tana Baru Spotlight). */
export async function getApprovedMajlisForParentDropdown() {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('heritage_majlis')
    .select('id, ancestor_name')
    .eq('is_approved', true)
    .or('is_admin_post.is.null,is_admin_post.eq.false')
    .order('created_at', { ascending: true });
  if (error || !Array.isArray(data)) return [];
  return data;
}

/** Admin: fetch all heritage_majlis rows (requires admin RLS). For approval view. */
export async function getMajlisForAdmin() {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('heritage_majlis')
    .select('id, contributor_name, contributor_email, ancestor_name, approximate_dates, relation, story_text, image_url, lineage_branch, is_approved, is_verified, is_custodian, is_admin_post, parent_id, birth_year, death_year, resting_place, maiden_name, created_at')
    .order('is_admin_post', { ascending: false })
    .order('created_at', { ascending: false });
  if (error || !Array.isArray(data)) return [];
  return data;
}

/** Admin: update a majlis row (is_approved, is_verified, is_custodian). Requires admin RLS. */
export async function updateMajlis(id, updates) {
  if (!supabase || !id) return { error: 'Not configured' };
  const allowed = {};
  if (typeof updates.is_approved === 'boolean') allowed.is_approved = updates.is_approved;
  if (typeof updates.is_verified === 'boolean') allowed.is_verified = updates.is_verified;
  if (typeof updates.is_custodian === 'boolean') allowed.is_custodian = updates.is_custodian;
  if (Object.keys(allowed).length === 0) return { error: 'No allowed fields to update' };
  const { error } = await supabase.from('heritage_majlis').update(allowed).eq('id', id);
  if (error) return { error: error.message };
  return {};
}

/** Subscribe to heritage_majlis changes (e.g. new approvals). Callback receives the new list of approved posts. */
export function subscribeMajlis(onUpdate) {
  if (!supabase || typeof onUpdate !== 'function') return () => {};
  const channel = supabase
    .channel('heritage_majlis_changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'heritage_majlis' }, async () => {
      const list = await getApprovedMajlis();
      onUpdate(list);
    })
    .subscribe();
  return () => {
    supabase.removeChannel(channel);
  };
}

/** Fetch comments for an approved majlis post. */
export async function getMajlisComments(majlisId) {
  if (!supabase || !majlisId) return [];
  const { data, error } = await supabase
    .from('heritage_majlis_comments')
    .select('id, author_name, body, created_at')
    .eq('majlis_id', majlisId)
    .order('created_at', { ascending: true });
  if (error || !Array.isArray(data)) return [];
  return data;
}

/** Add a "Share a Memory" comment. Returns { data } or { error }. */
export async function insertMajlisComment(majlisId, authorName, body) {
  if (!supabase || !majlisId) return { error: 'Not configured' };
  const name = String(authorName ?? '').trim();
  const text = String(body ?? '').trim();
  if (!name || !text) return { error: 'Name and message are required.' };
  const { data, error } = await supabase
    .from('heritage_majlis_comments')
    .insert({ majlis_id: majlisId, author_name: name, body: text })
    .select('id')
    .single();
  if (error) return { error: error.message };
  return { data };
}
