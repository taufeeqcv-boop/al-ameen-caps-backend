/**
 * get-all-reviews
 * Admin-only: Returns all rows from the Supabase reviews table.
 * GET with Authorization: Bearer <supabase_access_token>. Used by Admin Reviews dashboard.
 */

const { createClient } = require("@supabase/supabase-js");

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

function jsonRes(status, body) {
  return {
    statusCode: status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    body: typeof body === "string" ? body : JSON.stringify(body),
  };
}

const supabaseUrl = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "").trim();
const anonKey = (process.env.VITE_SUPABASE_ANON_KEY || "").trim();
const serviceRoleKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();
const supabaseAdmin = supabaseUrl && serviceRoleKey
  ? createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } })
  : null;
const supabaseAuth = supabaseUrl && anonKey
  ? createClient(supabaseUrl, anonKey, { auth: { persistSession: false } })
  : null;

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return { statusCode: 200, headers: CORS_HEADERS, body: "" };
  if (event.httpMethod !== "GET") return jsonRes(405, { error: "Method Not Allowed" });

  const authHeader = event.headers.authorization || event.headers.Authorization;
  const token = authHeader?.replace(/^Bearer\s+/i, "");
  if (!token || !supabaseAuth) return jsonRes(401, { error: "Unauthorized" });

  const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(token);
  if (authError || !user) return jsonRes(401, { error: "Invalid or expired session" });

  const { data: profile } = await supabaseAuth.from("profiles").select("is_admin").eq("id", user.id).single();
  if (!profile?.is_admin) return jsonRes(403, { error: "Admin access required" });

  if (!supabaseAdmin) return jsonRes(500, { error: "Server not configured" });

  const { data: reviews, error: fetchError } = await supabaseAdmin
    .from("reviews")
    .select("id, order_id, rating, review_text, customer_name, customer_email, created_at")
    .order("created_at", { ascending: false });

  if (fetchError) return jsonRes(500, { error: fetchError.message });

  return jsonRes(200, { reviews: reviews ?? [] });
};
