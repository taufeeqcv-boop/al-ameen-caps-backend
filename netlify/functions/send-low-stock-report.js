/**
 * send-low-stock-report
 * Admin-only: Sends an email with current low-stock products to ADMIN_EMAIL or the requesting admin.
 * POST with Authorization: Bearer <supabase_access_token>.
 * Optional body: { threshold: number } (default 5).
 */

const nodemailer = require("nodemailer");
const { createClient } = require("@supabase/supabase-js");

const CORS_HEADERS = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "Content-Type, Authorization", "Access-Control-Allow-Methods": "POST, OPTIONS" };

function jsonRes(status, body) {
  return { statusCode: status, headers: { ...CORS_HEADERS, "Content-Type": "application/json" }, body: typeof body === "string" ? body : JSON.stringify(body) };
}

const supabaseUrl = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "").trim();
const anonKey = (process.env.VITE_SUPABASE_ANON_KEY || "").trim();
const serviceRoleKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();
const supabaseAdmin = supabaseUrl && serviceRoleKey ? createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } }) : null;
const supabaseAuth = supabaseUrl && anonKey ? createClient(supabaseUrl, anonKey, { auth: { persistSession: false } }) : null;

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return { statusCode: 200, headers: CORS_HEADERS, body: "" };
  if (event.httpMethod !== "POST") return jsonRes(405, { error: "Method Not Allowed" });

  const authHeader = event.headers.authorization || event.headers.Authorization;
  const token = authHeader?.replace(/^Bearer\s+/i, "");
  if (!token || !supabaseAuth) return jsonRes(401, { error: "Unauthorized" });

  const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(token);
  if (authError || !user) return jsonRes(401, { error: "Invalid or expired session" });

  const { data: profile } = await supabaseAuth.from("profiles").select("is_admin").eq("id", user.id).single();
  if (!profile?.is_admin) return jsonRes(403, { error: "Admin access required" });

  const threshold = (event.body && JSON.parse(event.body).threshold) ?? 5;
  const numThreshold = Math.max(0, parseInt(threshold, 10) || 5);

  if (!supabaseAdmin) return jsonRes(500, { error: "Server not configured" });

  const { data: lowStock, error: fetchError } = await supabaseAdmin
    .from("products")
    .select("id, sku, name, stock_quantity")
    .lt("stock_quantity", numThreshold)
    .eq("is_active", true)
    .order("stock_quantity", { ascending: true });

  if (fetchError) return jsonRes(500, { error: fetchError.message });

  const toEmail = process.env.ADMIN_EMAIL || user.email;
  if (!toEmail) return jsonRes(200, { ok: true, message: "Low-stock list generated. No admin email configured to send to." });

  const emailUser = process.env.EMAIL_USER || "";
  const emailPass = process.env.EMAIL_PASS || "";
  if (!emailUser || !emailPass) return jsonRes(200, { ok: true, message: "Low-stock list generated. Email not configured." });

  const rows = (lowStock || []).map((p) => `${p.sku}\t${p.name}\t${p.stock_quantity}`).join("\n");
  const html = `
    <p><strong>Low-stock report</strong> (products with stock &lt; ${numThreshold})</p>
    <table border="1" cellpadding="6" cellspacing="0" style="border-collapse:collapse">
      <tr><th>SKU</th><th>Name</th><th>Stock</th></tr>
      ${(lowStock || []).map((p) => `<tr><td>${escapeHtml(p.sku)}</td><td>${escapeHtml(p.name)}</td><td>${p.stock_quantity}</td></tr>`).join("")}
    </table>
    ${(lowStock || []).length === 0 ? "<p>No low-stock products.</p>" : ""}
    <p style="margin-top:16px;color:#666;font-size:12px">Al-Ameen Caps Admin · ${new Date().toISOString().slice(0, 10)}</p>
  `;
  function escapeHtml(s) { return String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || "smtp.gmail.com",
      port: parseInt(process.env.EMAIL_PORT || "587", 10),
      secure: process.env.EMAIL_PORT === "465",
      auth: { user: emailUser, pass: emailPass },
    });
    await transporter.sendMail({
      from: `"Al-Ameen Caps" <${emailUser}>`,
      to: toEmail,
      subject: `Low-stock report (${(lowStock || []).length} products) — Al-Ameen Caps`,
      html,
      text: `Low-stock report (stock < ${numThreshold})\n\nSKU\tName\tStock\n${rows}`,
    });
    return jsonRes(200, { ok: true, message: "Report sent." });
  } catch (err) {
    console.error("send-low-stock-report:", err);
    return jsonRes(500, { error: "Failed to send email." });
  }
};
