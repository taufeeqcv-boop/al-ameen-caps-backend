/**
 * Reservation Handler
 * Receives POST with JSON: { formData, cart, total }
 * 1. Persists to public.reservations (Supabase, service role).
 * 2. Sends "NEW RESERVATION" email to admin and confirmation to customer.
 * CORS headers: * allows browser requests from any origin (localhost, www.alameencaps.com, legacy Netlify subdomain).
 */

const nodemailer = require("nodemailer");
const { createClient } = require("@supabase/supabase-js");

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function withCors(res) {
  return { ...res, headers: { ...CORS_HEADERS, ...(res.headers || {}) } };
}

const supabaseUrl = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "").trim();
const serviceRoleKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();
const supabase = supabaseUrl && serviceRoleKey
  ? createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } })
  : null;

function getReservationEmailHtml(data, supabaseDashboardUrl) {
  const { formData, cart, total } = data;
  const name = [formData.name_first, formData.name_last].filter(Boolean).join(" ") || "Customer";
  const items = (cart || [])
    .map((i) => `• ${i.name} × ${i.quantity || 1} — R${((i.price || 0) * (i.quantity || 1)).toFixed(2)}`)
    .join("\n");
  const dashboardLink = supabaseDashboardUrl
    ? `<p style="margin-top: 20px;"><a href="${supabaseDashboardUrl}" style="color: #D4AF37; font-weight: bold;">View in Supabase Dashboard →</a></p>`
    : "";
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
    .total { font-size: 1.25rem; color: #D4AF37; font-weight: bold; margin: 16px 0; }
    .phone { font-family: ui-monospace, monospace; font-size: 1.1rem; }
    .footer { padding: 16px 24px; background: #f9f9f9; font-size: 0.875rem; color: #666; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>NEW ORDER ALERT — Al-Ameen Caps</h1>
      <p style="margin: 0.25rem 0 0; font-size: 0.9rem; color: rgba(255,255,255,0.9);">Inaugural Collection</p>
    </div>
    <div class="body">
      <p><strong>Customer:</strong> ${name}</p>
      <p><strong>Email:</strong> ${formData.email_address || "—"}</p>
      <p><strong>Phone:</strong> <span class="phone">${formData.cell_number || "—"}</span></p>
      <p><strong>Address:</strong><br>${formData.address_line_1 || ""}${formData.address_line_2 ? "<br>" + formData.address_line_2 : ""}<br>${formData.city || ""} ${formData.postal_code || ""}</p>
      <p><strong>Items:</strong></p>
      <pre style="white-space: pre-wrap; font-family: inherit;">${items || "—"}</pre>
      <p><strong>Total:</strong> <span class="total">R ${Number(total || 0).toFixed(2)}</span></p>
      <p>Contact this customer to finalize delivery.</p>
      ${dashboardLink}
    </div>
    <div class="footer">© ${new Date().getFullYear()} Al-Ameen Caps. All rights reserved.</div>
  </div>
</body>
</html>
  `.trim();
}

function getCustomerConfirmationEmailHtml(data) {
  const { formData, cart, total } = data;
  const name = [formData.name_first, formData.name_last].filter(Boolean).join(" ") || "Valued Customer";
  const itemsList = (cart || [])
    .map((i) => `• ${i.name} × ${i.quantity || 1} — R${((i.price || 0) * (i.quantity || 1)).toFixed(2)}`)
    .join("\n") || "—";
  const totalFormatted = `R ${Number(total || 0).toFixed(2)}`;
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Georgia, serif; background: #0a0a0a; margin: 0; padding: 24px; color: #e5e5e5; }
    .container { max-width: 480px; margin: 0 auto; background: #18181b; border: 1px solid rgba(202,138,4,0.5); border-radius: 12px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); }
    .gold-bar { height: 8px; width: 100%; background: #ca8a04; border-radius: 12px 12px 0 0; }
    .header { padding: 28px 24px; text-align: center; }
    .header h1 { margin: 0; font-size: 1.75rem; color: #fff; }
    .header .sub { margin-top: 8px; font-size: 0.7rem; letter-spacing: 0.25em; color: #a1a1aa; text-transform: uppercase; }
    .body { padding: 24px; line-height: 1.65; }
    .receipt-box { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 16px; margin: 16px 0; }
    .receipt-box .label { font-size: 10px; color: #71717a; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 6px; }
    .receipt-box .value { font-family: ui-monospace, monospace; font-size: 1.1rem; color: #eab308; }
    .items { white-space: pre-wrap; font-family: ui-monospace, monospace; font-size: 0.9rem; color: #d4d4d8; background: rgba(0,0,0,0.3); padding: 14px; border-radius: 6px; margin: 12px 0; }
    .total-line { font-size: 1.15rem; color: #eab308; font-weight: bold; margin-top: 12px; }
    .footer { padding: 16px 24px; font-size: 0.75rem; color: #71717a; text-align: center; border-top: 1px solid rgba(255,255,255,0.06); }
  </style>
</head>
<body>
  <div class="container">
    <div class="gold-bar"></div>
    <div class="header">
      <h1>Reservation Confirmed</h1>
      <p class="sub">Al-Ameen Caps · Inaugural Collection</p>
    </div>
    <div class="body">
      <p>Assalamu alaikum ${name},</p>
      <p>Thank you for your reservation. We have secured your place in our priority queue.</p>
      <div class="receipt-box">
        <div class="label">Contact number</div>
        <div class="value">${formData.cell_number || "—"}</div>
      </div>
      <p><strong>Items reserved</strong></p>
      <div class="items">${itemsList}</div>
      <p class="total-line">Total: ${totalFormatted}</p>
      <p>Our team will contact you shortly to finalize your order. No payment is required at this stage.</p>
      <p>Jazakallah khair — The Al-Ameen Caps Team</p>
    </div>
    <div class="footer">© ${new Date().getFullYear()} Al-Ameen Caps. All rights reserved.</div>
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
    return withCors({ statusCode: 405, body: "Method Not Allowed" });
  }

  const adminEmail = process.env.ADMIN_EMAIL || process.env.RESERVATION_EMAIL || "sales@alameencaps.com";
  const emailHost = process.env.EMAIL_HOST || "smtp.gmail.com";
  const emailPort = parseInt(process.env.EMAIL_PORT || "587", 10);
  const emailUser = process.env.EMAIL_USER || "";
  const emailPass = process.env.EMAIL_PASS || "";

  let data;
  try {
    data = JSON.parse(event.body || "{}");
  } catch {
    return withCors({ statusCode: 400, body: "Invalid JSON" });
  }

  const { formData, cart, total } = data;
  if (!formData || !formData.email_address) {
    return withCors({ statusCode: 400, body: "Missing formData or email" });
  }

  // 1. Persist to database (required — otherwise reservation never shows in admin)
  if (!supabase) {
    console.error("Reservation: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set");
    return withCors({
      statusCode: 503,
      body: JSON.stringify({
        error: "Reservation service not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in Netlify (Site settings → Environment variables), or in .env when using netlify dev.",
      }),
    });
  }

  const customerName = [formData.name_first, formData.name_last].filter(Boolean).join(" ").trim() || null;
  const notes = formData.message || (formData.address_line_1 ? [formData.address_line_1, formData.address_line_2, formData.city, formData.postal_code].filter(Boolean).join(", ") : "") || "";
  const { error: dbError } = await supabase
    .from("reservations")
    .insert([{
      customer_name: customerName,
      customer_email: formData.email_address,
      customer_phone: formData.cell_number || "",
      items: cart || [],
      total_amount: Number(total) || 0,
      notes: notes,
      status: "pending",
    }]);
  if (dbError) {
    console.error("Reservation: DB insert failed", dbError);
    return withCors({ statusCode: 500, body: JSON.stringify({ error: dbError.message }) });
  }

  // 1b. Decrement stock in products table for each cart item (match by sku or id)
  const cartItems = Array.isArray(cart) ? cart : [];
  for (const item of cartItems) {
    const qty = Math.max(0, Number(item.quantity) || 1);
    if (qty <= 0) continue;
    const sku = item.id != null ? String(item.id) : item.sku != null ? String(item.sku) : null;
    const productId = typeof item.product_id === "number" ? item.product_id : null;
    let productRow = null;
    if (productId != null) {
      const { data } = await supabase.from("products").select("id, stock_quantity").eq("id", productId).single();
      productRow = data;
    }
    if (!productRow && sku) {
      const { data } = await supabase.from("products").select("id, stock_quantity").eq("sku", sku).single();
      productRow = data;
    }
    if (productRow != null) {
      const current = Math.max(0, Number(productRow.stock_quantity) || 0);
      const newStock = Math.max(0, current - qty);
      await supabase.from("products").update({ stock_quantity: newStock }).eq("id", productRow.id);
    }
  }

  // 2. Send emails via EMAIL_USER / EMAIL_PASS (Netlify env). Stock decrement above runs before this.
  if (emailUser && emailPass) {
    try {
      const transporter = nodemailer.createTransport({
        host: emailHost,
        port: emailPort,
        secure: emailPort === 465,
        auth: { user: emailUser, pass: emailPass },
      });
      const clientTo = (formData.email_address || "").trim();
      const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
      const projectRef = supabaseUrl.replace(/^https:\/\//, "").split(".supabase.co")[0] || "";
      const supabaseDashboardUrl = projectRef ? `https://supabase.com/dashboard/project/${projectRef}/editor` : "";
      const customerItems = (cart || []).map((i) => `• ${i.name} × ${i.quantity || 1}`).join("\n") || "—";

      const adminPromise = transporter.sendMail({
        from: `"Al-Ameen Caps" <${emailUser}>`,
        to: adminEmail,
        subject: "NEW ORDER ALERT — Al-Ameen Caps",
        html: getReservationEmailHtml(data, supabaseDashboardUrl),
        text: `NEW RESERVATION from ${formData.name_first} ${formData.name_last} (${formData.email_address}). Phone: ${formData.cell_number || "—"}. Total: R${Number(total || 0).toFixed(2)}.`,
      });
      const clientOptions = {
        from: `"Al-Ameen Caps" <${emailUser}>`,
        to: clientTo,
        subject: "Reservation Confirmed: Al-Ameen Caps Inaugural Collection",
        html: getCustomerConfirmationEmailHtml(data),
        text: `Assalamu alaikum ${[formData.name_first, formData.name_last].filter(Boolean).join(" ") || "Valued Customer"},\n\nThank you for your interest in the Al-Ameen Caps Inaugural Collection. We have successfully recorded your reservation.\n\nItems Reserved:\n${customerItems}\n\nWhat happens next?\nOur collection is currently being handcrafted and imported. As soon as your items arrive at our boutique in Cape Town, we will contact you personally via this email address to finalize your order and arrange delivery.\n\nNo payment is required at this stage. You have secured your place in our priority delivery queue.\n\nJazakallah khair for your patience and for choosing Al-Ameen Caps.\n\nWarm regards,\nThe Al-Ameen Caps Team\n"Restoring the Crown of the Believer"`,
      };
      const clientPromise = clientTo ? transporter.sendMail(clientOptions) : Promise.resolve();

      await Promise.all([adminPromise, clientPromise]);
      if (clientTo) console.log("Client email sent to:", clientTo);
      else console.warn("Reservation: No client email in formData — client email skipped");
    } catch (err) {
      console.error("Reservation: Email send failed (reservation was saved)", err);
    }
  } else {
    console.warn("Reservation: EMAIL_USER/EMAIL_PASS not set — reservation saved to DB only");
  }

  return withCors({ statusCode: 200, body: JSON.stringify({ message: "Success", ok: true }) });
};
