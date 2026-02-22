/**
 * Checkout form validation. Extracted for reuse and testing.
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_MIN_DIGITS = 9;

/**
 * @param {Record<string, unknown>} formData
 * @param {boolean} [requireAddress=true]
 * @returns {{ valid: boolean; message: string }}
 */
export function validateCheckoutForm(formData, requireAddress = true) {
  const first = (String(formData.name_first ?? "")).trim();
  const last = (String(formData.name_last ?? "")).trim();
  const email = (String(formData.email_address ?? "")).trim();
  const phone = (String(formData.cell_number ?? "")).trim();
  if (!first) return { valid: false, message: "Please enter your first name." };
  if (!last) return { valid: false, message: "Please enter your last name." };
  if (!email) return { valid: false, message: "Please enter your email address." };
  if (!EMAIL_REGEX.test(email)) return { valid: false, message: "Please enter a valid email address." };
  if (!phone) return { valid: false, message: "Please enter your phone number." };
  const digits = phone.replace(/\D/g, "");
  if (digits.length < PHONE_MIN_DIGITS)
    return { valid: false, message: "Please enter a valid phone number (at least 9 digits)." };
  if (requireAddress) {
    if (!(String(formData.address_line_1 ?? "")).trim())
      return { valid: false, message: "Please enter your address." };
    if (!(String(formData.city ?? "")).trim()) return { valid: false, message: "Please enter your city." };
    if (!(String(formData.postal_code ?? "")).trim())
      return { valid: false, message: "Please enter your postal code." };
  }
  return { valid: true, message: "" };
}
