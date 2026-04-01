import type { Handler } from '@netlify/functions';
import crypto from 'crypto';
import { supabaseAdmin } from './lib/supabaseAdmin';

/** Lowercase header lookup (Netlify/AWS lowercases header names). */
function header(
  headers: Record<string, string | undefined> | undefined,
  name: string
): string {
  if (!headers) return '';
  const want = name.toLowerCase();
  for (const [k, v] of Object.entries(headers)) {
    if (k.toLowerCase() === want && v != null && v !== '') return v;
  }
  return '';
}

/**
 * Verify Yoco Checkout API webhook signature.
 * @see https://developer.yoco.com/guides/online-payments/webhooks/verifying-the-events
 */
function verifyYocoWebhookSignature(
  rawBody: string,
  headers: Record<string, string | undefined> | undefined,
  webhookSecret: string
): boolean {
  const id = header(headers, 'webhook-id');
  const ts = header(headers, 'webhook-timestamp');
  const sigHeader = header(headers, 'webhook-signature');
  if (!id || !ts || !sigHeader) return false;

  const tsNum = parseInt(ts, 10);
  if (Number.isNaN(tsNum) || Math.abs(Date.now() / 1000 - tsNum) > 180) {
    console.error('yoco-webhook: timestamp outside 3m window');
    return false;
  }

  let secretPart = webhookSecret.trim();
  if (secretPart.startsWith('whsec_')) {
    secretPart = secretPart.slice(6);
  }
  let secretBytes: Buffer;
  try {
    secretBytes = Buffer.from(secretPart, 'base64');
  } catch {
    return false;
  }

  const signedContent = `${id}.${ts}.${rawBody}`;
  const expectedSignature = crypto.createHmac('sha256', secretBytes).update(signedContent).digest('base64');

  const parts = sigHeader.trim().split(/\s+/);
  for (const part of parts) {
    const comma = part.indexOf(',');
    if (comma === -1) continue;
    const sigB64 = part.slice(comma + 1).trim();
    if (!sigB64) continue;
    try {
      const a = Buffer.from(expectedSignature, 'utf8');
      const b = Buffer.from(sigB64, 'utf8');
      if (a.length === b.length && crypto.timingSafeEqual(a, b)) return true;
    } catch {
      /* length mismatch */
    }
  }
  return false;
}

interface PaymentWebhookEvent {
  type?: string;
  payload?: {
    id?: string;
    amount?: number;
    currency?: string;
    status?: string;
    metadata?: Record<string, unknown>;
    type?: string;
  };
}

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const webhookSecret = (process.env.YOCO_WEBHOOK_SECRET ?? '').trim();
  if (!webhookSecret) {
    console.error('yoco-webhook: YOCO_WEBHOOK_SECRET is not set');
    return { statusCode: 500, body: 'Server misconfiguration' };
  }

  let rawBody = event.body ?? '';
  if (event.isBase64Encoded && typeof rawBody === 'string') {
    rawBody = Buffer.from(rawBody, 'base64').toString('utf8');
  }

  if (!verifyYocoWebhookSignature(rawBody, event.headers, webhookSecret)) {
    console.error('yoco-webhook: invalid signature');
    return { statusCode: 403, body: 'Forbidden' };
  }

  let parsed: PaymentWebhookEvent;
  try {
    parsed = JSON.parse(rawBody) as PaymentWebhookEvent;
  } catch {
    return { statusCode: 400, body: 'Bad Request' };
  }

  if (parsed.type !== 'payment.succeeded') {
    return { statusCode: 200, body: '' };
  }

  const payload = parsed.payload;
  if (!payload || payload.status !== 'succeeded') {
    return { statusCode: 200, body: '' };
  }
  if (payload.type && payload.type !== 'payment') {
    return { statusCode: 200, body: '' };
  }

  const m = payload.metadata;
  let orderIdRaw: string | undefined;
  if (m && typeof m === 'object') {
    const raw = (m as Record<string, unknown>).order_id ?? (m as Record<string, unknown>).orderId;
    if (raw != null && raw !== '') orderIdRaw = String(raw);
  }
  if (!orderIdRaw) {
    console.error('yoco-webhook: missing metadata.order_id');
    return { statusCode: 200, body: '' };
  }

  const yocoPaymentId = payload.id ?? null;
  const amountCents = Math.round(Number(payload.amount));

  const { data: order, error: orderError } = await supabaseAdmin
    .from('orders')
    .select('id, total_amount, status')
    .eq('id', orderIdRaw)
    .single();

  if (orderError || !order) {
    console.error('yoco-webhook: order not found', orderIdRaw, orderError);
    return { statusCode: 200, body: '' };
  }

  if (order.status === 'PAID') {
    return { statusCode: 200, body: '' };
  }

  const expectedCents = Math.round(Number(order.total_amount) * 100);
  if (!Number.isFinite(amountCents) || amountCents !== expectedCents) {
    console.error('yoco-webhook: amount mismatch', { amountCents, expectedCents, order_id: order.id });
    return { statusCode: 200, body: '' };
  }

  const { error: updateError } = await supabaseAdmin
    .from('orders')
    .update({
      status: 'PAID',
      ...(yocoPaymentId ? { yoco_payment_id: yocoPaymentId } : {}),
    })
    .eq('id', order.id)
    .eq('status', 'PENDING');

  if (updateError) {
    console.error('yoco-webhook: order update failed', updateError);
    return { statusCode: 500, body: 'Update failed' };
  }

  const { data: orderItems } = await supabaseAdmin
    .from('order_items')
    .select('product_id, quantity')
    .eq('order_id', order.id);

  if (orderItems?.length) {
    for (const item of orderItems) {
      const { data: product } = await supabaseAdmin
        .from('products')
        .select('stock_quantity')
        .eq('id', item.product_id)
        .single();
      if (product != null) {
        const newStock = Math.max(0, Number(product.stock_quantity) - item.quantity);
        await supabaseAdmin.from('products').update({ stock_quantity: newStock }).eq('id', item.product_id);
      }
    }
  }

  const baseUrl = (process.env.URL || process.env.VITE_SITE_URL || 'https://alameencaps.com').replace(/\/$/, '');
  const secret = process.env.ORDER_CONFIRMATION_SECRET || '';
  const confirmUrl = `${baseUrl}/.netlify/functions/send-order-confirmation`;
  fetch(confirmUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(secret ? { 'X-Internal-Secret': secret } : {}) },
    body: JSON.stringify({ order_id: order.id }),
  }).catch((err) => console.error('yoco-webhook: send-order-confirmation failed', err));

  const reviewRequestUrl = `${baseUrl}/.netlify/functions/send-review-request`;
  fetch(reviewRequestUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(secret ? { 'X-Internal-Secret': secret } : {}) },
    body: JSON.stringify({ order_id: order.id }),
  }).catch((err) => console.error('yoco-webhook: send-review-request failed', err));

  return { statusCode: 200, body: '' };
};
