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
  const orderId = (event.queryStringParameters?.orderId || "").trim();
  
  if ((!token && !orderId) || !supabase) {
    return { statusCode: 400, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ valid: false }) };
  }

  let query = supabase.from("orders").select("id, user_id, customer_email");
  
  if (token) {
    query = query.eq("review_token", token);
  } else if (orderId) {
    query = query.eq("id", orderId);
  }
  
  const { data: order, error } = await query.single();

  if (error || !order) {
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ valid: false }),
    };
  }

  const { data: existing } = await supabase.from("reviews").select("id").eq("order_id", order.id).single();

  // Get customer name
  let customerName = "Valued Customer";
  if (order.user_id) {
    const { data: profile } = await supabase.from("profiles").select("first_name, last_name").eq("id", order.user_id).single();
    customerName = [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") || customerName;
  }

  // Get first product name from order items
  let productName = null;
  const { data: orderItems } = await supabase
    .from("order_items")
    .select("product_name")
    .eq("order_id", order.id)
    .limit(1)
    .single();
  if (orderItems?.product_name) {
    productName = orderItems.product_name;
  }

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    body: JSON.stringify({
      valid: true,
      orderId: order.id,
      customerName,
      productName,
      already_submitted: !!existing,
    }),
  };
};
