/**
 * send-review-request
 * Sends post-purchase "How did we do?" email with link to leave a review.
 * Called after order confirmation (e.g. from ITN). Secured by ORDER_CONFIRMATION_SECRET.
 */

const nodemailer = require("nodemailer");
const { createClient } = require("@supabase/supabase-js");
const crypto = require("crypto");

const supabaseUrl = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "").trim();
const serviceRoleKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();
const supabase = supabaseUrl && serviceRoleKey
  ? createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } })
  : null;

function getSiteUrl() {
  return (process.env.VITE_SITE_URL || process.env.URL || "https://alameencaps.com").replace(/\/$/, "");
}

function getReviewRequestHtml(data) {
  const { customerName, orderId, reviewUrl, siteUrl } = data;
  const displayName = (customerName || "Valued Customer").trim() || "Valued Customer";

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body { font-family: Arial, Helvetica, sans-serif; background: #f5f5f5; margin: 0; padding: 24px; color: #1a1a1a; }
    .container { max-width: 560px; margin: 0 auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .banner { background: #0d0d0d; color: #e8dfd2; padding: 20px; text-align: center; font-size: 1.4rem; font-weight: bold; }
    .accent-bar { height: 4px; background: #b8860b; }
    .body { padding: 24px; line-height: 1.7; color: #444; }
    .btn { display: inline-block; margin: 16px 0; padding: 14px 32px; background: #b8860b; color: #fff !important; text-decoration: none; font-weight: bold; border-radius: 8px; }
    .footer { padding: 16px 24px; font-size: 0.8rem; color: #888; border-top: 1px solid #eee; }
  </style>
</head>
<body>
  <div class="container">
    <div class="banner">How did we do?</div>
    <div class="accent-bar"></div>
    <div class="body">
      <p><strong>Hi ${escapeHtml(displayName)},</strong></p>
      <p>Thank you for shopping with us!</p>
      <p>We would love if you could help us and other customers by reviewing the products you recently purchased in <strong>order #${escapeHtml(String(orderId))}</strong>. It only takes a minute and it would really help others.</p>
      <p>Click the button below to leave your review.</p>
      <p>As a thank you, we'll send you a <strong>5% coupon</strong> for your next purchase with us.</p>
      <p style="text-align: center;">
        <a href="${escapeHtml(reviewUrl)}" class="btn">Review</a>
      </p>
      <p>Best wishes,<br>Al-Ameen Caps</p>
    </div>
    <div class="footer">
      This email was sent by Al-Ameen Caps. You received it because you placed an order at <a href="${siteUrl}">${siteUrl.replace(/^https?:\/\//, "")}</a>.
    </div>
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
    .select("id, user_id, customer_email, review_token, review_request_sent_at")
    .eq("id", orderId)
    .single();

  if (orderError || !order) {
    return { statusCode: 404, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ error: "Order not found" }) };
  }

  let emailTo = (order.customer_email || "").trim();
  if (!emailTo && order.user_id) {
    const { data: userData } = await supabase.auth.admin.getUserById(order.user_id);
    emailTo = (userData?.user?.email || "").trim();
  }
  if (!emailTo) {
    return { statusCode: 200, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ok: true, message: "No customer email — review request not sent." }) };
  }

  let customerName = "Valued Customer";
  if (order.user_id) {
    const { data: profile } = await supabase.from("profiles").select("first_name, last_name").eq("id", order.user_id).single();
    customerName = [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") || customerName;
  }

  let reviewToken = order.review_token;
  if (!reviewToken) {
    reviewToken = crypto.randomUUID();
    await supabase.from("orders").update({ review_token: reviewToken }).eq("id", order.id);
  }

  const siteUrl = getSiteUrl();
  const reviewUrl = `${siteUrl}/review?token=${encodeURIComponent(reviewToken)}`;

  const emailHost = process.env.EMAIL_HOST || "smtp.gmail.com";
  const emailPort = parseInt(process.env.EMAIL_PORT || "587", 10);
  const emailUser = process.env.EMAIL_USER || "";
  const emailPass = process.env.EMAIL_PASS || "";

  if (!emailUser || !emailPass) {
    return { statusCode: 200, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ok: true, message: "Email not configured — review request not sent." }) };
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
      subject: "Review your experience and receive a 5% coupon — Al-Ameen Caps",
      html: getReviewRequestHtml({
        customerName,
        orderId: order.id,
        reviewUrl,
        siteUrl,
      }),
      text: `Hi ${customerName},\n\nThank you for shopping with us! We'd love your review for order #${order.id}. It only takes a minute and we'll send you a 5% coupon for your next purchase.\n\nLeave your review: ${reviewUrl}\n\nBest wishes,\nAl-Ameen Caps`,
    });
    await supabase.from("orders").update({ review_request_sent_at: new Date().toISOString() }).eq("id", order.id);
    return { statusCode: 200, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ok: true, message: "Review request sent." }) };
  } catch (err) {
    console.error("send-review-request: email failed", err);
    return { statusCode: 500, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ error: "Failed to send email." }) };
  }
};
