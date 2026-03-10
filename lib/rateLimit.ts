interface RateLimitInfo {
  count: number;
  lastReset: number;
}

const cache = new Map<string, RateLimitInfo>();

const WINDOW_MS = 60000; // 1 minute
const MAX_REQUESTS = 100;

export function rateLimit(ip: string): boolean {
  const now = Date.now();
  const info = cache.get(ip);

  if (!info || now - info.lastReset > WINDOW_MS) {
    // New window or new IP
    cache.set(ip, {
      count: 1,
      lastReset: now,
    });
    return true;
  }

  if (info.count >= MAX_REQUESTS) {
    return false;
  }

  // Increment count
  info.count += 1;
  cache.set(ip, info);
  return true;
}
