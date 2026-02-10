/**
 * GET /.netlify/functions/get-products
 * Returns products from Supabase with CORS so https://www.alameencaps.com (or any origin) can fetch.
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

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return withCors({ statusCode: 200, body: "" });
  }
  if (event.httpMethod !== "GET") {
    return withCors({ statusCode: 405, body: "Method Not Allowed" });
  }

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    return withCors({
      statusCode: 503,
      body: JSON.stringify({ error: "Products service not configured" }),
    });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });

  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("price", { ascending: false });
    if (error) {
      console.error("[get-products]", error?.message ?? error);
      return withCors({
        statusCode: 502,
        body: JSON.stringify({ error: "Failed to fetch products" }),
      });
    }
    return withCors({
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data ?? []),
    });
  } catch (err) {
    console.error("[get-products]", err?.message ?? err);
    return withCors({
      statusCode: 500,
      body: JSON.stringify({ error: "Internal server error" }),
    });
  }
};
