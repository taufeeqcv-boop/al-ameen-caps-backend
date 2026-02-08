/**
 * ZAR currency formatter (en-ZA locale, symbol R).
 * Use for all prices across Store, Cart, Admin, and Order details.
 */
const zarFormatter = new Intl.NumberFormat("en-ZA", {
  style: "currency",
  currency: "ZAR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/**
 * Format price in ZAR for display (e.g. R 145.00, R 1,450.00).
 * @param {number} price - Amount in ZAR
 * @returns {string} Formatted string with R symbol
 */
export function formatPrice(price) {
  const n = Number(price);
  if (Number.isNaN(n) || n < 0) return zarFormatter.format(0);
  return zarFormatter.format(n);
}

/** Alias for formatPrice (same function). */
export const formatCurrency = formatPrice;
