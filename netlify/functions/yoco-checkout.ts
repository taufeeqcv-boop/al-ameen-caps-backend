import type { Handler } from '@netlify/functions';

interface YocoCheckoutBody {
  amount: number;
  currency?: string;
  successUrl?: string;
  cancelUrl?: string;
}

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  let body: YocoCheckoutBody;
  try {
    body = event.body ? JSON.parse(event.body) : {};
  } catch {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid JSON body' }),
    };
  }

  const secretKey = process.env.YOCO_SECRET_KEY;
  if (!secretKey) {
    console.error('YOCO_SECRET_KEY is not set');
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Payment configuration error. Please contact support.' }),
    };
  }

  const amountNumber = Number(body.amount);
  if (!Number.isFinite(amountNumber) || amountNumber <= 0) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid amount' }),
    };
  }

  // Yoco expects amount in cents
  const amountInCents = Math.round(amountNumber * 100);
  const currency = body.currency || 'ZAR';

  const baseUrl = (process.env.VITE_SITE_URL || process.env.URL || 'https://alameencaps.com').replace(/\/$/, '');
  const successUrl = body.successUrl || `${baseUrl}/success`;
  const cancelUrl = body.cancelUrl || `${baseUrl}/checkout`;

  try {
    const yocoResponse = await fetch('https://api.yoco.com/checkouts', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: amountInCents,
        currency,
        successUrl,
        cancelUrl,
      }),
    });

    const data = await yocoResponse.json().catch(() => ({}));

    if (!yocoResponse.ok) {
      console.error('Yoco Checkout API error', yocoResponse.status, data);
      return {
        statusCode: 502,
        body: JSON.stringify({
          error: data?.error || 'Failed to initiate card payment. Please try again or use PayFast.',
        }),
      };
    }

    const redirectUrl: string | undefined = (data && (data.redirectUrl || data.redirectUrl)) as string | undefined;
    if (!redirectUrl) {
      console.error('Yoco response missing redirectUrl', data);
      return {
        statusCode: 502,
        body: JSON.stringify({
          error: 'Payment gateway error. Please try again or use PayFast.',
        }),
      };
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ redirectUrl }),
    };
  } catch (err) {
    console.error('Error calling Yoco Checkout API', err);
    return {
      statusCode: 502,
      body: JSON.stringify({
        error: 'Could not reach payment gateway. Please check your connection or try PayFast.',
      }),
    };
  }
};

