// ---------------------------------------------------------------------------
// Input validation & sanitization helpers
// Zero runtime dependencies — keep this module lightweight.
// ---------------------------------------------------------------------------

/**
 * Validate an email address (RFC 5322 simplified).
 */
export function validateEmail(email: string): boolean {
  if (!email || typeof email !== "string") return false;
  // Intentionally strict — no quoted local parts, no IP-literal domains.
  const re = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  return re.test(email) && email.length <= 254;
}

/**
 * Validate a phone number in international format: +XX XXXX XXXX (spaces optional).
 * Accepts 7–15 digits after the leading `+`.
 */
export function validatePhone(phone: string): boolean {
  if (!phone || typeof phone !== "string") return false;
  // Strip spaces for digit counting
  const digits = phone.replace(/\s/g, "");
  // Must start with +, followed by 7-15 digits, optionally separated by spaces
  const re = /^\+\d[\d\s]{6,18}$/;
  if (!re.test(phone)) return false;
  const digitCount = digits.length - 1; // exclude leading +
  return digitCount >= 7 && digitCount <= 15;
}

/**
 * Validate a postal code.
 * When `country` is provided, applies country-specific rules.
 * Falls back to a generic alphanumeric check.
 */
export function validatePostalCode(
  code: string,
  country?: string,
): boolean {
  if (!code || typeof code !== "string") return false;
  const trimmed = code.trim();

  switch (country?.toUpperCase()) {
    case "SG":
      return /^\d{6}$/.test(trimmed);
    case "US":
      return /^\d{5}(-\d{4})?$/.test(trimmed);
    case "UK":
    case "GB":
      return /^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/i.test(trimmed);
    case "IN":
      return /^\d{6}$/.test(trimmed);
    case "CA":
      return /^[A-Z]\d[A-Z]\s?\d[A-Z]\d$/i.test(trimmed);
    default:
      // Generic: 3-10 alphanumeric chars, optional space/hyphen
      return /^[a-zA-Z0-9\s-]{3,10}$/.test(trimmed);
  }
}

/**
 * Strip ALL HTML tags from input. Returns plain text only.
 */
export function sanitizeHtml(input: string): string {
  if (!input || typeof input !== "string") return "";
  // Remove all HTML tags (including self-closing and malformed)
  return input
    .replace(/<[^>]*>/g, "")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

/**
 * General-purpose input sanitizer:
 * - Trim whitespace
 * - Strip null bytes
 * - Truncate to `maxLength` (default 1000)
 */
export function sanitizeInput(input: string, maxLength = 1000): string {
  if (!input || typeof input !== "string") return "";
  return (
    input
      // eslint-disable-next-line no-control-regex
      .replace(/\0/g, "")
      .trim()
      .slice(0, maxLength)
  );
}

/**
 * Validate a UUID v4 string.
 */
export function validateUUID(id: string): boolean {
  if (!id || typeof id !== "string") return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    id,
  );
}

/**
 * Validate a monetary amount:
 * - Must be a finite positive number
 * - Max 2 decimal places
 * - Max value 99999
 */
export function validateAmount(amount: number): boolean {
  if (typeof amount !== "number" || !Number.isFinite(amount)) return false;
  if (amount <= 0 || amount > 99999) return false;
  // Check at most 2 decimal places
  const str = amount.toString();
  const decimalIndex = str.indexOf(".");
  if (decimalIndex !== -1 && str.length - decimalIndex - 1 > 2) return false;
  return true;
}
