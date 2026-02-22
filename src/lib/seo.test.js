/**
 * Tests for SEO helpers: getProductMetaTitle, getProductMetaDescription.
 */
import { describe, it, expect } from "vitest";
import { getProductMetaTitle, getProductMetaDescription } from "./seo.js";

describe("getProductMetaTitle", () => {
  it("returns product name and category label", () => {
    expect(getProductMetaTitle({ name: "Na'lain Cap", category: "Caps" })).toBe("Na'lain Cap | Kufi & Islamic cap");
  });

  it("returns null when product has no name", () => {
    expect(getProductMetaTitle({})).toBeNull();
    expect(getProductMetaTitle({ name: "" })).toBeNull();
  });

  it("uses Islamic headwear when category is missing", () => {
    expect(getProductMetaTitle({ name: "Test" })).toBe("Test | Islamic headwear");
  });
});

describe("getProductMetaDescription", () => {
  it("returns description ≤160 chars with tail", () => {
    const product = {
      name: "Royal Fez",
      category: "Taj",
      description: "A short line.",
    };
    const result = getProductMetaDescription(product);
    expect(result.length).toBeLessThanOrEqual(160);
    expect(result).toMatch(/Al-Ameen Caps\. Cape Town, South Africa/);
  });

  it("returns empty string when product has no name", () => {
    expect(getProductMetaDescription({})).toBe("");
  });

  it("uses product name and label when description is short", () => {
    const product = { name: "Test Cap", category: "Caps", description: "Hi" };
    const result = getProductMetaDescription(product);
    expect(result).toMatch(/Test Cap/);
    expect(result).toMatch(/Handcrafted/);
    expect(result.length).toBeLessThanOrEqual(160);
  });
});
