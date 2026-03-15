/**
 * send-ready-for-dispatch
 * Admin-only: Sends "Ready for Dispatch" email notification for orders that have passed QC.
 * Bulk operation: Can process multiple order IDs.
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

function getReadyForDispatchEmailHtml(data) {
  const { customerName, orderId, orderDate, siteUrl } = data;
  const trackingPageUrl = `${siteUrl}/track/${orderId}`;
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
    <p class="heading accent">YOUR ORDER IS READY FOR DISPATCH</p>
    <p class="body"><strong>Hello ${displayName},</strong></p>
    <p class="body">Great news! Your Al-Ameen Caps order has passed quality control and is now ready for dispatch from our Cape Town facility.</p>
    <p class="body">Your order will be shipped via Fastway Couriers, and you will receive tracking details by email once it has been dispatched. If you have any questions, visit <a href="${siteUrl}">${siteUrl.replace(/^https?:\/\//, "")}</a> or contact us.</p>
    <div class="order-details">
      <dl>
        <dt>Order #</dt>
        <dd>${orderId}</dd>
        <dt>Order Date</dt>
        <dd>${orderDateFormatted}</dd>
      </dl>
    </div>
    <p class="body">You can view your order status at: <a href="${trackingPageUrl}">${trackingPageUrl}</a></p>
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

  const { order_ids: orderIds } = body;
  if (!Array.isArray(orderIds) || orderIds.length === 0) {
    return jsonRes(400, { error: "order_ids array is required" });
  }

  const emailHost = process.env.EMAIL_HOST || "smtp.gmail.com";
  const emailPort = parseInt(process.env.EMAIL_PORT || "587", 10);
  const emailUser = process.env.EMAIL_USER || "";
  const emailPass = process.env.EMAIL_PASS || "";

  if (!emailUser || !emailPass) {
    return jsonRes(200, { ok: true, message: "Email not configured — no notifications sent.", processed: 0 });
  }

  const transporter = nodemailer.createTransport({
    host: emailHost,
    port: emailPort,
    secure: emailPort === 465,
    auth: { user: emailUser, pass: emailPass },
  });

  const siteUrl = getSiteUrl();
  const results = [];
  let successCount = 0;
  let failCount = 0;

  for (const orderId of orderIds) {
    try {
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .select("id, user_id, status, created_at")
        .eq("id", orderId)
        .single();

      if (orderError || !order) {
        results.push({ orderId, status: "not_found", error: "Order not found" });
        failCount++;
        continue;
      }

      if (order.status !== "PAID") {
        results.push({ orderId, status: "skipped", error: `Order status is ${order.status}, expected PAID` });
        continue;
      }

      const { data: userData } = await supabase.auth.admin.getUserById(order.user_id);
      const emailTo = userData?.user?.email;
      if (!emailTo) {
        results.push({ orderId, status: "skipped", error: "Customer email not found" });
        continue;
      }

      const { data: profileData } = await supabase
        .from("profiles")
        .select("first_name, last_name")
        .eq("id", order.user_id)
        .single();

      const customerName = [profileData?.first_name, profileData?.last_name].filter(Boolean).join(" ") || "Valued Customer";

      // Update order admin_notes to indicate it's ready for dispatch (Stage 3)
      await supabase
        .from("orders")
        .update({ admin_notes: (order.admin_notes || "") + (order.admin_notes ? "\n" : "") + `[${new Date().toISOString()}] Ready for Dispatch - Stage 3` })
        .eq("id", orderId);

      await transporter.sendMail({
        from: `"Al-Ameen Caps" <${emailUser}>`,
        to: emailTo,
        subject: "Your Al-Ameen Caps order is ready for dispatch",
        html: getReadyForDispatchEmailHtml({
          customerName,
          orderId,
          orderDate: order.created_at,
          siteUrl,
        }),
        text: `Hello ${customerName},\n\nGreat news! Your Al-Ameen Caps order has passed quality control and is now ready for dispatch from our Cape Town facility.\n\nOrder #: ${orderId}\nView your order status: ${siteUrl}/track/${orderId}\n\nYou will receive tracking details by email once your order has been dispatched.\n\nJazakallah khair — The Al-Ameen Caps Team`,
      });

      results.push({ orderId, status: "sent" });
      successCount++;
    } catch (err) {
      console.error(`send-ready-for-dispatch: failed for order ${orderId}`, err);
      results.push({ orderId, status: "error", error: err.message });
      failCount++;
    }
  }

  return jsonRes(200, {
    ok: true,
    message: `Processed ${orderIds.length} orders. ${successCount} emails sent, ${failCount} failed.`,
    processed: successCount,
    failed: failCount,
    results,
  });
};
