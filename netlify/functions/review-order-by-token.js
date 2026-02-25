/**
 * review-order-by-token
 * GET: ?token=xxx. Returns { orderId, valid } for the review page to show "Order #12345".
 */

const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "").trim();
const serviceRoleKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();
const supabase = supabaseUrl && serviceRoleKey
  ? createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } })
  : null;

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET, OPTIONS" }, body: "" };
  }
  if (event.httpMethod !== "GET") {
    return { statusCode: 405, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ error: "Method Not Allowed" }) };
  }

  const token = (event.queryStringParameters?.token || "").trim();
  if (!token || !supabase) {
    return { statusCode: 400, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ valid: false }) };
  }

  const { data: order, error } = await supabase
    .from("orders")
    .select("id")
    .eq("review_token", token)
    .single();

  if (error || !order) {
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ valid: false }),
    };
  }

  const { data: existing } = await supabase.from("reviews").select("id").eq("order_id", order.id).single();
  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    body: JSON.stringify({
      valid: true,
      orderId: order.id,
      already_submitted: !!existing,
    }),
  };
};
