// Fixed-window limiter per key. In-memory, so limits apply per server instance;
// it caps bursts and LLM spend, not a global quota.
const windows = new Map<string, { start: number; count: number }>();

export function allowRequest(key: string, limit: number, windowMs: number, now = Date.now()): boolean {
  const entry = windows.get(key);
  if (!entry || now - entry.start >= windowMs) {
    windows.set(key, { start: now, count: 1 });
    if (windows.size > 10_000) {
      for (const [k, v] of windows) if (now - v.start >= windowMs) windows.delete(k);
    }
    return true;
  }
  entry.count++;
  return entry.count <= limit;
}
