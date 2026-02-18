/**
 * send-shipping-notification
 * Admin-only: Marks order as SHIPPED, stores Fastway tracking data, sends "order on its way" email.
 * Requires Authorization: Bearer <supabase_access_token> from an admin user.
 */

const nodemailer = require("nodemailer");
const { createClient } = require("@supabase/supabase-js");

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function withCors(res) {
  return { ...res, headers: { ...CORS_HEADERS, ...(res.headers || {}) } };
}

function jsonRes(status, body) {
  return withCors({
    statusCode: status,
    headers: { "Content-Type": "application/json" },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

const supabaseUrl = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "").trim();
const serviceRoleKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();
const supabase = supabaseUrl && serviceRoleKey
  ? createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } })
  : null;

function getSiteUrl() {
  return (process.env.VITE_SITE_URL || process.env.URL || "https://alameencaps.com").replace(/\/$/, "");
}

function getShippingEmailHtml(data) {
  const { customerName, orderId, orderDate, trackingNumber, trackingUrl, numberOfBoxes, siteUrl } = data;
  const trackingPageUrl = `${siteUrl}/track/${orderId}`;
  const trackLink = trackingUrl || trackingPageUrl;
  const orderDateFormatted = orderDate ? new Date(orderDate).toLocaleDateString("en-ZA", { day: "2-digit", month: "short", year: "2-digit" }) : "—";
  const displayName = (customerName || "Valued Customer").toUpperCase();

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
    .order-details { text-align: left; max-width: 360px; margin: 24px auto; padding: 16px; background: #f9f9f9; border-radius: 8px; }
    .order-details dt { font-weight: bold; color: #333; margin-top: 8px; }
    .order-details dd { margin: 0 0 0 8px; }
    .order-details a { color: #2563eb; text-decoration: underline; }
    .footer { margin-top: 32px; font-size: 0.8rem; color: #888; }
  </style>
</head>
<body>
  <div class="container">
    <p style="margin: 0; font-size: 1.2rem; font-weight: 600; color: #1a1a1a;">Al-Ameen Caps</p>
    <div class="divider"></div>
    <p class="heading accent">YOUR ORDER IS ON ITS WAY!</p>
    <p class="body"><strong>Hello ${displayName},</strong></p>
    <p class="body">Great news! Your Al-Ameen Caps order has been picked, packed and dispatched by our team. It is now on its way via Fastway Couriers.</p>
    <p class="body">You can track your parcel at any time using the link below. If you have any questions, visit <a href="${siteUrl}">${siteUrl.replace(/^https?:\/\//, "")}</a> or contact us.</p>
    <div class="order-details">
      <dl>
        <dt>Order #</dt>
        <dd>${orderId}</dd>
        <dt>Order Date</dt>
        <dd>${orderDateFormatted}</dd>
        <dt>Tracking #</dt>
        <dd><a href="${trackLink}">${trackingNumber || "—"}</a></dd>
        <dt>Number of Boxes</dt>
        <dd>${numberOfBoxes}</dd>
      </dl>
    </div>
    <p class="body"><a href="${trackLink}" style="color: #b8860b; font-weight: bold;">Track your parcel →</a></p>
    <p class="body">You can also view your order status at: <a href="${trackingPageUrl}">${trackingPageUrl}</a></p>
    <p class="footer">© ${new Date().getFullYear()} Al-Ameen Caps. All rights reserved.</p>
  </div>
</body>
</html>
  `.trim();
}

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return withCors({ statusCode: 200, body: "" });
  }
  if (event.httpMethod !== "POST") {
    return jsonRes(405, { error: "Method Not Allowed" });
  }

  const authHeader = event.headers.authorization || event.headers.Authorization;
  const token = authHeader?.replace(/^Bearer\s+/i, "");
  if (!token || !supabase) {
    return jsonRes(401, { error: "Unauthorized" });
  }

  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) {
    return jsonRes(401, { error: "Invalid or expired session" });
  }

  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single();
  if (!profile?.is_admin) {
    return jsonRes(403, { error: "Admin access required" });
  }

  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch {
    return jsonRes(400, { error: "Invalid JSON" });
  }

  const { order_id: orderId, tracking_number: trackingNumber, number_of_boxes: numberOfBoxes, tracking_url: trackingUrl } = body;
  if (!orderId || !trackingNumber) {
    return jsonRes(400, { error: "order_id and tracking_number are required" });
  }

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("id, user_id, status, created_at")
    .eq("id", orderId)
    .single();

  if (orderError || !order) {
    return jsonRes(404, { error: "Order not found" });
  }

  if (order.status === "CANCELLED") {
    return jsonRes(400, { error: "Cannot ship a cancelled order" });
  }

  const shippingData = {
    tracking_number: String(trackingNumber).trim(),
    number_of_boxes: Math.max(1, parseInt(String(numberOfBoxes || 1), 10) || 1),
    tracking_url: trackingUrl ? String(trackingUrl).trim() : null,
  };
  if (!shippingData.tracking_url && !shippingData.tracking_number.startsWith("http")) {
    shippingData.tracking_url = `https://www.fastway.co.za/our-services/track-your-parcel/?label_no=${encodeURIComponent(shippingData.tracking_number)}`;
  }

  const { error: updateError } = await supabase
    .from("orders")
    .update({ status: "SHIPPED", shipping_data: shippingData })
    .eq("id", orderId);

  if (updateError) {
    console.error("send-shipping-notification: order update failed", updateError);
    return jsonRes(500, { error: "Failed to update order" });
  }

  const { data: userData } = await supabase.auth.admin.getUserById(order.user_id);
  const emailTo = userData?.user?.email;
  if (!emailTo) {
    return jsonRes(200, { ok: true, message: "Order marked as shipped. Customer email not found — no email sent." });
  }

  const { data: profileData } = await supabase
    .from("profiles")
    .select("first_name, last_name")
    .eq("id", order.user_id)
    .single();

  const customerName = [profileData?.first_name, profileData?.last_name].filter(Boolean).join(" ") || "Valued Customer";
  const siteUrl = getSiteUrl();

  const emailHost = process.env.EMAIL_HOST || "smtp.gmail.com";
  const emailPort = parseInt(process.env.EMAIL_PORT || "587", 10);
  const emailUser = process.env.EMAIL_USER || "";
  const emailPass = process.env.EMAIL_PASS || "";

  if (!emailUser || !emailPass) {
    return jsonRes(200, { ok: true, message: "Order marked as shipped. Email not configured — no notification sent." });
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
      subject: "Your Al-Ameen Caps order is on its way!",
      html: getShippingEmailHtml({
        customerName,
        orderId,
        orderDate: order.created_at,
        trackingNumber: shippingData.tracking_number,
        trackingUrl: shippingData.tracking_url,
        numberOfBoxes: shippingData.number_of_boxes,
        siteUrl,
      }),
      text: `Hello ${customerName},\n\nGreat news! Your Al-Ameen Caps order has been dispatched via Fastway Couriers.\n\nOrder #: ${orderId}\nTracking #: ${shippingData.tracking_number}\nTrack your parcel: ${shippingData.tracking_url || `${siteUrl}/track/${orderId}`}\n\nJazakallah khair — The Al-Ameen Caps Team`,
    });

    return jsonRes(200, { ok: true, message: "Order shipped and customer notified." });
  } catch (err) {
    console.error("send-shipping-notification: email failed", err);
    return jsonRes(500, { error: "Order was updated but email failed to send." });
  }
};
