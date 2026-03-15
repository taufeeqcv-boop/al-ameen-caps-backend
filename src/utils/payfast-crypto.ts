import crypto from 'crypto';

/**
 * URL-encode a value for PayFast (spaces become +).
 */
function encodeValue(value: string): string {
  return encodeURIComponent(value).replace(/%20/g, '+');
}

/**
 * Generate PayFast signature string.
 * PayFast signature requirements:
 * 1. Exclude merchant_key, signature, and testing from signature calculation
 * 2. Include all other non-empty fields
 * 3. Sort keys alphabetically (PayFast standard)
 * 4. Build key=value pairs with URL encoding (%20 -> +)
 * 5. Append passphrase at the end
 */
export function generateSignature(
  data: Record<string, any>,
  passphrase?: string
): string {
  // Filter out empty/null values and exclude fields not in signature
  const filtered: Record<string, string> = {};
  for (const [key, value] of Object.entries(data)) {
    // Exclude: merchant_key (not in signature), signature (circular), testing (not in signature)
    if (value != null && value !== '' && key !== 'merchant_key' && key !== 'signature' && key !== 'testing') {
      filtered[key] = String(value).trim();
    }
  }

  // Sort keys alphabetically (PayFast standard requirement for form POST)
  const keys = Object.keys(filtered).sort();
  const parts = keys.map((key) => `${key}=${encodeValue(filtered[key])}`);
  let str = parts.join('&');

  // CRITICAL: PayFast requires passphrase to be appended even if empty
  // Always append passphrase parameter (PayFast will validate it)
  const passphraseValue = passphrase != null ? String(passphrase).trim() : '';
  str += `&passphrase=${encodeValue(passphraseValue)}`;

  return crypto.createHash('md5').update(str).digest('hex');
}
