import md5 from "crypto-js/md5";

/**
 * Generate PayFast security signature for payment form.
 * @param {Record<string, string>} data - Key-value pairs for PayFast
 * @param {string|null} passPhrase - PayFast passphrase (optional)
 * @returns {string} MD5 hash
 */
/**
 * Generate PayFast security signature for payment form.
 * PayFast requires fields in this EXACT order (not alphabetically):
 * merchant_id, merchant_key, return_url, cancel_url, notify_url, name_first, name_last, email_address, m_payment_id, amount, item_name
 * @param {Record<string, string>} data - Key-value pairs for PayFast
 * @param {string|null} passPhrase - PayFast passphrase (required)
 * @returns {string} MD5 hash
 */
export const generateSignature = (data, passPhrase = null) => {
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

  // Filter out empty/null values and convert to string
  const filtered = {};
  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      const val = data[key];
      // Skip empty values and testing parameter (not included in signature)
      if (val != null && val !== "" && key !== 'testing' && key !== 'signature') {
        filtered[key] = String(val).trim();
      }
    }
  }

  // Build signature string in PayFast's required order
  const parts = [];
  for (const key of requiredOrder) {
    if (filtered[key] != null && filtered[key] !== '') {
      const encoded = encodeURIComponent(filtered[key]).replace(/%20/g, '+');
      parts.push(`${key}=${encoded}`);
    }
  }

  let signatureString = parts.join('&');

  // Append passphrase (required for PayFast signature validation)
  if (passPhrase != null && passPhrase !== "") {
    const encodedPassphrase = encodeURIComponent(String(passPhrase).trim()).replace(/%20/g, '+');
    signatureString += `&passphrase=${encodedPassphrase}`;
  }

  return md5(signatureString).toString();
};
