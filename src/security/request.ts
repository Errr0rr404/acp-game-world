/** Mutating browser requests must come from this application's own origin. */
export function sameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin || request.headers.get("sec-fetch-site") === "cross-site") return false;
  try {
    const url = new URL(request.url);
    // Next.js may use an internal hostname in request.url. Host is the
    // authority the browser actually requested; retain the request's scheme.
    const expected = new URL(`${url.protocol}//${request.headers.get("host") ?? url.host}`);
    if (expected.username || expected.password) return false;
    return new URL(origin).origin === expected.origin;
  } catch {
    return false;
  }
}
