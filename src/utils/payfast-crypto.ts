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
 * PayFast “Create your checkout form” field order (NOT alphabetical).
 * custom_int1–5 before custom_str1–5 — matches official docs.
 * @see https://developers.payfast.co.za/docs#step_1_form_fields
 */
const CHECKOUT_SIGNATURE_FIELD_ORDER = [
  'merchant_id',
  'merchant_key',
  'return_url',
  'cancel_url',
  'notify_url',
  'notify_method',
  'name_first',
  'name_last',
  'email_address',
  'cell_number',
  'm_payment_id',
  'amount',
  'item_name',
  'item_description',
  'custom_int1',
  'custom_int2',
  'custom_int3',
  'custom_int4',
  'custom_int5',
  'custom_str1',
  'custom_str2',
  'custom_str3',
  'custom_str4',
  'custom_str5',
  'email_confirmation',
  'confirmation_address',
  'payment_method',
  'subscription_type',
  'billing_date',
  'recurring_amount',
  'frequency',
  'cycles',
];

/** Fields never included in the signature string (form POST). */
const EXCLUDE_FROM_FORM_SIGNATURE = new Set(['signature', 'testing']);

function sortByPriorityList(keys: string[], priority: string[]): string[] {
  const priorityDict: Record<string, number> = {};
  for (let i = 0; i < priority.length; i++) {
    priorityDict[priority[i]] = i;
  }
  const fallback = priority.length;
  return [...keys].sort((a, b) => {
    const pa = priorityDict[a] !== undefined ? priorityDict[a] : fallback;
    const pb = priorityDict[b] !== undefined ? priorityDict[b] : fallback;
    if (pa !== pb) return pa - pb;
    return String(a).localeCompare(String(b));
  });
}

/**
 * PayFast **payment form** signature (redirect to payfast.co.za).
 * Same algorithm as `payfast.js` `generateSignature` (priority order + passphrase appended).
 */
export function generateFormSignature(data: Record<string, any>, passphrase?: string): string {
  const filtered: Record<string, string> = {};
  for (const [key, value] of Object.entries(data)) {
    if (EXCLUDE_FROM_FORM_SIGNATURE.has(key)) continue;
    if (value == null || value === '') continue;
    filtered[key] = String(value).trim();
  }

  const keys = sortByPriorityList(Object.keys(filtered), CHECKOUT_SIGNATURE_FIELD_ORDER);
  const parts = keys.map((k) => `${k}=${encodeValue(filtered[k])}`);
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
