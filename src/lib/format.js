/**
 * Format price in ZAR for display (e.g. R 145, R 1,450) — no cents
 */
export function formatPrice(price) {
  const n = Number(price);
  if (Number.isNaN(n) || n < 0) return "R 0";
  const whole = Math.round(n).toString();
  const withCommas = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `R ${withCommas}`;
}
