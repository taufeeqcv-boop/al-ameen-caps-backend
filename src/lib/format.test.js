/**
 * Tests for lib/format.js (formatPrice / formatCurrency).
 */
import { describe, it, expect } from "vitest";
import { formatPrice, formatCurrency } from "./format";

// en-ZA uses comma as decimal separator (e.g. R 145,00)
describe("formatPrice", () => {
  it("formats positive number as ZAR", () => {
    expect(formatPrice(145)).toMatch(/R\s*145[,.]00/);
    expect(formatPrice(1450)).toMatch(/R\s*1[\s.]?450[,.]00/);
  });

  it("formats zero as R 0,00", () => {
    expect(formatPrice(0)).toMatch(/R\s*0[,.]00/);
  });

  it("treats negative as zero", () => {
    expect(formatPrice(-10)).toMatch(/R\s*0[,.]00/);
  });

  it("treats NaN as zero", () => {
    expect(formatPrice(NaN)).toMatch(/R\s*0[,.]00/);
    expect(formatPrice("not a number")).toMatch(/R\s*0[,.]00/);
  });

  it("accepts string numbers", () => {
    expect(formatPrice("99.50")).toMatch(/R\s*99[,.]50/);
  });
});

describe("formatCurrency", () => {
  it("is an alias for formatPrice", () => {
    expect(formatCurrency(100)).toBe(formatPrice(100));
  });
});
