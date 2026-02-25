/**
 * send-majlis-thank-you
 * Sends "The Legacy Lives" approval email when a heritage_majlis submission is approved (is_approved false → true).
 * Trigger: Supabase Database Webhook on heritage_majlis UPDATE. Configure in Supabase Dashboard:
 *   Database → Webhooks → Create webhook → Table: heritage_majlis, Events: Update,
 *   URL: https://alameencaps.com/.netlify/functions/send-majlis-thank-you
 *   Headers: X-Webhook-Secret = (your MAJLIS_WEBHOOK_SECRET)
 *   Ensure "Send old record" is enabled so we can detect the approval transition.
 * Env: EMAIL_USER, EMAIL_PASS (or MAJLIS_SENDER_EMAIL for From address).
 * Email: Subject "The Legacy Lives: [Ancestor Name] is now live in the Al-Ameen Majlis"; includes View the Wall + Share on Facebook links.
 */

const nodemailer = require("nodemailer");

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

function getThankYouHtml(data) {
  const { contributorName, ancestorName, siteUrl } = data;
  const name = (contributorName || "Family member").trim() || "Family member";
  const ancestor = (ancestorName || "your ancestor").trim() || "your ancestor";
  const wallUrl = `${siteUrl}/heritage#ou-bappa`;
  const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(wallUrl)}`;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body { font-family: Georgia, 'Times New Roman', serif; background: #f5f5f5; margin: 0; padding: 24px; color: #1a1a1a; }
    .container { max-width: 560px; margin: 0 auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .banner { background: #065f46; color: #e8dfd2; padding: 20px; text-align: center; font-size: 1.3rem; font-weight: bold; }
    .accent-bar { height: 4px; background: #b8860b; }
    .body { padding: 24px; line-height: 1.8; color: #333; }
    .highlight { color: #065f46; font-weight: bold; }
    ul { margin: 0.5em 0; padding-left: 1.2em; }
    .btn { display: inline-block; padding: 12px 20px; background: #065f46; color: #fff !important; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 8px 8px 8px 0; }
    .btn-fb { background: #1877f2; }
    .footer { padding: 16px 24px; font-size: 0.8rem; color: #666; border-top: 1px solid #eee; }
    a { color: #065f46; }
  </style>
</head>
<body>
  <div class="container">
    <div class="banner">The Legacy Lives</div>
    <div class="accent-bar"></div>
    <div class="body">
      <p><strong>Assalamu Alaikum ${escapeHtml(name)},</strong></p>
      <p>It is with great respect that we inform you that your contribution to the Al-Ameen Digital Majlis has been verified and officially added to the archive.</p>
      <p>The story and image of <span class="highlight">${escapeHtml(ancestor)}</span> are now part of our &ldquo;Golden Thread,&rdquo; connecting our generation back to the scholarship of Tuan Guru and the resilience of Imam Mogamat Talaabodien (Ou Bappa).</p>
      <p><strong>What this means:</strong></p>
      <ul>
        <li><strong>Digital Preservation:</strong> Your photo has been branded with the Al-Ameen Seal and injected with historical metadata to ensure its legacy is never lost.</li>
        <li><strong>The Living Tree:</strong> ${escapeHtml(ancestor)} has been placed within the family tree, helping us map the 80+ branches of the Taliep and Rakiep lines.</li>
        <li><strong>Public Honor:</strong> Your post is now visible on the Digital Wall for the entire community to witness.</li>
      </ul>
      <p><a href="${escapeHtml(wallUrl)}" class="btn">View the Wall</a> <a href="${escapeHtml(facebookShareUrl)}" class="btn btn-fb" target="_blank" rel="noopener">Share on Facebook</a></p>
      <p style="font-size: 0.95em;">If your contribution included new information regarding the bridge to Bappa (Imam Achmat Talaabodien), our team will be in touch shortly regarding the Custodian of the Thread honor.</p>
      <p>Shukran for helping us dignify our past to inspire our future.</p>
      <p>With respect,<br><strong>Taufeeq Essop</strong><br>Director, Al-Ameen Caps</p>
    </div>
    <div class="footer">
      This email was sent by Al-Ameen Caps because your heritage submission was approved. You received it at the email address you provided when submitting to the Digital Majlis.
    </div>
  </div>
</body>
</html>
  `.trim();
}

exports.handler = async (event) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, X-Webhook-Secret, Authorization",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: corsHeaders, body: "" };
  }
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers: { ...corsHeaders, "Content-Type": "application/json" }, body: JSON.stringify({ error: "Method Not Allowed" }) };
  }

  const secret = (process.env.MAJLIS_WEBHOOK_SECRET || "").trim();
  if (secret) {
    const headerSecret = event.headers["x-webhook-secret"] || event.headers["X-Webhook-Secret"];
    let bodySecret = "";
    try {
      const b = event.body ? JSON.parse(event.body) : {};
      bodySecret = (b.secret || "").trim();
    } catch (_) {}
    if (headerSecret !== secret && bodySecret !== secret) {
      return { statusCode: 401, headers: { ...corsHeaders, "Content-Type": "application/json" }, body: JSON.stringify({ error: "Unauthorized" }) };
    }
  }

  let payload;
  try {
    payload = event.body ? JSON.parse(event.body) : {};
  } catch (_) {
    return { statusCode: 400, headers: { ...corsHeaders, "Content-Type": "application/json" }, body: JSON.stringify({ error: "Invalid JSON" }) };
  }

  if (payload.type !== "UPDATE" || payload.table !== "heritage_majlis") {
    return { statusCode: 200, headers: { ...corsHeaders, "Content-Type": "application/json" }, body: JSON.stringify({ ok: true, message: "Ignored: not a heritage_majlis UPDATE" }) };
  }

  const record = payload.record || {};
  const oldRecord = payload.old_record || {};
  const wasApproved = oldRecord.is_approved === true;
  const isNowApproved = record.is_approved === true;
  if (wasApproved || !isNowApproved) {
    return { statusCode: 200, headers: { ...corsHeaders, "Content-Type": "application/json" }, body: JSON.stringify({ ok: true, message: "No approval transition; email not sent" }) };
  }

  const toEmail = (record.contributor_email || "").trim();
  if (!toEmail) {
    return { statusCode: 200, headers: { ...corsHeaders, "Content-Type": "application/json" }, body: JSON.stringify({ ok: true, message: "No contributor_email; email not sent" }) };
  }

  const emailUser = (process.env.EMAIL_USER || "").trim();
  const emailPass = (process.env.EMAIL_PASS || "").trim();
  const fromEmail = (process.env.MAJLIS_SENDER_EMAIL || emailUser || "taufeeqcv@gmail.com").trim();
  const fromName = "Taufeeq Essop";

  if (!emailUser || !emailPass) {
    console.warn("send-majlis-thank-you: EMAIL_USER or EMAIL_PASS not set; cannot send.");
    return { statusCode: 200, headers: { ...corsHeaders, "Content-Type": "application/json" }, body: JSON.stringify({ ok: true, message: "Email not configured" }) };
  }

  const contributorName = (record.contributor_name || "").trim() || "Family member";
  const ancestorName = (record.ancestor_name || "").trim() || "your ancestor";
  const subject = `The Legacy Lives: ${ancestorName} is now live in the Al-Ameen Majlis`;
  const siteUrl = getSiteUrl();

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: parseInt(process.env.EMAIL_PORT || "587", 10),
    secure: parseInt(process.env.EMAIL_PORT || "587", 10) === 465,
    auth: { user: emailUser, pass: emailPass },
  });

  try {
    await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to: toEmail,
      subject,
      html: getThankYouHtml({ contributorName, ancestorName, siteUrl }),
    });
    return { statusCode: 200, headers: { ...corsHeaders, "Content-Type": "application/json" }, body: JSON.stringify({ ok: true, message: "Thank-you email sent" }) };
  } catch (err) {
    console.error("send-majlis-thank-you: email failed", err);
    return { statusCode: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }, body: JSON.stringify({ error: "Failed to send email" }) };
  }
};
