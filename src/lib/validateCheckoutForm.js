/**
 * Checkout form validation. Extracted for reuse and testing.
 * Phone: South African mobile, exactly 10 digits starting with 06, 07, or 08.
 */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** National format: 10 digits, leading 0 then 6/7/8 and 8 more digits. */
export const SA_MOBILE_REGEX = /^0(6|7|8)[0-9]{8}$/;

/**
 * @param {unknown} raw
 * @returns {string} digits only
 */
export function getSouthAfricanMobileDigits(raw) {
  return String(raw ?? "").replace(/\D/g, "");
}

/**
 * @param {unknown} raw
 * @returns {{ valid: boolean; message: string; digits: string }}
 */
export function validateSouthAfricanMobilePhone(raw) {
  const digits = getSouthAfricanMobileDigits(raw);
  if (!digits) {
    return { valid: false, message: "Please enter your phone number.", digits: "" };
  }
  if (!SA_MOBILE_REGEX.test(digits)) {
    return {
      valid: false,
      message: "Enter a valid South African mobile number: 10 digits starting with 06, 07, or 08.",
      digits,
    };
  }
  return { valid: true, message: "", digits };
}

/**
 * @param {Record<string, unknown>} formData
 * @param {boolean} [requireAddress=true]
 * @returns {{ valid: boolean; message: string }}
 */
export function validateCheckoutForm(formData, requireAddress = true) {
  const first = String(formData.name_first ?? "").trim();
  const last = String(formData.name_last ?? "").trim();
  const email = String(formData.email_address ?? "").trim();
  if (!first) return { valid: false, message: "Please enter your first name." };
  if (!last) return { valid: false, message: "Please enter your last name." };
  if (!email) return { valid: false, message: "Please enter your email address." };
  if (!EMAIL_REGEX.test(email)) return { valid: false, message: "Please enter a valid email address." };

  const phoneResult = validateSouthAfricanMobilePhone(formData.cell_number);
  if (!phoneResult.valid) return { valid: false, message: phoneResult.message };

  if (requireAddress) {
    if (!String(formData.address_line_1 ?? "").trim())
      return { valid: false, message: "Please enter your address." };
    if (!String(formData.city ?? "").trim()) return { valid: false, message: "Please enter your city." };
    if (!String(formData.postal_code ?? "").trim())
      return { valid: false, message: "Please enter your postal code." };
  }
  return { valid: true, message: "" };
}
