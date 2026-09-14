// Minimal in-memory sliding-window rate limiter.
//
// This is fine specifically because the Node adapter runs as one
// long-lived standalone process (not a serverless function that cold-starts
// per request), so this Map survives between requests. It resets on
// restart/redeploy — acceptable for a low-traffic contact form; move to
// Redis if this ever needs to survive across multiple instances.
const hits = new Map<string, number[]>();

export function isRateLimited(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const timestamps = (hits.get(key) ?? []).filter((t) => now - t < windowMs);

  if (timestamps.length >= limit) {
    hits.set(key, timestamps);
    return true;
  }

  timestamps.push(now);
  hits.set(key, timestamps);

  // Opportunistic cleanup so the map doesn't grow forever.
  if (hits.size > 5000) {
    for (const [k, v] of hits) {
      if (v.every((t) => now - t >= windowMs)) hits.delete(k);
    }
  }

  return false;
}
