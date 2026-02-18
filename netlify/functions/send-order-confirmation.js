/**
 * send-order-confirmation
 * Called after PayFast ITN marks order PAID. Sends "Thank you for your order" email.
 * Secured by ORDER_CONFIRMATION_SECRET (optional; if set, required in X-Internal-Secret header or body.secret).
 */

const nodemailer = require("nodemailer");
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "").trim();
const serviceRoleKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();
const supabase = supabaseUrl && serviceRoleKey
  ? createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } })
  : null;

function getSiteUrl() {
  return (process.env.VITE_SITE_URL || process.env.URL || "https://alameencaps.com").replace(/\/$/, "");
}

function getOrderConfirmationHtml(data) {
  const { customerName, orderId, orderDate, totalAmount, items, siteUrl } = data;
  const orderDateFormatted = orderDate ? new Date(orderDate).toLocaleDateString("en-ZA", { day: "2-digit", month: "short", year: "numeric" }) : "—";
  const displayName = (customerName || "Valued Customer").trim() || "Valued Customer";
  const itemsRows = (items || []).map((i) => `<tr><td style="padding:6px 8px;">${escapeHtml(i.product_name)}</td><td style="padding:6px 8px;">${i.quantity}</td><td style="padding:6px 8px;">R ${Number(i.unit_price).toFixed(2)}</td></tr>`).join("");
  const totalFormatted = totalAmount != null ? `R ${Number(totalAmount).toFixed(2)}` : "—";

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body { font-family: Arial, Helvetica, sans-serif; background: #ffffff; margin: 0; padding: 24px; color: #1a1a1a; }
    .container { max-width: 560px; margin: 0 auto; text-align: center; }
    .divider { border-top: 1px solid #e5e5e5; margin: 20px 0; }
    .heading { font-size: 1.5rem; font-weight: bold; color: #1a1a1a; margin: 20px 0; }
    .accent { color: #b8860b; }
    .body { text-align: center; line-height: 1.7; color: #444; }
    .order-details { text-align: left; max-width: 100%; margin: 24px auto; padding: 16px; background: #f9f9f9; border-radius: 8px; }
    table { width: 100%; border-collapse: collapse; }
    .footer { margin-top: 32px; font-size: 0.8rem; color: #888; }
  </style>
</head>
<body>
  <div class="container">
    <p style="margin: 0; font-size: 1.2rem; font-weight: 600; color: #1a1a1a;">Al-Ameen Caps</p>
    <div class="divider"></div>
    <p class="heading accent">Thank you for your order</p>
    <p class="body"><strong>Hello ${escapeHtml(displayName)},</strong></p>
    <p class="body">We have received your payment. Your order is being prepared and we will notify you when it is on its way.</p>
    <div class="order-details">
      <p style="margin:0 0 8px 0; font-weight: bold;">Order #${escapeHtml(String(orderId))}</p>
      <p style="margin:0 0 12px 0; color:#666;">${orderDateFormatted}</p>
      <table>
        <thead><tr><th style="text-align:left; padding:6px 8px;">Item</th><th style="text-align:center; padding:6px 8px;">Qty</th><th style="text-align:right; padding:6px 8px;">Price</th></tr></thead>
        <tbody>${itemsRows}</tbody>
      </table>
      <p style="margin:12px 0 0 0; font-weight: bold;">Total: ${totalFormatted}</p>
    </div>
    <p class="body">Browse more at <a href="${siteUrl}">${siteUrl.replace(/^https?:\/\//, "")}</a> or contact us if you have any questions.</p>
    <p class="footer">Jazakallah khair — Al-Ameen Caps</p>
  </div>
</body>
</html>
  `.trim();
}

function escapeHtml(s) {
  if (s == null) return "";
  const str = String(s);
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "Content-Type, X-Internal-Secret", "Access-Control-Allow-Methods": "POST, OPTIONS" }, body: "" };
  }
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ error: "Method Not Allowed" }) };
  }

  const secret = process.env.ORDER_CONFIRMATION_SECRET || "";
  if (secret) {
    const headerSecret = event.headers["x-internal-secret"] || event.headers["X-Internal-Secret"];
    let bodySecret = "";
    try {
      const b = event.body ? JSON.parse(event.body) : {};
      bodySecret = b.secret || "";
    } catch (_) {}
    if (headerSecret !== secret && bodySecret !== secret) {
      return { statusCode: 401, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ error: "Unauthorized" }) };
    }
  }

  let orderId;
  try {
    const b = event.body ? JSON.parse(event.body) : {};
    orderId = b.order_id || b.orderId;
  } catch (_) {
    return { statusCode: 400, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ error: "Invalid JSON" }) };
  }
  if (!orderId || !supabase) {
    return { statusCode: 400, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ error: "Missing order_id or Supabase not configured" }) };
  }

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("id, user_id, total_amount, created_at")
    .eq("id", orderId)
    .single();

  if (orderError || !order) {
    return { statusCode: 404, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ error: "Order not found" }) };
  }

  const { data: userData } = await supabase.auth.admin.getUserById(order.user_id);
  const emailTo = userData?.user?.email;
  if (!emailTo) {
    return { statusCode: 200, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ok: true, message: "Customer email not found — no email sent." }) };
  }

  const { data: profileData } = await supabase.from("profiles").select("first_name, last_name").eq("id", order.user_id).single();
  const customerName = [profileData?.first_name, profileData?.last_name].filter(Boolean).join(" ") || "Valued Customer";

  const { data: orderItems } = await supabase.from("order_items").select("product_name, quantity, unit_price").eq("order_id", order.id);
  const items = orderItems || [];

  const siteUrl = getSiteUrl();
  const emailHost = process.env.EMAIL_HOST || "smtp.gmail.com";
  const emailPort = parseInt(process.env.EMAIL_PORT || "587", 10);
  const emailUser = process.env.EMAIL_USER || "";
  const emailPass = process.env.EMAIL_PASS || "";

  if (!emailUser || !emailPass) {
    return { statusCode: 200, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ok: true, message: "Email not configured — no confirmation sent." }) };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: emailHost,
      port: emailPort,
      secure: emailPort === 465,
      auth: { user: emailUser, pass: emailPass },
    });
    await transporter.sendMail({
      from: `"Al-Ameen Caps" <${emailUser}>`,
      to: emailTo,
      subject: "Thank you for your order — Al-Ameen Caps",
      html: getOrderConfirmationHtml({
        customerName,
        orderId: order.id,
        orderDate: order.created_at,
        totalAmount: order.total_amount,
        items,
        siteUrl,
      }),
      text: `Hello ${customerName},\n\nThank you for your order (${orderId}). We have received your payment and will notify you when it ships.\n\nTotal: R ${Number(order.total_amount).toFixed(2)}\n\nJazakallah khair — Al-Ameen Caps`,
    });
    return { statusCode: 200, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ok: true, message: "Order confirmation sent." }) };
  } catch (err) {
    console.error("send-order-confirmation: email failed", err);
    return { statusCode: 500, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ error: "Failed to send email." }) };
  }
};
