import { describe, expect, it, beforeEach } from "vitest";
import { rateLimit, rateLimitClear, RATE_LIMITS } from "../rate-limit";

beforeEach(() => {
  rateLimitClear();
});

describe("rateLimit", () => {
  const config = { windowMs: 60_000, max: 3 };

  it("allows requests within the limit", () => {
    const r1 = rateLimit("user:1", config);
    expect(r1.success).toBe(true);
    expect(r1.remaining).toBe(2);

    const r2 = rateLimit("user:1", config);
    expect(r2.success).toBe(true);
    expect(r2.remaining).toBe(1);

    const r3 = rateLimit("user:1", config);
    expect(r3.success).toBe(true);
    expect(r3.remaining).toBe(0);
  });

  it("blocks requests over the limit", () => {
    rateLimit("user:2", config);
    rateLimit("user:2", config);
    rateLimit("user:2", config);

    const r4 = rateLimit("user:2", config);
    expect(r4.success).toBe(false);
    expect(r4.remaining).toBe(0);
  });

  it("resets after the window expires", () => {
    // Use a very short window
    const shortConfig = { windowMs: 1, max: 1 };

    const r1 = rateLimit("user:3", shortConfig);
    expect(r1.success).toBe(true);

    // The 1ms window should have expired by now (or almost immediately)
    // Force a small delay via busy-wait to ensure expiry
    const start = Date.now();
    while (Date.now() - start < 5) {
      /* wait 5ms */
    }

    const r2 = rateLimit("user:3", shortConfig);
    expect(r2.success).toBe(true);
  });

  it("different keys do not interfere with each other", () => {
    const tightConfig = { windowMs: 60_000, max: 1 };

    const r1 = rateLimit("key-a", tightConfig);
    expect(r1.success).toBe(true);

    // key-a is now exhausted
    const r2 = rateLimit("key-a", tightConfig);
    expect(r2.success).toBe(false);

    // key-b should still have its own quota
    const r3 = rateLimit("key-b", tightConfig);
    expect(r3.success).toBe(true);
  });

  it("returns correct resetAt timestamp", () => {
    const before = Date.now();
    const result = rateLimit("user:ts", config);
    const after = Date.now();

    expect(result.resetAt).toBeGreaterThanOrEqual(before + config.windowMs);
    expect(result.resetAt).toBeLessThanOrEqual(after + config.windowMs);
  });
});

describe("RATE_LIMITS presets", () => {
  it("has expected keys with valid configs", () => {
    for (const [key, cfg] of Object.entries(RATE_LIMITS)) {
      expect(cfg.windowMs).toBeGreaterThan(0);
      expect(cfg.max).toBeGreaterThan(0);
      expect(typeof key).toBe("string");
    }
  });
});
