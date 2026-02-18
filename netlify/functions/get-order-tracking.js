/**
 * get-order-tracking
 * Public: Returns minimal order tracking info for the /track/:orderId page.
 * No auth required. Only returns status, tracking details, customer first name for greeting.
 */

const { createClient } = require("@supabase/supabase-js");

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

function withCors(res) {
  return { ...res, headers: { ...CORS_HEADERS, ...(res.headers || {}) } };
}

const supabaseUrl = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "").trim();
const serviceRoleKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();
const supabase = supabaseUrl && serviceRoleKey
  ? createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } })
  : null;

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return withCors({ statusCode: 200, body: "" });
  }
  if (event.httpMethod !== "GET") {
    return withCors({ statusCode: 405, body: "Method Not Allowed" });
  }

  const orderId = event.queryStringParameters?.orderId || event.path?.replace(/.*orderId=/, "").split("&")[0];
  if (!orderId) {
    return withCors({
      statusCode: 400,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "orderId required" }),
    });
  }

  if (!supabase) {
    return withCors({
      statusCode: 503,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Service not configured" }),
    });
  }

  const { data: order, error } = await supabase
    .from("orders")
    .select(`
      id,
      status,
      created_at,
      shipping_data,
      profiles ( first_name, last_name )
    `)
    .eq("id", orderId)
    .single();

  if (error || !order) {
    return withCors({
      statusCode: 404,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Order not found" }),
    });
  }

  const p = order.profiles || {};
  const customerName = [p.first_name, p.last_name].filter(Boolean).join(" ") || "Valued Customer";
  const sd = order.shipping_data || {};

  const payload = {
    order_id: order.id,
    status: order.status,
    order_date: order.created_at,
    customer_name: customerName,
    tracking_number: sd.tracking_number || null,
    tracking_url: sd.tracking_url || null,
    number_of_boxes: sd.number_of_boxes ?? 1,
  };

  return withCors({
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
};
