/**
 * submit-review
 * POST: token, rating, review_text. Validates token, ensures one review per order, inserts review.
 * Returns success and coupon code (e.g. REVIEW5 for 5% off next purchase).
 */

const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "").trim();
const serviceRoleKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();
const supabase = supabaseUrl && serviceRoleKey
  ? createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } })
  : null;

const COUPON_CODE = process.env.REVIEW_COUPON_CODE || "REVIEW5";

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "Content-Type", "Access-Control-Allow-Methods": "POST, OPTIONS" }, body: "" };
  }
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ error: "Method Not Allowed" }) };
  }

  let body;
  try {
    body = event.body ? JSON.parse(event.body) : {};
  } catch (_) {
    return { statusCode: 400, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ error: "Invalid JSON" }) };
  }

  const token = (body.token || "").trim();
  const rating = body.rating != null ? parseInt(body.rating, 10) : NaN;
  const reviewText = (body.review_text || "").trim();

  if (!token || !supabase) {
    return { statusCode: 400, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ error: "Missing token or server not configured" }) };
  }
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return { statusCode: 400, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ error: "Rating must be 1–5" }) };
  }

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("id, user_id, customer_email")
    .eq("review_token", token)
    .single();

  if (orderError || !order) {
    return { statusCode: 400, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ error: "Invalid or expired link" }) };
  }

  const { data: existing } = await supabase.from("reviews").select("id").eq("order_id", order.id).single();
  if (existing) {
    return { statusCode: 200, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ok: true, already_submitted: true, coupon_code: COUPON_CODE }) };
  }

  let customerName = null;
  let customerEmail = (order.customer_email || "").trim() || null;
  if (order.user_id) {
    const { data: profile } = await supabase.from("profiles").select("first_name, last_name").eq("id", order.user_id).single();
    customerName = [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") || null;
    if (!customerEmail) {
      const { data: userData } = await supabase.auth.admin.getUserById(order.user_id);
      customerEmail = (userData?.user?.email || "").trim() || null;
    }
  }

  const { error: insertError } = await supabase.from("reviews").insert({
    order_id: order.id,
    rating,
    review_text: reviewText || null,
    customer_name: customerName,
    customer_email: customerEmail,
  });

  if (insertError) {
    console.error("submit-review: insert failed", insertError);
    return { statusCode: 500, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ error: "Failed to save review" }) };
  }

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    body: JSON.stringify({ ok: true, coupon_code: COUPON_CODE }),
  };
};
