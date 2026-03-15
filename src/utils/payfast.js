import md5 from "crypto-js/md5";

/**
 * Generate PayFast security signature for payment form.
 * @param {Record<string, string>} data - Key-value pairs for PayFast
 * @param {string|null} passPhrase - PayFast passphrase (optional)
 * @returns {string} MD5 hash
 */
/**
 * Generate PayFast security signature for payment form.
 * PayFast requires keys to be sorted alphabetically for signature generation.
 * @param {Record<string, string>} data - Key-value pairs for PayFast
 * @param {string|null} passPhrase - PayFast passphrase (optional)
 * @returns {string} MD5 hash
 */
export const generateSignature = (data, passPhrase = null) => {
  // Filter out empty/null values and convert to string
  const filtered = {};
  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      const val = data[key];
      if (val != null && val !== "") {
        filtered[key] = String(val).trim();
      }
    }
  }

  // Sort keys alphabetically (PayFast requirement)
  const sortedKeys = Object.keys(filtered).sort();
  
  // Build signature string
  let signatureString = sortedKeys
    .map((key) => `${key}=${encodeURIComponent(filtered[key]).replace(/%20/g, "+")}`)
    .join("&");

  // Append passphrase if provided
  if (passPhrase != null && passPhrase !== "") {
    signatureString += `&passphrase=${encodeURIComponent(String(passPhrase).trim()).replace(/%20/g, "+")}`;
  }

  return md5(signatureString).toString();
};
