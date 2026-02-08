import crypto from 'crypto';

/**
 * URL-encode a value for PayFast (spaces become +).
 */
function encodeValue(value: string): string {
  return encodeURIComponent(value).replace(/%20/g, '+');
}

/**
 * Generate PayFast signature string: strip empty/null, sort keys, concat key=value,
 * optionally append passphrase, then return MD5 hex.
 */
export function generateSignature(
  data: Record<string, any>,
  passphrase?: string
): string {
  const filtered: Record<string, string> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value != null && value !== '') {
      filtered[key] = String(value);
    }
  }

  const keys = Object.keys(filtered).sort();
  const parts = keys.map((key) => `${key}=${encodeValue(filtered[key])}`);
  let str = parts.join('&');

  if (passphrase != null && passphrase !== '') {
    str += `&passphrase=${encodeValue(passphrase)}`;
  }

  return crypto.createHash('md5').update(str).digest('hex');
}
