/**
 * Lightweight monitoring and logging utilities for CommunityHub.
 *
 * In development these write to console. In production, swap the transport
 * for PostHog (analytics), Sentry (errors), or OpenTelemetry (traces).
 */

// ---------------------------------------------------------------------------
// Event Logging
// ---------------------------------------------------------------------------

/**
 * Log a named application event with optional structured data.
 * Development: writes to `console.log`.
 * Production: forward to PostHog / analytics provider.
 */
export function logEvent(
  event: string,
  data?: Record<string, unknown>,
): void {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[CommunityHub] ${event}`, data ?? '');
  }

  // Production hook — uncomment when analytics is configured:
  // if (typeof window !== 'undefined' && window.posthog) {
  //   window.posthog.capture(event, data);
  // }
}

// ---------------------------------------------------------------------------
// Error Logging
// ---------------------------------------------------------------------------

/**
 * Log an error with optional context metadata.
 * Always writes to `console.error` regardless of environment.
 * Production: forward to Sentry / error tracking provider.
 */
export function logError(
  error: Error,
  context?: Record<string, unknown>,
): void {
  console.error(`[CommunityHub Error] ${error.message}`, {
    stack: error.stack,
    ...context,
  });

  // Production hook — uncomment when Sentry is configured:
  // Sentry.captureException(error, { extra: context });
}

// ---------------------------------------------------------------------------
// API Call Tracking
// ---------------------------------------------------------------------------

/**
 * Track an API call with route, method, status code, and duration.
 * Useful for building latency dashboards and alerting on error-rate spikes.
 */
export function trackApiCall(
  route: string,
  method: string,
  statusCode: number,
  durationMs: number,
): void {
  logEvent('api_call', { route, method, statusCode, durationMs });
}

// ---------------------------------------------------------------------------
// Performance Marks (browser only)
// ---------------------------------------------------------------------------

/**
 * Mark a performance milestone. Wraps the Performance API for easy
 * measurement of critical user flows (e.g., time-to-interactive).
 */
export function markPerformance(label: string): void {
  if (typeof performance !== 'undefined') {
    performance.mark(`communityhub:${label}`);
  }
}

/**
 * Measure the duration between two performance marks.
 * Returns the duration in milliseconds, or `null` if marks are missing.
 */
export function measurePerformance(
  startLabel: string,
  endLabel: string,
): number | null {
  if (typeof performance === 'undefined') return null;

  try {
    const entry = performance.measure(
      `communityhub:${startLabel}-to-${endLabel}`,
      `communityhub:${startLabel}`,
      `communityhub:${endLabel}`,
    );
    return entry.duration;
  } catch {
    return null;
  }
}
