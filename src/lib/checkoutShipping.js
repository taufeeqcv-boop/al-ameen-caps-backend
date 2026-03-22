import { getSouthAfricanMobileDigits } from "./validateCheckoutForm.js";

/**
 * Normalized shipping payload for orders (after form validation).
 * Phone stored as 10-digit national format (e.g. 0622996917).
 *
 * @param {Record<string, unknown>} formData
 * @param {'delivery' | 'collection'} deliveryType
 * @returns {Record<string, string>}
 */
export function buildShippingPayload(formData, deliveryType) {
  return {
    delivery_type: deliveryType,
    address_line1: String(formData.address_line_1 ?? "").trim(),
    address_line2: String(formData.address_line_2 ?? "").trim(),
    city: String(formData.city ?? "").trim(),
    postal_code: String(formData.postal_code ?? "").trim(),
    phone: getSouthAfricanMobileDigits(formData.cell_number),
  };
}
