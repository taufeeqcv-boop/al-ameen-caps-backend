import type { Handler } from '@netlify/functions';
import { supabaseAdmin } from './lib/supabaseAdmin';
import { generateSignature } from '../../src/utils/payfast-crypto';

function parseFormBody(body: string | null): Record<string, string> {
  if (!body || typeof body !== 'string') return {};
  const params: Record<string, string> = {};
  const searchParams = new URLSearchParams(body);
  searchParams.forEach((value, key) => {
    params[key] = value;
  });
  return params;
}

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const passphrase = process.env.PAYFAST_PASSPHRASE ?? '';
  const params = parseFormBody(event.body);
  const receivedSignature = params.signature;

  if (!receivedSignature) {
    return { statusCode: 400, body: 'Bad Request: missing signature' };
  }

  const { signature: _, ...rest } = params;
  const computedSignature = generateSignature(rest, passphrase || undefined);
  if (computedSignature.toLowerCase() !== receivedSignature.toLowerCase()) {
    console.error('ITN: signature mismatch – security risk');
    return { statusCode: 400, body: 'Bad Request: invalid signature' };
  }

  if (params.payment_status !== 'COMPLETE') {
    return { statusCode: 200, body: '' };
  }

  const mPaymentId = params.m_payment_id;
  if (!mPaymentId) {
    return { statusCode: 200, body: '' };
  }

  const { data: order, error: orderError } = await supabaseAdmin
    .from('orders')
    .select('id, total_amount, status')
    .eq('id', mPaymentId)
    .single();

  if (orderError || !order) {
    console.error('ITN: order not found', mPaymentId, orderError);
    return { statusCode: 200, body: '' };
  }

  const amountGross = parseFloat(params.amount_gross ?? '');
  const orderTotal = Number(order.total_amount);
  if (Number.isNaN(amountGross) || Math.abs(amountGross - orderTotal) > 0.01) {
    console.error('ITN: amount mismatch', { amount_gross: amountGross, order_total: orderTotal });
    return { statusCode: 200, body: '' };
  }

  const pfPaymentId = params.pf_payment_id ?? null;

  const { error: updateError } = await supabaseAdmin
    .from('orders')
    .update({
      status: 'PAID',
      payfast_pf_payment_id: pfPaymentId,
    })
    .eq('id', order.id);

  if (updateError) {
    console.error('ITN: order update failed', updateError);
    return { statusCode: 200, body: '' };
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
        await supabaseAdmin
          .from('products')
          .update({ stock_quantity: newStock })
          .eq('id', item.product_id);
      }
    }
  }

  // Fire-and-forget: send order confirmation email (do not block or fail ITN response)
  const baseUrl = (process.env.URL || process.env.VITE_SITE_URL || 'https://alameencaps.com').replace(/\/$/, '');
  const secret = process.env.ORDER_CONFIRMATION_SECRET || '';
  const confirmUrl = `${baseUrl}/.netlify/functions/send-order-confirmation`;
  fetch(confirmUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(secret ? { 'X-Internal-Secret': secret } : {}) },
    body: JSON.stringify({ order_id: order.id }),
  }).catch((err) => console.error('ITN: order confirmation request failed', err));

  return { statusCode: 200, body: '' };
};
