import crypto from 'crypto';

/**
 * PayFast PHP-style encoding: spaces as +, uppercase hex in %-sequences (matches typical PayFast verification).
 */
function encodeValue(value: string): string {
  return encodeURIComponent(value)
    .replace(/%20/g, '+')
    .replace(/%([0-9a-f]{2})/gi, (_, hex) => '%' + hex.toUpperCase());
}

/** Some PayFast/PHP paths use lowercase percent-encoding in ITN strings. */
function encodeValueLowerHex(value: string): string {
  return encodeURIComponent(value)
    .replace(/%20/g, '+')
    .replace(/%([0-9A-Fa-f]{2})/g, (m) => m.toLowerCase());
}

/**
 * Custom / hosted payment form: field order per PayFast & Network International integration docs
 * (NOT alphabetical). Includes merchant_key. URLs and email must be encoded in the signing string.
 * @see https://developers.payfast.co.za/docs#step_2_signature
 */
const PAYFAST_FORM_FIELD_ORDER = [
  'merchant_id',
  'merchant_key',
  'return_url',
  'cancel_url',
  'notify_url',
  'name_first',
  'name_last',
  'email_address',
  'cell_number',
  'm_payment_id',
  'amount',
  'item_name',
  'item_description',
  'custom_str1',
  'custom_str2',
  'custom_str3',
  'custom_str4',
  'custom_str5',
  'custom_int1',
  'custom_int2',
  'custom_int3',
  'custom_int4',
  'custom_int5',
];

/** Fields never included in the signature string (form POST). */
const EXCLUDE_FROM_FORM_SIGNATURE = new Set(['signature', 'testing']);

/**
 * PayFast **payment form** signature (redirect to payfast.co.za).
 * Uses documented field order; includes merchant_key; excludes signature & testing.
 */
export function generateFormSignature(data: Record<string, any>, passphrase?: string): string {
  const parts: string[] = [];
  const used = new Set<string>();

  const valFor = (key: string): string | null => {
    if (!Object.prototype.hasOwnProperty.call(data, key)) return null;
    if (EXCLUDE_FROM_FORM_SIGNATURE.has(key)) return null;
    const v = data[key];
    if (v == null || v === '') return null;
    return String(v).trim();
  };

  for (const key of PAYFAST_FORM_FIELD_ORDER) {
    const val = valFor(key);
    if (val === null) continue;
    parts.push(`${key}=${encodeValue(val)}`);
    used.add(key);
  }

  const rest = Object.keys(data)
    .filter((k) => !used.has(k) && !EXCLUDE_FROM_FORM_SIGNATURE.has(k))
    .sort();
  for (const key of rest) {
    const val = valFor(key);
    if (val === null) continue;
    parts.push(`${key}=${encodeValue(val)}`);
  }

  let str = parts.join('&');
  const passphraseValue = passphrase != null ? String(passphrase).trim() : '';
  str += `&passphrase=${encodeValue(passphraseValue)}`;

  return crypto.createHash('md5').update(str).digest('hex');
}

/**
 * PayFast **ITN** (Instant Transaction Notification) verification.
 * Alphabetically sorted keys, URL-encoded values; include merchant_key if PayFast sends it.
 * Excludes: signature, testing (per PayFast ITN docs).
 */
export function generateSignature(
  data: Record<string, any>,
  passphrase?: string
): string {
  const filtered: Record<string, string> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value != null && value !== '' && key !== 'signature' && key !== 'testing') {
      filtered[key] = String(value).trim();
    }
  }

  const keys = Object.keys(filtered).sort();
  const parts = keys.map((key) => `${key}=${encodeValue(filtered[key])}`);
  let str = parts.join('&');

  const passphraseValue = passphrase != null ? String(passphrase).trim() : '';
  str += `&passphrase=${encodeValue(passphraseValue)}`;

  return crypto.createHash('md5').update(str).digest('hex');
}

/**
 * Verify PayFast ITN signature — try common variants (encoding + optional merchant_key exclusion).
 */
export function verifyPayfastItnSignature(
  dataWithoutSignature: Record<string, string>,
  passphrase: string | undefined,
  receivedSignature: string
): boolean {
  const want = receivedSignature.trim().toLowerCase();

  const encoders: Array<{ fn: (s: string) => string }> = [{ fn: encodeValue }, { fn: encodeValueLowerHex }];

  for (const { fn: enc } of encoders) {
    for (const excludeMerchantKey of [false, true]) {
      const filtered: Record<string, string> = {};
      for (const [key, value] of Object.entries(dataWithoutSignature)) {
        if (key === 'signature' || key === 'testing') continue;
        if (excludeMerchantKey && key === 'merchant_key') continue;
        if (value == null || value === '') continue;
        filtered[key] = String(value).trim();
      }
      const keys = Object.keys(filtered).sort();
      const parts = keys.map((k) => `${k}=${enc(filtered[k])}`);
      let str = parts.join('&');
      const passphraseValue = passphrase != null ? String(passphrase).trim() : '';
      str += `&passphrase=${enc(passphraseValue)}`;
      const hash = crypto.createHash('md5').update(str).digest('hex');
      if (hash.toLowerCase() === want) return true;
    }
  }

  return false;
}

/** For debugging failed ITN: safe one-line summary (no secrets). */
export function describeItnSignatureAttempts(
  dataWithoutSignature: Record<string, string>,
  passphrase: string | undefined,
  receivedSignature: string
): string {
  const want = receivedSignature.trim().toLowerCase();
  const encoders: Array<{ fn: (s: string) => string }> = [{ fn: encodeValue }, { fn: encodeValueLowerHex }];
  const previews: string[] = [];
  for (const { fn: enc } of encoders) {
    for (const excludeMerchantKey of [false, true]) {
      const filtered: Record<string, string> = {};
      for (const [key, value] of Object.entries(dataWithoutSignature)) {
        if (key === 'signature' || key === 'testing') continue;
        if (excludeMerchantKey && key === 'merchant_key') continue;
        if (value == null || value === '') continue;
        filtered[key] = String(value).trim();
      }
      const keys = Object.keys(filtered).sort();
      const parts = keys.map((k) => `${k}=${enc(filtered[k])}`);
      let str = parts.join('&');
      const passphraseValue = passphrase != null ? String(passphrase).trim() : '';
      str += `&passphrase=${enc(passphraseValue)}`;
      const hash = crypto.createHash('md5').update(str).digest('hex');
      const ok = hash.toLowerCase() === want;
      previews.push(ok ? 'OK' : hash.slice(0, 8));
    }
  }
  return `received=${want.slice(0, 8)}… computed=[${previews.join(',')}]`;
}
