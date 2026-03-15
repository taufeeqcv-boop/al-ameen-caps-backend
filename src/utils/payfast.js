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
  // PayFast signature generation:
  // 1. Exclude merchant_key, signature, and testing from signature calculation
  // 2. Include all other non-empty fields
  // 3. Sort keys alphabetically (PayFast standard requirement)
  // 4. Build key=value pairs with URL encoding
  // 5. Append passphrase at the end

  // Filter out empty/null values and exclude fields not in signature
  const filtered = {};
  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      const val = data[key];
      // Exclude: merchant_key (not in signature), signature (circular), testing (not in signature)
      if (val != null && val !== "" && key !== 'merchant_key' && key !== 'signature' && key !== 'testing') {
        filtered[key] = String(val).trim();
      }
    }
  }

  // Sort keys alphabetically (PayFast standard requirement)
  const sortedKeys = Object.keys(filtered).sort();
  
  // Build signature string
  const parts = sortedKeys.map((key) => {
    const encoded = encodeURIComponent(filtered[key]).replace(/%20/g, '+');
    return `${key}=${encoded}`;
  });

  let signatureString = parts.join('&');

  // Append passphrase (required for PayFast signature validation)
  if (passPhrase != null && passPhrase !== "") {
    const encodedPassphrase = encodeURIComponent(String(passPhrase).trim()).replace(/%20/g, '+');
    signatureString += `&passphrase=${encodedPassphrase}`;
  }

  return md5(signatureString).toString();
};
