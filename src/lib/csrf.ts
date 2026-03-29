// ---------------------------------------------------------------------------
// CSRF protection for server-side mutations (POST / PATCH / DELETE).
//
// Strategy:
//   1. generateCsrfToken() creates a random token, stores it in an httpOnly
//      cookie, and returns it so the client can include it as a header or
//      hidden form field.
//   2. validateCsrfToken() compares the submitted token against the cookie
//      using timing-safe comparison.
//
// Usage in API route handlers:
//   const token = request.headers.get("x-csrf-token");
//   if (!token || !(await validateCsrfToken(token))) {
//     return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 });
//   }
// ---------------------------------------------------------------------------

import { cookies } from "next/headers";
import crypto from "crypto";

const COOKIE_NAME = "__csrf";
const TOKEN_BYTES = 32;

/**
 * Generate a new CSRF token. Stores it in an httpOnly, Secure, SameSite=Strict
 * cookie and returns the raw token so the caller can pass it to the client.
 */
export async function generateCsrfToken(): Promise<string> {
  const token = crypto.randomBytes(TOKEN_BYTES).toString("hex");

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60, // 1 hour
  });

  return token;
}

/**
 * Validate a CSRF token submitted by the client against the cookie value.
 * Uses `crypto.timingSafeEqual` to prevent timing attacks.
 */
export async function validateCsrfToken(token: string): Promise<boolean> {
  if (!token || typeof token !== "string") return false;

  const cookieStore = await cookies();
  const stored = cookieStore.get(COOKIE_NAME)?.value;
  if (!stored) return false;

  // Both must be the same length for timingSafeEqual
  if (token.length !== stored.length) return false;

  try {
    return crypto.timingSafeEqual(
      Buffer.from(token, "utf-8"),
      Buffer.from(stored, "utf-8"),
    );
  } catch {
    return false;
  }
}
