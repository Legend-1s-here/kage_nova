interface RateLimitRecord {
  attempts: number[];
}

// In-memory map for rate limiting: key is `${ip}:${slug}`
const rateLimitMap = new Map<string, RateLimitRecord>();

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 10 * 60 * 1000; // 10 minutes

/**
 * Cleanup expired timestamps from the memory map to prevent memory leaks.
 */
function cleanupExpired() {
  const now = Date.now();
  rateLimitMap.forEach((record, key) => {
    record.attempts = record.attempts.filter((ts: number) => now - ts < WINDOW_MS);
    if (record.attempts.length === 0) {
      rateLimitMap.delete(key);
    }
  });
}

// Periodically run cleanup every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(cleanupExpired, 5 * 60 * 1000).unref?.();
}

export interface RateLimitResult {
  isLimited: boolean;
  remainingAttempts: number;
  resetInSeconds: number;
}

/**
 * Check if the given identifier (IP + slug) is currently rate limited.
 */
export function checkRateLimit(ip: string, slug: string): RateLimitResult {
  const now = Date.now();
  const key = `${ip}:${slug.toLowerCase()}`;
  const record = rateLimitMap.get(key);

  if (!record) {
    return {
      isLimited: false,
      remainingAttempts: MAX_ATTEMPTS,
      resetInSeconds: Math.ceil(WINDOW_MS / 1000),
    };
  }

  // Filter out attempts outside the active window
  record.attempts = record.attempts.filter((ts) => now - ts < WINDOW_MS);

  if (record.attempts.length >= MAX_ATTEMPTS) {
    const oldest = record.attempts[0];
    const resetInSeconds = Math.max(
      1,
      Math.ceil((oldest + WINDOW_MS - now) / 1000)
    );
    return {
      isLimited: true,
      remainingAttempts: 0,
      resetInSeconds,
    };
  }

  return {
    isLimited: false,
    remainingAttempts: MAX_ATTEMPTS - record.attempts.length,
    resetInSeconds: Math.ceil(WINDOW_MS / 1000),
  };
}

/**
 * Record a failed attempt for the identifier.
 */
export function recordFailedAttempt(ip: string, slug: string): RateLimitResult {
  const now = Date.now();
  const key = `${ip}:${slug.toLowerCase()}`;
  let record = rateLimitMap.get(key);

  if (!record) {
    record = { attempts: [] };
    rateLimitMap.set(key, record);
  }

  record.attempts.push(now);
  return checkRateLimit(ip, slug);
}

/**
 * Clear/reset rate limit on successful verification.
 */
export function resetRateLimit(ip: string, slug: string): void {
  const key = `${ip}:${slug.toLowerCase()}`;
  rateLimitMap.delete(key);
}
