// ---------------------------------------------------------------------------
// In-memory token bucket rate limiter
// Suitable for single-tenant / single-process deployments (no Redis needed).
// ---------------------------------------------------------------------------

export interface RateLimitConfig {
  /** Time window in milliseconds */
  windowMs: number;
  /** Maximum requests allowed within the window */
  max: number;
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number;
}

const store = new Map<string, { count: number; resetAt: number }>();

/**
 * Check and consume a rate-limit token for `key`.
 *
 * @param key   Unique identifier (e.g. `auth:${ip}` or `ai:${userId}`)
 * @param config  Window and max settings
 * @returns Whether the request is allowed plus remaining quota info
 */
export function rateLimit(
  key: string,
  config: RateLimitConfig,
): RateLimitResult {
  const now = Date.now();
  const record = store.get(key);

  // First request or window expired — reset
  if (!record || now > record.resetAt) {
    store.set(key, { count: 1, resetAt: now + config.windowMs });
    return {
      success: true,
      remaining: config.max - 1,
      resetAt: now + config.windowMs,
    };
  }

  // Over limit
  if (record.count >= config.max) {
    return { success: false, remaining: 0, resetAt: record.resetAt };
  }

  // Within limit — consume token
  record.count++;
  return {
    success: true,
    remaining: config.max - record.count,
    resetAt: record.resetAt,
  };
}

/**
 * Expose the internal store size (useful for tests / monitoring).
 */
export function rateLimitStoreSize(): number {
  return store.size;
}

/**
 * Clear all entries (useful for tests).
 */
export function rateLimitClear(): void {
  store.clear();
}

// ---------------------------------------------------------------------------
// Periodic cleanup of expired entries (every 60 s).
// Guard: only run in long-lived processes (not during tests / build).
// ---------------------------------------------------------------------------
if (typeof globalThis !== "undefined" && typeof setInterval === "function") {
  const cleanup = setInterval(() => {
    const now = Date.now();
    for (const [key, val] of store) {
      if (now > val.resetAt) store.delete(key);
    }
  }, 60_000);

  // Allow Node to exit without waiting for the timer
  if (typeof cleanup === "object" && "unref" in cleanup) {
    cleanup.unref();
  }
}

// ---------------------------------------------------------------------------
// Preconfigured rate-limit profiles
// ---------------------------------------------------------------------------
export const RATE_LIMITS = {
  /** Login / signup / password reset — 10 req per 15 min */
  auth: { windowMs: 15 * 60 * 1000, max: 10 } satisfies RateLimitConfig,

  /** Onboarding wizard submit — 3 req per hour */
  onboarding: { windowMs: 60 * 60 * 1000, max: 3 } satisfies RateLimitConfig,

  /** AI chat completions — 100 req per hour */
  aiChat: { windowMs: 60 * 60 * 1000, max: 100 } satisfies RateLimitConfig,

  /** Payment initiation — 10 req per 15 min */
  payment: { windowMs: 15 * 60 * 1000, max: 10 } satisfies RateLimitConfig,

  /** General API — 100 req per minute */
  general: { windowMs: 60 * 1000, max: 100 } satisfies RateLimitConfig,
} as const;
