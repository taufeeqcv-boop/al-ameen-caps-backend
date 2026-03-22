import type { Handler } from '@netlify/functions';

interface YocoCheckoutBody {
  amount: number;
  currency?: string;
  successUrl?: string;
  cancelUrl?: string;
  /** Raw phone from checkout; sanitized before Yoco metadata */
  phone?: string;
  email?: string;
}

/** Best-effort message from Yoco error JSON (RFC7807-style `detail`/`title`, or `errors[].detail`). */
function messageFromYocoErrorBody(data: unknown): string {
  if (!data || typeof data !== 'object') return '';
  const d = data as Record<string, unknown>;
  if (typeof d.detail === 'string' && d.detail.trim()) return d.detail.trim();
  if (typeof d.title === 'string' && d.title.trim()) return d.title.trim();
  if (typeof d.error === 'string' && d.error.trim()) return d.error.trim();
  if (typeof d.message === 'string' && d.message.trim()) return d.message.trim();
  if (Array.isArray(d.errors)) {
    const parts = d.errors
      .map((e) => {
        if (e && typeof e === 'object' && e !== null) {
          const o = e as Record<string, unknown>;
          if (typeof o.detail === 'string' && o.detail.trim()) return o.detail.trim();
          if (typeof o.message === 'string' && o.message.trim()) return o.message.trim();
        }
        return '';
      })
      .filter(Boolean);
    if (parts.length) return parts.join('; ');
  }
  return '';
}

/**
 * Netlify paste mistakes often cause 401: "Bearer sk_..." stored whole, or quotes around the key.
 * Yoco expects: Authorization: Bearer <key> where <key> is only sk_live_... or sk_test_...
 */
function normalizeYocoSecretKey(raw: string): string {
  let s = raw.trim();
  if (/^bearer\s+/i.test(s)) {
    s = s.replace(/^bearer\s+/i, '').trim();
  }
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    s = s.slice(1, -1).trim();
  }
  return s;
}

/** Strip non-digits; if national ZA (leading 0), convert to E.164 +27 for payment metadata. */
function sanitizePhoneForZAPayload(raw: string | undefined): string | null {
  const digits = String(raw ?? '').replace(/\D/g, '');
  if (!digits) return null;
  if (digits.length === 10 && digits.startsWith('0')) {
    return `+27${digits.slice(1)}`;
  }
  if (digits.length === 11 && digits.startsWith('27')) {
    return `+${digits}`;
  }
  return null;
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

  const secretKey = normalizeYocoSecretKey(process.env.YOCO_SECRET_KEY ?? '');
  if (!secretKey) {
    console.error('YOCO_SECRET_KEY is not set');
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Yoco integration is not configured correctly. Missing API Key.' }),
    };
  }

  const amountNumber = Number(body.amount);
  if (!Number.isFinite(amountNumber) || amountNumber <= 0) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Invalid amount' }),
    };
  }

  // Yoco expects amount in cents
  const amountInCents = Math.round(amountNumber * 100);
  const currency = body.currency || 'ZAR';

  const baseUrl = (process.env.VITE_SITE_URL || process.env.URL || 'https://alameencaps.com').replace(/\/$/, '');
  const successUrl = body.successUrl || `${baseUrl}/success`;
  const cancelUrl = body.cancelUrl || `${baseUrl}/checkout`;

  // Official Yoco Checkout API: POST https://payments.yoco.com/api/checkouts (OpenAPI field names).
  // Legacy endpoint api.yoco.com/v1/checkouts expects successRedirectUrl / cancelRedirectUrl / failureRedirectUrl.
  const defaultCheckoutUrl = 'https://payments.yoco.com/api/checkouts';
  const checkoutUrl = process.env.YOCO_CHECKOUT_URL || defaultCheckoutUrl;
  const isLegacyYocoEndpoint =
    /api\.yoco\.com/i.test(checkoutUrl) || /\/v1\/checkouts/i.test(checkoutUrl);

  const sanitizedPhone = sanitizePhoneForZAPayload(body.phone);
  const trimmedEmail = (body.email ?? '').trim();

  const yocoPayload: Record<string, unknown> = isLegacyYocoEndpoint
    ? {
        amount: amountInCents,
        currency,
        successRedirectUrl: successUrl,
        cancelRedirectUrl: cancelUrl,
        failureRedirectUrl: cancelUrl,
      }
    : {
        amount: amountInCents,
        currency,
        successUrl,
        cancelUrl,
        failureUrl: cancelUrl,
      };

  const metadata: Record<string, string> = {};
  if (sanitizedPhone) metadata.customerPhone = sanitizedPhone;
  if (trimmedEmail) metadata.customerEmail = trimmedEmail;
  if (Object.keys(metadata).length > 0) {
    yocoPayload.metadata = metadata;
  }

  try {
    if (!secretKey.startsWith('sk_')) {
      console.warn(
        'YOCO_SECRET_KEY should start with sk_test_ or sk_live_ (Yoco Payment Gateway). See https://app.yoco.com/sales/payments/payment-gateway'
      );
    }
    const yocoResponse = await fetch(checkoutUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(yocoPayload),
    });

    const data = await yocoResponse.json().catch(() => ({}));

    if (!yocoResponse.ok) {
      const upstream = messageFromYocoErrorBody(data);
      console.error('Yoco Checkout API error', yocoResponse.status, upstream || data);
      const status = yocoResponse.status >= 400 && yocoResponse.status < 500 ? 400 : 502;
      const fallback = 'Failed to initiate card payment. Please try again or use PayFast.';
      return {
        statusCode: status,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: upstream || fallback,
        }),
      };
    }

    const redirectUrl: string | undefined = (data && (data.redirectUrl || data.redirect_url)) as
      | string
      | undefined;
    if (!redirectUrl) {
      console.error('Yoco response missing redirectUrl', data);
      return {
        statusCode: 502,
        headers: { 'Content-Type': 'application/json' },
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
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: 'Could not reach payment gateway. Please check your connection or try PayFast.',
      }),
    };
  }
};

