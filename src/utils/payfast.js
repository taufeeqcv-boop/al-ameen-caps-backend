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
  // PayFast signature generation for form POST:
  // 1. Exclude merchant_key, signature, and testing from signature calculation
  // 2. Include all other non-empty fields
  // 3. Sort keys alphabetically (PayFast standard for form POST)
  // 4. Build key=value pairs with URL encoding (%20 -> +)
  // 5. Append passphrase at the end (always, even if empty string)
  
  // CRITICAL: PayFast requires passphrase to be appended even if empty
  // This is different from some other payment gateways

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

  // Sort keys alphabetically (PayFast standard requirement for form POST)
  const sortedKeys = Object.keys(filtered).sort();
  
  // Build signature string with proper URL encoding
  const parts = sortedKeys.map((key) => {
    const value = filtered[key];
    // URL encode and replace %20 with + (PayFast requirement)
    const encoded = encodeURIComponent(value).replace(/%20/g, '+');
    return `${key}=${encoded}`;
  });

  let signatureString = parts.join('&');

  // CRITICAL: PayFast requires passphrase to be appended even if empty or null
  // Always append passphrase parameter (PayFast will validate it)
  const passphraseValue = passPhrase != null ? String(passPhrase).trim() : '';
  const encodedPassphrase = encodeURIComponent(passphraseValue).replace(/%20/g, '+');
  signatureString += `&passphrase=${encodedPassphrase}`;

  // Log signature string for debugging (remove in production if needed)
  if (typeof console !== 'undefined' && console.log) {
    console.log('PayFast Signature String (before MD5):', signatureString.replace(/passphrase=[^&]+/, 'passphrase=***'));
  }

  return md5(signatureString).toString();
};
