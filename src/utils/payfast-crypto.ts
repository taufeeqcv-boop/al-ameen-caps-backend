import crypto from 'crypto';

/**
 * URL-encode a value for PayFast (spaces become +).
 */
function encodeValue(value: string): string {
  return encodeURIComponent(value).replace(/%20/g, '+');
}

/**
 * Generate PayFast signature string using PayFast's required field order.
 * PayFast requires fields in this EXACT order (not alphabetically):
 * merchant_id, merchant_key, return_url, cancel_url, notify_url, name_first, name_last, email_address, m_payment_id, amount, item_name
 * Then append passphrase at the end.
 */
export function generateSignature(
  data: Record<string, any>,
  passphrase?: string
): string {
  // PayFast required field order (exact order, not alphabetical)
  const requiredOrder = [
    'merchant_id',
    'merchant_key',
    'return_url',
    'cancel_url',
    'notify_url',
    'name_first',
    'name_last',
    'email_address',
    'm_payment_id',
    'amount',
    'item_name'
  ];

  // Filter out empty/null values and exclude testing/signature fields
  const filtered: Record<string, string> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value != null && value !== '' && key !== 'testing' && key !== 'signature') {
      filtered[key] = String(value).trim();
    }
  }

  // Build signature string in PayFast's required order
  const parts: string[] = [];
  for (const key of requiredOrder) {
    if (filtered[key] != null && filtered[key] !== '') {
      parts.push(`${key}=${encodeValue(filtered[key])}`);
    }
  }

  let str = parts.join('&');

  // Append passphrase (required for PayFast signature validation)
  if (passphrase != null && passphrase !== '') {
    str += `&passphrase=${encodeValue(passphrase)}`;
  }

  return crypto.createHash('md5').update(str).digest('hex');
}
