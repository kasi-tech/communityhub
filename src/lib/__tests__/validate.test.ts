import { describe, expect, it } from "vitest";
import {
  validateEmail,
  validatePhone,
  validatePostalCode,
  sanitizeHtml,
  sanitizeInput,
  validateUUID,
  validateAmount,
} from "../validate";

// ---------------------------------------------------------------------------
// validateEmail
// ---------------------------------------------------------------------------
describe("validateEmail", () => {
  it("accepts valid emails", () => {
    expect(validateEmail("user@example.com")).toBe(true);
    expect(validateEmail("first.last@sub.domain.com")).toBe(true);
    expect(validateEmail("user+tag@example.co")).toBe(true);
  });

  it("rejects emails without @", () => {
    expect(validateEmail("userexample.com")).toBe(false);
  });

  it("rejects emails without domain", () => {
    expect(validateEmail("user@")).toBe(false);
    expect(validateEmail("user@.com")).toBe(false);
  });

  it("rejects empty / non-string", () => {
    expect(validateEmail("")).toBe(false);
    expect(validateEmail(null as unknown as string)).toBe(false);
    expect(validateEmail(undefined as unknown as string)).toBe(false);
  });

  it("rejects SQL injection attempts", () => {
    expect(validateEmail("' OR 1=1 --@evil.com")).toBe(false);
    expect(validateEmail("admin@evil.com'; DROP TABLE users;--")).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// validatePhone
// ---------------------------------------------------------------------------
describe("validatePhone", () => {
  it("accepts valid international formats", () => {
    expect(validatePhone("+65 8123 4567")).toBe(true);
    expect(validatePhone("+1 555 123 4567")).toBe(true);
    expect(validatePhone("+44 7911 123456")).toBe(true);
    expect(validatePhone("+919876543210")).toBe(true);
  });

  it("rejects missing + prefix", () => {
    expect(validatePhone("65 8123 4567")).toBe(false);
  });

  it("rejects too short numbers", () => {
    expect(validatePhone("+1 234")).toBe(false);
  });

  it("rejects letters in phone number", () => {
    expect(validatePhone("+1 555 ABC 1234")).toBe(false);
  });

  it("rejects empty / non-string", () => {
    expect(validatePhone("")).toBe(false);
    expect(validatePhone(null as unknown as string)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// validatePostalCode
// ---------------------------------------------------------------------------
describe("validatePostalCode", () => {
  it("validates Singapore postal codes", () => {
    expect(validatePostalCode("123456", "SG")).toBe(true);
    expect(validatePostalCode("12345", "SG")).toBe(false);
  });

  it("validates US zip codes", () => {
    expect(validatePostalCode("90210", "US")).toBe(true);
    expect(validatePostalCode("90210-1234", "US")).toBe(true);
    expect(validatePostalCode("9021", "US")).toBe(false);
  });

  it("validates UK postcodes", () => {
    expect(validatePostalCode("SW1A 1AA", "GB")).toBe(true);
    expect(validatePostalCode("EC1A1BB", "GB")).toBe(true);
  });

  it("uses generic validation for unknown countries", () => {
    expect(validatePostalCode("12345", undefined)).toBe(true);
    expect(validatePostalCode("", undefined)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// sanitizeHtml
// ---------------------------------------------------------------------------
describe("sanitizeHtml", () => {
  it("strips <script> tags", () => {
    expect(sanitizeHtml('<script>alert("xss")</script>Hello')).toBe(
      'alert("xss")Hello',
    );
  });

  it("strips <img onerror> tags", () => {
    expect(sanitizeHtml('<img src=x onerror="alert(1)">text')).toBe("text");
  });

  it("keeps plain text untouched", () => {
    expect(sanitizeHtml("Hello world")).toBe("Hello world");
  });

  it("strips nested / malformed tags", () => {
    expect(sanitizeHtml("<b><i>bold italic</i></b>")).toBe("bold italic");
  });

  it("handles empty / null input", () => {
    expect(sanitizeHtml("")).toBe("");
    expect(sanitizeHtml(null as unknown as string)).toBe("");
  });
});

// ---------------------------------------------------------------------------
// sanitizeInput
// ---------------------------------------------------------------------------
describe("sanitizeInput", () => {
  it("trims whitespace", () => {
    expect(sanitizeInput("  hello  ")).toBe("hello");
  });

  it("truncates to 1000 chars by default", () => {
    const long = "a".repeat(2000);
    expect(sanitizeInput(long).length).toBe(1000);
  });

  it("strips null bytes", () => {
    expect(sanitizeInput("he\0llo")).toBe("hello");
  });

  it("handles empty / null input", () => {
    expect(sanitizeInput("")).toBe("");
    expect(sanitizeInput(null as unknown as string)).toBe("");
  });

  it("respects custom maxLength", () => {
    expect(sanitizeInput("abcdefgh", 5)).toBe("abcde");
  });
});

// ---------------------------------------------------------------------------
// validateUUID
// ---------------------------------------------------------------------------
describe("validateUUID", () => {
  it("accepts valid UUID v4", () => {
    expect(validateUUID("550e8400-e29b-41d4-a716-446655440000")).toBe(true);
    expect(validateUUID("6ba7b810-9dad-41d0-80b4-00c04fd430c8")).toBe(true);
  });

  it("rejects non-v4 UUIDs", () => {
    // Version digit is not 4
    expect(validateUUID("550e8400-e29b-11d4-a716-446655440000")).toBe(false);
  });

  it("rejects garbage strings", () => {
    expect(validateUUID("not-a-uuid")).toBe(false);
    expect(validateUUID("")).toBe(false);
    expect(validateUUID("12345678-1234-1234-1234-123456789012")).toBe(false);
  });

  it("rejects null / undefined", () => {
    expect(validateUUID(null as unknown as string)).toBe(false);
    expect(validateUUID(undefined as unknown as string)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// validateAmount
// ---------------------------------------------------------------------------
describe("validateAmount", () => {
  it("accepts valid positive amounts", () => {
    expect(validateAmount(10)).toBe(true);
    expect(validateAmount(0.01)).toBe(true);
    expect(validateAmount(99999)).toBe(true);
    expect(validateAmount(49.99)).toBe(true);
  });

  it("rejects zero", () => {
    expect(validateAmount(0)).toBe(false);
  });

  it("rejects negative amounts", () => {
    expect(validateAmount(-1)).toBe(false);
    expect(validateAmount(-0.01)).toBe(false);
  });

  it("rejects amounts exceeding 99999", () => {
    expect(validateAmount(100000)).toBe(false);
  });

  it("rejects more than 2 decimal places", () => {
    expect(validateAmount(10.123)).toBe(false);
    expect(validateAmount(0.001)).toBe(false);
  });

  it("rejects NaN and Infinity", () => {
    expect(validateAmount(NaN)).toBe(false);
    expect(validateAmount(Infinity)).toBe(false);
    expect(validateAmount(-Infinity)).toBe(false);
  });

  it("rejects non-number types", () => {
    expect(validateAmount("10" as unknown as number)).toBe(false);
    expect(validateAmount(null as unknown as number)).toBe(false);
  });
});
