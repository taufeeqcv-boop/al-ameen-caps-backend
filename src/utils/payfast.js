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
 * Custom / hosted form: documented field order (NOT alphabetical), includes merchant_key.
 * Network International / PayFast: URLs and email must be properly encoded in this string.
 * @see https://developers.payfast.co.za/docs#step_2_signature
 */
const PAYFAST_FORM_FIELD_ORDER = [
  "merchant_id",
  "merchant_key",
  "return_url",
  "cancel_url",
  "notify_url",
  "name_first",
  "name_last",
  "email_address",
  "cell_number",
  "m_payment_id",
  "amount",
  "item_name",
  "item_description",
  "custom_str1",
  "custom_str2",
  "custom_str3",
  "custom_str4",
  "custom_str5",
  "custom_int1",
  "custom_int2",
  "custom_int3",
  "custom_int4",
  "custom_int5",
];

const EXCLUDE_FROM_FORM_SIGNATURE = new Set(["signature", "testing"]);

/**
 * Generate PayFast security signature for payment form POST (browser).
 * Uses documented field order — not alphabetical — per PayFast custom integration.
 */
export const generateSignature = (data, passPhrase = null) => {
  const parts = [];
  const used = new Set();

  const valFor = (key) => {
    if (!Object.prototype.hasOwnProperty.call(data, key)) return null;
    if (EXCLUDE_FROM_FORM_SIGNATURE.has(key)) return null;
    const val = data[key];
    if (val == null || val === "") return null;
    return String(val).trim();
  };

  for (const key of PAYFAST_FORM_FIELD_ORDER) {
    const val = valFor(key);
    if (val === null) continue;
    parts.push(`${key}=${encodePayFastValue(val)}`);
    used.add(key);
  }

  const rest = Object.keys(data)
    .filter((k) => !used.has(k) && !EXCLUDE_FROM_FORM_SIGNATURE.has(k))
    .sort();
  for (const key of rest) {
    const val = valFor(key);
    if (val === null) continue;
    parts.push(`${key}=${encodePayFastValue(val)}`);
  }

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
    console.log("[PayFast] Signature debug (custom form order; not alphabetical)", {
      stringBeforeMd5_redacted: redacted,
      md5: md5Hex,
      note: "Per PayFast / Network International: merchant_key included; URLs/email encoded.",
    });
  }

  return md5Hex;
};
