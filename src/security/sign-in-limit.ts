const WINDOW_MS = 15 * 60 * 1000;
const EMAIL_LIMIT = 5;
const IP_LIMIT = 30;

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

export function clearSignInLimits(): void {
  buckets.clear();
}

function sweep(now: number): void {
  if (buckets.size < 2000) return;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

function take(key: string, max: number, now: number): boolean {
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  if (bucket.count >= max) return false;
  bucket.count += 1;
  return true;
}

export function signInClientAddress(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  if (forwarded) return forwarded.slice(0, 80);
  return "unknown";
}

/** Stops one address from flooding an inbox. Counts are per server process. */
export function signInRateMessage(email: string, ip: string, now = Date.now()): string | null {
  sweep(now);
  const emailOk = take(`email:${email}`, EMAIL_LIMIT, now);
  const ipOk = take(`ip:${ip}`, IP_LIMIT, now);
  if (emailOk && ipOk) return null;
  return "Too many sign-in links were requested. Try again in a few minutes.";
}
