import type { Handler } from '@netlify/functions';
import { supabaseAdmin } from './lib/supabaseAdmin';
import { generateSignature } from '../../src/utils/payfast-crypto';

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  let orderId: string;
  try {
    const body = event.body ? JSON.parse(event.body) : {};
    orderId = body.order_id;
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON body' }) };
  }

  if (!orderId || typeof orderId !== 'string') {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing order_id' }) };
  }

  const { data: order, error: orderError } = await supabaseAdmin
    .from('orders')
    .select('id, user_id, status, total_amount')
    .eq('id', orderId)
    .single();

  if (orderError || !order) {
    return { statusCode: 404, body: JSON.stringify({ error: 'Order not found' }) };
  }

  if (order.status !== 'PENDING') {
    return { statusCode: 400, body: JSON.stringify({ error: 'Order is not pending' }) };
  }

  const { data: userData } = await supabaseAdmin.auth.admin.getUserById(order.user_id);
  const email_address = userData?.user?.email ?? '';

  const baseUrl = (process.env.VITE_SITE_URL || process.env.URL || 'https://www.alameencaps.com').replace(/\/$/, '');
  const merchant_id = process.env.PAYFAST_MERCHANT_ID || '';
  const merchant_key = process.env.PAYFAST_MERCHANT_KEY || '';
  const passphrase = process.env.PAYFAST_PASSPHRASE || undefined;

  const payload: Record<string, string> = {
    merchant_id,
    merchant_key,
    return_url: `${baseUrl}/success`,
    cancel_url: `${baseUrl}/cancel`,
    notify_url: `${baseUrl}/.netlify/functions/itn-listener`,
    email_address,
    m_payment_id: order.id,
    amount: String(Number(order.total_amount).toFixed(2)),
    item_name: `Order #${order.id}`,
  };

  const signature = generateSignature(payload, passphrase);

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ payload, signature }),
  };
};
