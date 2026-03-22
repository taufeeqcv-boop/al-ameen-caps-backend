/**
 * Tests for lib/validateCheckoutForm.js
 */
import { describe, it, expect } from "vitest";
import {
  validateCheckoutForm,
  validateSouthAfricanMobilePhone,
  SA_MOBILE_REGEX,
} from "./validateCheckoutForm.js";

const validAddress = {
  address_line_1: "123 Main Rd",
  city: "Cape Town",
  postal_code: "8001",
};

describe("SA_MOBILE_REGEX", () => {
  it("matches 10-digit SA mobile prefixes 06, 07, 08", () => {
    expect(SA_MOBILE_REGEX.test("0622996917")).toBe(true);
    expect(SA_MOBILE_REGEX.test("0821234567")).toBe(true);
    expect(SA_MOBILE_REGEX.test("0712345678")).toBe(true);
    expect(SA_MOBILE_REGEX.test("0912345678")).toBe(false);
    expect(SA_MOBILE_REGEX.test("082123456")).toBe(false);
  });
});

describe("validateSouthAfricanMobilePhone", () => {
  it("normalizes and validates spaced input", () => {
    const r = validateSouthAfricanMobilePhone("082 123 4567");
    expect(r.valid).toBe(true);
    expect(r.digits).toBe("0821234567");
  });

  it("rejects wrong prefix", () => {
    const r = validateSouthAfricanMobilePhone("0123456789");
    expect(r.valid).toBe(false);
  });
});

describe("validateCheckoutForm", () => {
  it("returns valid for complete form with address", () => {
    const result = validateCheckoutForm({
      name_first: "Ahmed",
      name_last: "Khan",
      email_address: "ahmed@example.com",
      cell_number: "0821234567",
      ...validAddress,
    });
    expect(result.valid).toBe(true);
    expect(result.message).toBe("");
  });

  it("fails when first name is missing", () => {
    const result = validateCheckoutForm({
      name_first: "",
      name_last: "Khan",
      email_address: "a@b.co",
      cell_number: "0821234567",
      ...validAddress,
    });
    expect(result.valid).toBe(false);
    expect(result.message).toMatch(/first name/i);
  });

  it("fails when last name is missing", () => {
    const result = validateCheckoutForm({
      name_first: "Ahmed",
      name_last: "",
      email_address: "a@b.co",
      cell_number: "0821234567",
      ...validAddress,
    });
    expect(result.valid).toBe(false);
    expect(result.message).toMatch(/last name/i);
  });

  it("fails when email is invalid", () => {
    const result = validateCheckoutForm({
      name_first: "A",
      name_last: "B",
      email_address: "not-an-email",
      cell_number: "0821234567",
      ...validAddress,
    });
    expect(result.valid).toBe(false);
    expect(result.message).toMatch(/valid email/i);
  });

  it("fails when phone is not valid SA mobile format", () => {
    const result = validateCheckoutForm({
      name_first: "A",
      name_last: "B",
      email_address: "a@b.co",
      cell_number: "123",
      ...validAddress,
    });
    expect(result.valid).toBe(false);
    expect(result.message).toMatch(/phone|mobile|digit|South African/i);
  });

  it("accepts phone with spaces/dashes (10 digits 06/07/08)", () => {
    const result = validateCheckoutForm({
      name_first: "A",
      name_last: "B",
      email_address: "a@b.co",
      cell_number: "082 123 4567",
      ...validAddress,
    });
    expect(result.valid).toBe(true);
  });

  it("when requireAddress is true, fails when address_line_1 is missing", () => {
    const result = validateCheckoutForm({
      name_first: "A",
      name_last: "B",
      email_address: "a@b.co",
      cell_number: "0821234567",
      city: "Cape Town",
      postal_code: "8001",
    });
    expect(result.valid).toBe(false);
    expect(result.message).toMatch(/address/i);
  });

  it("when requireAddress is false, passes without address fields", () => {
    const result = validateCheckoutForm(
      {
        name_first: "A",
        name_last: "B",
        email_address: "a@b.co",
        cell_number: "0821234567",
      },
      false
    );
    expect(result.valid).toBe(true);
  });
});
