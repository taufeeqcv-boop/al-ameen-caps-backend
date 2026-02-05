/**
 * PayFast ITN (Instant Transaction Notification) Listener
 * Netlify serverless function: receives POST from PayFast, validates signature,
 * sends order confirmation email via nodemailer, returns 200.
 */

const crypto = require("crypto");
const nodemailer = require("nodemailer");

// Parse application/x-www-form-urlencoded body
function parseFormBody(body) {
  if (!body || typeof body !== "string") return {};
  const params = {};
  for (const pair of body.split("&")) {
    const [key, value] = pair.split("=").map((s) => decodeURIComponent((s || "").replace(/\+/g, " ")));
    if (key) params[key] = value;
  }
  return params;
}

// Build the string used by PayFast for signature: sorted keys (except signature), key=value&..., then &pass_phrase=urlencode(passphrase)
function buildSignatureString(params, passphrase) {
  const sorted = Object.keys(params)
    .filter((k) => k !== "signature" && params[k] !== "" && params[k] != null)
    .sort();
  const str = sorted.map((k) => `${k}=${encodeURIComponent(params[k]).replace(/%20/g, "+")}`).join("&");
  return passphrase ? `${str}&pass_phrase=${encodeURIComponent(passphrase).replace(/%20/g, "+")}` : str;
}

function validatePayFastSignature(params, passphrase) {
  const received = params.signature;
  if (!received) return false;
  const toHash = buildSignatureString(params, passphrase);
  const computed = crypto.createHash("md5").update(toHash).digest("hex");
  return computed.toLowerCase() === received.toLowerCase();
}

// HTML email template for order confirmation
function getEmailHtml(data) {
  const amount = data.amount_gross || data.amount || "—";
  const name = [data.name_first, data.name_last].filter(Boolean).join(" ") || "Customer";
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Georgia, serif; background: #f5f5f5; margin: 0; padding: 24px; color: #333; }
    .container { max-width: 560px; margin: 0 auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .header { background: #000; color: #D4AF37; padding: 24px; text-align: center; }
    .header h1 { margin: 0; font-size: 1.5rem; }
    .body { padding: 32px 24px; line-height: 1.6; }
    .amount { font-size: 1.25rem; color: #D4AF37; font-weight: bold; margin: 16px 0; }
    .footer { padding: 16px 24px; background: #f9f9f9; font-size: 0.875rem; color: #666; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Al-Ameen Caps</h1>
      <p style="margin: 0.25rem 0 0; font-size: 0.9rem; color: rgba(255,255,255,0.9);">Restoring the Crown of the Believer</p>
    </div>
    <div class="body">
      <p>Assalamu alaikum ${name},</p>
      <p>Thank you for your order. Your payment was successful and we have received your order.</p>
      <p><strong>Amount paid:</strong> <span class="amount">R ${amount}</span></p>
      <p>Fastway Couriers will deliver your order within 2–5 business days. We will send you tracking details once your parcel is dispatched.</p>
      <p>If you have any questions, please reply to this email or use our <a href="https://alameencaps.netlify.app/contact">Contact</a> page.</p>
      <p>Jazakallah khair,<br><strong>Al-Ameen Caps</strong></p>
    </div>
    <div class="footer">
      © ${new Date().getFullYear()} Al-Ameen Caps. All rights reserved.
    </div>
  </div>
</body>
</html>
  `.trim();
}

exports.handler = async (event, context) => {
  // PayFast only sends POST
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const passphrase = process.env.PAYFAST_PASSPHRASE || "";
  const adminEmail = process.env.ADMIN_EMAIL || "";
  const emailHost = process.env.EMAIL_HOST || "smtp.gmail.com";
  const emailPort = parseInt(process.env.EMAIL_PORT || "587", 10);
  const emailUser = process.env.EMAIL_USER || "";
  const emailPass = process.env.EMAIL_PASS || "";

  const params = parseFormBody(event.body);
  const paymentStatus = params.payment_status;
  const customerEmail = params.email_address;

  // 1. Validate signature (must have passphrase set)
  if (passphrase && !validatePayFastSignature(params, passphrase)) {
    console.error("ITN: Invalid PayFast signature");
    return { statusCode: 200, body: "" }; // Still 200 so PayFast stops retrying
  }

  // 2. Only send email when payment is COMPLETE
  if (paymentStatus !== "COMPLETE" || !customerEmail) {
    return { statusCode: 200, body: "" };
  }

  // 3. Send email via nodemailer
  if (!emailUser || !emailPass) {
    console.error("ITN: EMAIL_USER or EMAIL_PASS not set");
    return { statusCode: 200, body: "" };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: emailHost,
      port: emailPort,
      secure: emailPort === 465,
      auth: { user: emailUser, pass: emailPass },
    });

    const mailOptions = {
      from: `"Al-Ameen Caps" <${emailUser}>`,
      to: customerEmail,
      bcc: adminEmail || undefined,
      subject: "Order Confirmation - Al-Ameen Caps",
      html: getEmailHtml(params),
      text: `Thank you for your order. Amount paid: R ${params.amount_gross || params.amount || "—"}. Fastway Couriers will deliver within 2–5 business days. Al-Ameen Caps.`,
    };

    await transporter.sendMail(mailOptions);
  } catch (err) {
    console.error("ITN: Email send failed", err);
  }

  // 4. Always return 200 so PayFast stops sending the ITN
  return { statusCode: 200, body: "" };
};
