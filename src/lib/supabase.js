import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Only create client when env vars are set (avoids crash and blank white screen when not configured)
let supabase = null;
if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
}

export { supabase };

// Fetch All Products (Ordered by Price High-to-Low)
export const getProducts = async () => {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('price', { ascending: false });
    if (error) {
      console.error("Supabase Error:", error);
      return [];
    }
    const list = data ?? [];
    return list.map((p) => ({
      ...p,
      price: Number(p.price) || 0,
      quantityAvailable: Number(p.quantity_available ?? p.quantityAvailable) || 0,
    }));
  } catch (err) {
    console.error("Supabase getProducts:", err);
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
    return {
      ...data,
      price: Number(data.price) || 0,
      quantityAvailable: Number(data.quantity_available ?? data.quantityAvailable) || 0,
    };
  } catch (err) {
    console.error("Supabase getProductById:", err);
    return null;
  }
};
