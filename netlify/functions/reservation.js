/**
 * Reservation Handler
 * Receives POST with JSON: { formData, cart, total }
 * 1. Persists to public.reservations (Supabase, service role).
 * 2. Sends "NEW RESERVATION" email to admin and confirmation to customer.
 */

const nodemailer = require("nodemailer");
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = supabaseUrl && serviceRoleKey
  ? createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } })
  : null;

function getReservationEmailHtml(data) {
  const { formData, cart, total } = data;
  const name = [formData.name_first, formData.name_last].filter(Boolean).join(" ") || "Customer";
  const items = (cart || [])
    .map((i) => `• ${i.name} × ${i.quantity || 1} — R${((i.price || 0) * (i.quantity || 1)).toFixed(2)}`)
    .join("\n");
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
    .footer { padding: 16px 24px; background: #f9f9f9; font-size: 0.875rem; color: #666; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>NEW RESERVATION — Al-Ameen Caps</h1>
      <p style="margin: 0.25rem 0 0; font-size: 0.9rem; color: rgba(255,255,255,0.9);">Inaugural Collection</p>
    </div>
    <div class="body">
      <p><strong>Customer:</strong> ${name}</p>
      <p><strong>Email:</strong> ${formData.email_address || "—"}</p>
      <p><strong>Phone:</strong> ${formData.cell_number || "—"}</p>
      <p><strong>Address:</strong><br>${formData.address_line_1 || ""}${formData.address_line_2 ? "<br>" + formData.address_line_2 : ""}<br>${formData.city || ""} ${formData.postal_code || ""}</p>
      <p><strong>Items:</strong></p>
      <pre style="white-space: pre-wrap; font-family: inherit;">${items || "—"}</pre>
      <p><strong>Total:</strong> <span class="total">R ${Number(total || 0).toFixed(2)}</span></p>
      <p>We will contact this customer when the inaugural collection arrives.</p>
    </div>
    <div class="footer">
      © ${new Date().getFullYear()} Al-Ameen Caps. All rights reserved.
    </div>
  </div>
</body>
</html>
  `.trim();
}

function getCustomerConfirmationEmailHtml(data) {
  const { formData, cart } = data;
  const name = [formData.name_first, formData.name_last].filter(Boolean).join(" ") || "Valued Customer";
  const itemsList = (cart || [])
    .map((i) => `• ${i.name} × ${i.quantity || 1}`)
    .join("\n") || "—";
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
    .body { padding: 32px 24px; line-height: 1.7; }
    .items { white-space: pre-wrap; font-family: inherit; background: #f9f9f9; padding: 16px; border-radius: 6px; margin: 12px 0; }
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
      <p>Thank you for your interest in the Al-Ameen Caps Inaugural Collection. We have successfully recorded your reservation.</p>
      <p><strong>Items Reserved:</strong></p>
      <div class="items">${itemsList}</div>
      <p><strong>What happens next?</strong></p>
      <p>Our collection is currently being handcrafted and imported. As soon as your items arrive at our boutique in Cape Town, we will contact you personally via this email address to finalize your order and arrange delivery.</p>
      <p>No payment is required at this stage. You have secured your place in our priority delivery queue.</p>
      <p>Jazakallah khair for your patience and for choosing Al-Ameen Caps.</p>
      <p>Warm regards,<br><strong>The Al-Ameen Caps Team</strong><br>"Restoring the Crown of the Believer"</p>
    </div>
    <div class="footer">
      © ${new Date().getFullYear()} Al-Ameen Caps. All rights reserved.
    </div>
  </div>
</body>
</html>
  `.trim();
}

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
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
    return { statusCode: 400, body: "Invalid JSON" };
  }

  const { formData, cart, total } = data;
  if (!formData || !formData.email_address) {
    return { statusCode: 400, body: "Missing formData or email" };
  }

  // 1. Persist to database (if Supabase is configured)
  if (supabase) {
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
      return { statusCode: 500, body: JSON.stringify({ error: dbError.message }) };
    }
  }

  if (!emailUser || !emailPass) {
    console.error("Reservation: EMAIL_USER or EMAIL_PASS not set");
    return { statusCode: 500, body: "Email not configured" };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: emailHost,
      port: emailPort,
      secure: emailPort === 465,
      auth: { user: emailUser, pass: emailPass },
    });

    // 1. Email to Admin
    await transporter.sendMail({
      from: `"Al-Ameen Caps" <${emailUser}>`,
      to: adminEmail,
      subject: "NEW RESERVATION — Al-Ameen Caps",
      html: getReservationEmailHtml(data),
      text: `NEW RESERVATION from ${formData.name_first} ${formData.name_last} (${formData.email_address}). Total: R${Number(total || 0).toFixed(2)}.`,
    });

    // 2. Email to Customer — Reservation Confirmed
    const customerItems = (cart || []).map((i) => `• ${i.name} × ${i.quantity || 1}`).join("\n") || "—";
    await transporter.sendMail({
      from: `"Al-Ameen Caps" <${emailUser}>`,
      to: formData.email_address,
      subject: "Reservation Confirmed: Al-Ameen Caps Inaugural Collection",
      html: getCustomerConfirmationEmailHtml(data),
      text: `Assalamu alaikum ${[formData.name_first, formData.name_last].filter(Boolean).join(" ") || "Valued Customer"},\n\nThank you for your interest in the Al-Ameen Caps Inaugural Collection. We have successfully recorded your reservation.\n\nItems Reserved:\n${customerItems}\n\nWhat happens next?\nOur collection is currently being handcrafted and imported. As soon as your items arrive at our boutique in Cape Town, we will contact you personally via this email address to finalize your order and arrange delivery.\n\nNo payment is required at this stage. You have secured your place in our priority delivery queue.\n\nJazakallah khair for your patience and for choosing Al-Ameen Caps.\n\nWarm regards,\nThe Al-Ameen Caps Team\n"Restoring the Crown of the Believer"`,
    });
  } catch (err) {
    console.error("Reservation: Email send failed", err);
    return { statusCode: 500, body: JSON.stringify({ error: "Failed to send reservation" }) };
  }

  return { statusCode: 200, body: JSON.stringify({ message: "Success", ok: true }) };
};
