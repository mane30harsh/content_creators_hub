/**
 * Simple in-memory rate limiter for server actions and API routes.
 * Each entry expires after `windowMs`. Uses a sliding window.
 *
 * IMPORTANT: In-memory state resets on server restart / scaling.
 * For production with multiple instances, replace with Redis or DB-backed store.
 */

interface Entry {
  count: number;
  resetAt: number;
}

const store = new Map<string, Entry>();

const CLEANUP_INTERVAL = 60_000; // 1 min

if (typeof globalThis !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store) {
      if (entry.resetAt <= now) store.delete(key);
    }
  }, CLEANUP_INTERVAL);
}

export interface RateLimitConfig {
  windowMs: number;
  max: number;
}

const DEFAULTS: RateLimitConfig = {
  windowMs: 60_000,
  max: 30,
};

export function checkRateLimit(
  key: string,
  config: Partial<RateLimitConfig> = {}
): { allowed: boolean; remaining: number; resetAt: number } {
  const { windowMs, max } = { ...DEFAULTS, ...config };
  const now = Date.now();

  let entry = store.get(key);

  if (!entry || entry.resetAt <= now) {
    entry = { count: 0, resetAt: now + windowMs };
    store.set(key, entry);
  }

  entry.count++;
  const remaining = Math.max(0, max - entry.count);

  return {
    allowed: entry.count <= max,
    remaining,
    resetAt: entry.resetAt,
  };
}

export function rateLimitHeaders(
  key: string,
  config?: Partial<RateLimitConfig>
): Record<string, string> {
  const result = checkRateLimit(key, config);
  return {
    "X-RateLimit-Limit": String(config?.max ?? DEFAULTS.max),
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(Math.ceil(result.resetAt / 1000)),
  };
}
