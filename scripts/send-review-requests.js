#!/usr/bin/env node
/**
 * Automated review request emails: find orders shipped exactly 3 days ago (by shipped_at date),
 * send "Heritage & Quality" email with Google Review + Facebook Share links.
 * Uses EMAIL_USER, EMAIL_PASS; requires Supabase (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY).
 * Run daily via GitHub Actions (e.g. 10:00 SAST) or cron.
 */

import { createClient } from "@supabase/supabase-js";
import nodemailer from "nodemailer";

const supabaseUrl = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "").trim();
const serviceRoleKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();
const emailUser = (process.env.EMAIL_USER || "").trim();
const emailPass = (process.env.EMAIL_PASS || "").trim();

const GOOGLE_REVIEW_URL = "https://g.page/r/CSn0lNF6h_xyEAI/review";
const FACEBOOK_SHARE_URL =
  "https://www.facebook.com/sharer/sharer.php?u=" + encodeURIComponent(GOOGLE_REVIEW_URL);

function getSiteUrl() {
  return (process.env.VITE_SITE_URL || process.env.URL || "https://alameencaps.com").replace(/\/$/, "");
}

function escapeHtml(s) {
  if (s == null) return "";
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Heritage & Quality template: Jumu'ah, Salah, Eid, Bo-Kaap, Cape Malay, Handcrafted.
 */
function getHeritageReviewEmailHtml(data) {
  const { customerName, orderId, siteUrl } = data;
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
    .btn { display: inline-block; margin: 10px 8px 10px 0; padding: 14px 24px; background: #b8860b; color: #fff !important; text-decoration: none; font-weight: bold; border-radius: 8px; font-size: 0.95rem; }
    .footer { padding: 16px 24px; font-size: 0.8rem; color: #888; border-top: 1px solid #eee; }
  </style>
</head>
<body>
  <div class="container">
    <div class="banner">Heritage &amp; Quality — Thank you</div>
    <div class="accent-bar"></div>
    <div class="body">
      <p><strong>Assalamu alaikum ${escapeHtml(displayName)},</strong></p>
      <p>We hope your order <strong>#${escapeHtml(String(orderId))}</strong> has arrived and that you are enjoying your handcrafted piece. Our Kufis, Taqiyahs and Fez are made with care for <strong>Jumu'ah</strong>, <strong>Salah</strong>, and <strong>Eid</strong> — rooted in <strong>Cape Malay</strong> and <strong>Bo-Kaap</strong> heritage.</p>
      <p>Your experience helps others discover quality Islamic headwear. If you have a moment, we would be grateful if you could:</p>
      <ul>
        <li>Leave a <strong>Google Review</strong> so more of the community can find us</li>
        <li><strong>Share on Facebook</strong> to support local craftsmanship</li>
      </ul>
      <p style="text-align: center;">
        <a href="${escapeHtml(GOOGLE_REVIEW_URL)}" class="btn">Leave a Google Review</a>
        <a href="${escapeHtml(FACEBOOK_SHARE_URL)}" class="btn">Share on Facebook</a>
      </p>
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

function getHeritageReviewEmailText(data) {
  const { customerName, orderId } = data;
  const name = (customerName || "Valued Customer").trim() || "Valued Customer";
  return `Assalamu alaikum ${name},

We hope your order #${orderId} has arrived. Our handcrafted Kufis, Taqiyahs and Fez are made for Jumu'ah, Salah, and Eid — rooted in Cape Malay and Bo-Kaap heritage.

If you have a moment, please leave a Google Review or share on Facebook. It helps others discover quality Islamic headwear.

Google Review: ${GOOGLE_REVIEW_URL}
Share on Facebook: ${FACEBOOK_SHARE_URL}

Jazakallah khair — The Al-Ameen Caps Team`;
}

async function main() {
  if (!supabaseUrl || !serviceRoleKey) {
    console.error("Missing SUPABASE_URL/VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Set in env.");
    process.exit(1);
  }
  if (!emailUser || !emailPass) {
    console.error("Missing EMAIL_USER or EMAIL_PASS. Set in env.");
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });
  const siteUrl = getSiteUrl();

  // Shipped 3 days ago or older, and not yet sent (so we don't miss orders if the job skips a day).
  const today = new Date();
  const threeDaysAgo = new Date(today);
  threeDaysAgo.setUTCDate(threeDaysAgo.getUTCDate() - 3);
  threeDaysAgo.setUTCHours(0, 0, 0, 0);
  const cutoffIso = threeDaysAgo.toISOString();

  const { data: orders, error: listError } = await supabase
    .from("orders")
    .select("id, user_id, customer_email, review_request_sent_at, shipped_at")
    .eq("status", "SHIPPED")
    .not("shipped_at", "is", null)
    .lt("shipped_at", cutoffIso)
    .is("review_request_sent_at", null);

  if (listError) {
    console.error("Failed to fetch orders:", listError.message);
    process.exit(1);
  }

  if (!orders?.length) {
    console.log("No orders shipped 3+ days ago needing a review request. Done.");
    process.exit(0);
  }

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: parseInt(process.env.EMAIL_PORT || "587", 10),
    secure: process.env.EMAIL_PORT === "465",
    auth: { user: emailUser, pass: emailPass },
  });

  let sent = 0;
  for (const order of orders) {
    let emailTo = (order.customer_email || "").trim();
    if (!emailTo && order.user_id) {
      const { data: userData } = await supabase.auth.admin.getUserById(order.user_id);
      emailTo = (userData?.user?.email || "").trim();
    }
    if (!emailTo) {
      console.warn(`Order ${order.id}: no customer email, skip.`);
      continue;
    }

    let customerName = "Valued Customer";
    if (order.user_id) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("first_name, last_name")
        .eq("id", order.user_id)
        .single();
      customerName = [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") || customerName;
    }

    try {
      await transporter.sendMail({
        from: `"Al-Ameen Caps" <${emailUser}>`,
        to: emailTo,
        subject: "Thank you — share your experience & support Cape Malay heritage",
        html: getHeritageReviewEmailHtml({
          customerName,
          orderId: order.id,
          siteUrl,
        }),
        text: getHeritageReviewEmailText({ customerName, orderId: order.id }),
      });
      await supabase
        .from("orders")
        .update({ review_request_sent_at: new Date().toISOString() })
        .eq("id", order.id);
      sent++;
      console.log(`Sent review request for order ${order.id} to ${emailTo}`);
    } catch (err) {
      console.error(`Order ${order.id}: email failed`, err.message);
    }
  }

  console.log(`Done. Sent ${sent} of ${orders.length} review request(s) for orders shipped 3+ days ago.`);
  process.exit(0);
}

main();
