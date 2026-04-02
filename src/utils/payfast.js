import md5 from "crypto-js/md5";

/**
 * PayFast (PHP-style) encoding: spaces as +, hex digits in %-sequences uppercase.
 */
function encodePayFastValue(value) {
  return encodeURIComponent(String(value))
    .replace(/%20/g, "+")
    .replace(/%([0-9a-f]{2})/gi, (_, hex) => "%" + hex.toUpperCase());
}

/**
 * PayFast “Create your checkout form” field order (NOT alphabetical).
 * custom_int1–5 before custom_str1–5 — matches official docs and Dean Malan’s working integration.
 * @see https://developers.payfast.co.za/docs#step_1_form_fields
 */
const CHECKOUT_SIGNATURE_FIELD_ORDER = [
  "merchant_id",
  "merchant_key",
  "return_url",
  "cancel_url",
  "notify_url",
  "notify_method",
  "name_first",
  "name_last",
  "email_address",
  "cell_number",
  "m_payment_id",
  "amount",
  "item_name",
  "item_description",
  "custom_int1",
  "custom_int2",
  "custom_int3",
  "custom_int4",
  "custom_int5",
  "custom_str1",
  "custom_str2",
  "custom_str3",
  "custom_str4",
  "custom_str5",
  "email_confirmation",
  "confirmation_address",
  "payment_method",
  "subscription_type",
  "billing_date",
  "recurring_amount",
  "frequency",
  "cycles",
];

const EXCLUDE_FROM_FORM_SIGNATURE = new Set(["signature", "testing"]);

/** Sort keys by PayFast checkout priority; unknown keys after listed fields, then alphabetically. */
export function sortByPriorityList(keys, priority) {
  const priorityDict = {};
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
 * Generate PayFast security signature for payment form POST (browser).
 * One string: all non-empty fields (excl. signature, testing) sorted by official checkout order,
 * then `&passphrase=` + encoded passphrase (same pattern as PayFast docs / PHP integrations).
 */
export const generateSignature = (data, passPhrase = null) => {
  const filtered = {};
  for (const [key, value] of Object.entries(data)) {
    if (EXCLUDE_FROM_FORM_SIGNATURE.has(key)) continue;
    if (value == null || value === "") continue;
    filtered[key] = String(value).trim();
  }

  const keys = sortByPriorityList(Object.keys(filtered), CHECKOUT_SIGNATURE_FIELD_ORDER);
  const parts = keys.map((k) => `${k}=${encodePayFastValue(filtered[k])}`);
  let signatureString = parts.join("&");

  const passphraseValue = passPhrase != null ? String(passPhrase).trim() : "";
  signatureString += `&passphrase=${encodePayFastValue(passphraseValue)}`;

  const md5Hex = md5(signatureString).toString();

  const payfastDebug =
    import.meta.env.DEV ||
    String(import.meta.env.VITE_PAYFAST_DEBUG ?? "")
      .trim()
      .toLowerCase() === "true";

  if (payfastDebug && typeof console !== "undefined") {
    const redacted = signatureString.replace(/passphrase=[^&]*/, "passphrase=***REDACTED***");
    console.log("[PayFast] Signature debug (checkout field priority order)", {
      stringBeforeMd5_redacted: redacted,
      md5: md5Hex,
      note: "merchant_key included; custom_int before custom_str per docs; passphrase appended last.",
    });
  }

  return md5Hex;
};

/**
 * Alternative: **alphabetically** sorted keys, with **passphrase** included in the sort (PHP `ksort` + passphrase in data).
 * Use when `VITE_PAYFAST_FORM_SIGNATURE_ALPHABETICAL=true` if priority-order signing still fails.
 */
export const generateSignatureAlphabetical = (data, passPhrase = null) => {
  const filtered = {};
  for (const [key, value] of Object.entries(data)) {
    if (value == null || value === "") continue;
    if (EXCLUDE_FROM_FORM_SIGNATURE.has(key)) continue;
    filtered[key] = String(value).trim();
  }
  const passphraseValue = passPhrase != null ? String(passPhrase).trim() : "";
  if (passphraseValue) {
    filtered.passphrase = passphraseValue;
  }
  const keys = Object.keys(filtered).sort();
  const parts = keys.map((k) => `${k}=${encodePayFastValue(filtered[k])}`);
  return md5(parts.join("&")).toString();
};
