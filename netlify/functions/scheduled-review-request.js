/**
 * scheduled-review-request
 * Netlify Scheduled Function: Runs daily at 07:00 UTC
 * 
 * Logic:
 * - Query orders with status 'SHIPPED' where updated_at is exactly 5 days ago
 * - Send branded "Heritage Connection" email with link to /review page
 * - Set review_requested = true to prevent duplicate emails
 * 
 * Schedule: Configured in netlify.toml
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

function escapeHtml(s) {
  if (s == null) return "";
  const str = String(s);
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/**
 * Heritage Connection template: Links to /review page with orderId
 * Emphasizes Mumbai-to-Cape Town heritage and craftsmanship
 */
function getHeritageConnectionEmailHtml(data) {
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
    .heritage-note { background: #f9f9f9; padding: 16px; border-left: 4px solid #b8860b; margin: 20px 0; font-style: italic; color: #555; }
    .btn { display: inline-block; margin: 16px 0; padding: 14px 32px; background: #b8860b; color: #fff !important; text-decoration: none; font-weight: bold; border-radius: 8px; font-size: 1rem; }
    .footer { padding: 16px 24px; font-size: 0.8rem; color: #888; border-top: 1px solid #eee; }
  </style>
</head>
<body>
  <div class="container">
    <div class="banner">Heritage Connection — Thank You</div>
    <div class="accent-bar"></div>
    <div class="body">
      <p><strong>Assalamu alaikum ${escapeHtml(displayName)},</strong></p>
      <p>We hope your order <strong>#${escapeHtml(String(orderId))}</strong> has arrived safely and that you are enjoying your handcrafted piece.</p>
      <p>Our Kufis, Taqiyahs, and Fez are made with care for <strong>Jumu'ah</strong>, <strong>Salah</strong>, and <strong>Eid</strong> — rooted in <strong>Cape Malay</strong> and <strong>Bo-Kaap</strong> heritage. Each piece is <strong>handcrafted in Mumbai</strong> and <strong>shipped from Cape Town</strong>, connecting our global community.</p>
      <div class="heritage-note">
        <p style="margin: 0;">"Al-Ameen Caps represents a legacy of craftsmanship and heritage. Thank you for being part of our story."</p>
      </div>
      <p>Your experience helps others discover quality Islamic headwear. If you have a moment, we would be grateful if you could share your thoughts:</p>
      <p style="text-align: center;">
        <a href="${escapeHtml(reviewUrl)}" class="btn">Leave Your Review</a>
      </p>
      <p>As a thank you, we'll send you a <strong>5% coupon</strong> for your next purchase.</p>
      <p>Jazakallah khair for choosing Al-Ameen Caps. We look forward to serving you again.</p>
      <p>Best wishes,<br>The Al-Ameen Caps Team</p>
    </div>
    <div class="footer">
      This email was sent by Al-Ameen Caps. You received it because you placed an order at <a href="${siteUrl}">${siteUrl.replace(/^https?:\/\//, "")}</a>.
    </div>
  </div>
</body>
</html>
  `.trim();
}

function getHeritageConnectionEmailText(data) {
  const { customerName, orderId, reviewUrl } = data;
  const name = (customerName || "Valued Customer").trim() || "Valued Customer";
  return `Assalamu alaikum ${name},

We hope your order #${orderId} has arrived safely. Our handcrafted Kufis, Taqiyahs, and Fez are made for Jumu'ah, Salah, and Eid — rooted in Cape Malay and Bo-Kaap heritage. Each piece is handcrafted in Mumbai and shipped from Cape Town.

Your experience helps others discover quality Islamic headwear. If you have a moment, please share your thoughts:

Leave your review: ${reviewUrl}

As a thank you, we'll send you a 5% coupon for your next purchase.

Jazakallah khair — The Al-Ameen Caps Team`;
}

// Schedule: Daily at 07:00 UTC (09:00 SAST)
// Configure in Netlify Dashboard: Site settings → Functions → Scheduled functions
// Cron expression: 0 7 * * *
exports.schedule = "0 7 * * *";

exports.handler = async (event, context) => {
  // Netlify scheduled functions are triggered via event.source === 'netlify-scheduled-function'
  // For manual testing, we can also accept regular HTTP requests
  const isScheduled = event.source === "netlify-scheduled-function";
  
  if (!isScheduled && event.httpMethod && event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Method Not Allowed" }),
    };
  }

  if (!supabase) {
    console.error("scheduled-review-request: Supabase not configured");
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Server not configured" }),
    };
  }

  const emailHost = process.env.EMAIL_HOST || "smtp.gmail.com";
  const emailPort = parseInt(process.env.EMAIL_PORT || "587", 10);
  const emailUser = (process.env.EMAIL_USER || "").trim();
  const emailPass = (process.env.EMAIL_PASS || "").trim();

  if (!emailUser || !emailPass) {
    console.warn("scheduled-review-request: Email not configured — review requests not sent.");
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ok: true, message: "Email not configured — review requests not sent." }),
    };
  }

  const siteUrl = getSiteUrl();

  // Calculate date range: exactly 5 days ago (at 00:00:00 UTC)
  const now = new Date();
  const fiveDaysAgo = new Date(now);
  fiveDaysAgo.setUTCDate(fiveDaysAgo.getUTCDate() - 5);
  fiveDaysAgo.setUTCHours(0, 0, 0, 0);
  
  // End of that day (23:59:59 UTC)
  const fiveDaysAgoEnd = new Date(fiveDaysAgo);
  fiveDaysAgoEnd.setUTCHours(23, 59, 59, 999);

  const fiveDaysAgoIso = fiveDaysAgo.toISOString();
  const fiveDaysAgoEndIso = fiveDaysAgoEnd.toISOString();

  console.log(`scheduled-review-request: Querying orders shipped 5 days ago (${fiveDaysAgoIso} to ${fiveDaysAgoEndIso})`);

  // Query orders with status 'SHIPPED' where updated_at is exactly 5 days ago
  // and review_requested is false (not yet sent)
  const { data: orders, error: listError } = await supabase
    .from("orders")
    .select("id, user_id, customer_email, updated_at, review_token")
    .eq("status", "SHIPPED")
    .eq("review_requested", false)
    .gte("updated_at", fiveDaysAgoIso)
    .lte("updated_at", fiveDaysAgoEndIso);

  if (listError) {
    console.error("scheduled-review-request: Failed to fetch orders:", listError.message);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Failed to fetch orders", details: listError.message }),
    };
  }

  if (!orders || orders.length === 0) {
    console.log(`scheduled-review-request: No orders found shipped 5 days ago (${fiveDaysAgoIso}).`);
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ok: true, message: "No orders to process", count: 0 }),
    };
  }

  console.log(`scheduled-review-request: Found ${orders.length} order(s) to process`);

  const transporter = nodemailer.createTransport({
    host: emailHost,
    port: emailPort,
    secure: emailPort === 465,
    auth: { user: emailUser, pass: emailPass },
  });

  let sent = 0;
  let failed = 0;

  for (const order of orders) {
    // Get customer email
    let emailTo = (order.customer_email || "").trim();
    if (!emailTo && order.user_id) {
      const { data: userData } = await supabase.auth.admin.getUserById(order.user_id);
      emailTo = (userData?.user?.email || "").trim();
    }
    if (!emailTo) {
      console.warn(`scheduled-review-request: Order ${order.id}: no customer email, skipping.`);
      failed++;
      continue;
    }

    // Get customer name
    let customerName = "Valued Customer";
    if (order.user_id) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("first_name, last_name")
        .eq("id", order.user_id)
        .single();
      customerName = [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") || customerName;
    }

    // Get or create review token
    let reviewToken = order.review_token;
    if (!reviewToken) {
      reviewToken = crypto.randomUUID();
      await supabase.from("orders").update({ review_token: reviewToken }).eq("id", order.id);
    }

    const reviewUrl = `${siteUrl}/review?token=${encodeURIComponent(reviewToken)}`;

    try {
      await transporter.sendMail({
        from: `"Al-Ameen Caps" <${emailUser}>`,
        to: emailTo,
        subject: "Share your experience — Heritage Connection from Al-Ameen Caps",
        html: getHeritageConnectionEmailHtml({
          customerName,
          orderId: order.id,
          reviewUrl,
          siteUrl,
        }),
        text: getHeritageConnectionEmailText({
          customerName,
          orderId: order.id,
          reviewUrl,
        }),
      });

      // Mark as review_requested = true to prevent duplicate emails
      await supabase
        .from("orders")
        .update({ review_requested: true })
        .eq("id", order.id);

      sent++;
      console.log(`scheduled-review-request: Sent review request for order ${order.id} to ${emailTo}`);
    } catch (err) {
      console.error(`scheduled-review-request: Order ${order.id}: email failed`, err.message);
      failed++;
    }
  }

  const result = {
    ok: true,
    message: `Processed ${orders.length} order(s): ${sent} sent, ${failed} failed`,
    sent,
    failed,
    total: orders.length,
  };

  console.log(`scheduled-review-request: ${result.message}`);
  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(result),
  };
};
