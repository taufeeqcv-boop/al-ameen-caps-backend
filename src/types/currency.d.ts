/**
 * Shared type definitions for currency and pricing.
 * Used by lib/format.ts and can be extended for cart/checkout.
 */
export type ZAR = number;

export interface PriceDisplay {
  raw: number;
  formatted: string;
}
