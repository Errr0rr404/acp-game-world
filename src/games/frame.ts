export type FrameAccess = "cross-origin" | "same-origin";
export type FrameVerdict = "playing" | "blocked" | "pending" | "slow";

/**
 * A game that accepted the frame is cross-origin, so the parent cannot read it.
 * A refusal stays same-origin (about:blank or the browser error page).
 * about:blank is pending: browsers fire that load before the real navigation.
 */
export function classifyFrameDocument(access: FrameAccess, href: string): FrameVerdict {
  if (access === "cross-origin") return "playing";
  if (href === "about:blank" || href === "") return "pending";
  return "blocked";
}

export type FrameHeaders = {
  xFrameOptions: string | null;
  contentSecurityPolicy: string | null;
};

/** Sources from a CSP frame-ancestors directive, or null when the directive is absent. */
export function frameAncestorSources(csp: string | null): string[] | null {
  if (!csp) return null;
  const directive = csp
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.split(/\s+/)[0]?.toLowerCase() === "frame-ancestors");
  if (!directive) return null;
  return directive.split(/\s+/).slice(1).map((source) => source.toLowerCase());
}

/**
 * Whether `ancestorOrigin` may frame a response with these headers.
 * X-Frame-Options DENY / SAMEORIGIN refuses everyone else.
 * frame-ancestors, when present, is the allowlist.
 */
export function allowsFrame(headers: FrameHeaders, ancestorOrigin: string): boolean {
  const xfo = headers.xFrameOptions?.split(",")[0]?.trim().toLowerCase() ?? "";
  if (xfo === "deny" || xfo === "sameorigin") return false;

  const sources = frameAncestorSources(headers.contentSecurityPolicy);
  if (sources === null) return true;
  if (sources.length === 0 || sources.includes("'none'")) return false;

  const ancestor = ancestorOrigin.toLowerCase();
  return sources.some((source) => source === "*" || source === ancestor);
}

export type FramePermission = "allowed" | "blocked" | "unreachable";

/** How long a framing verdict is reused. The key is the game origin plus the hub origin. */
export const FRAME_PERMISSION_TTL_MS = 60_000;

type FrameCacheEntry = { at: number; permission: FramePermission };

const frameCache = new Map<string, FrameCacheEntry>();
const frameInflight = new Map<string, Promise<FramePermission>>();

export function clearFramePermissionCache(): void {
  frameCache.clear();
  frameInflight.clear();
}

function frameCacheKey(src: string, ancestor: string): string {
  try {
    return `${new URL(src).origin}\n${ancestor.toLowerCase()}`;
  } catch {
    return `${src}\n${ancestor.toLowerCase()}`;
  }
}

export function ancestorOrigin(headerList: { get(name: string): string | null }): string {
  const host = (headerList.get("x-forwarded-host") ?? headerList.get("host") ?? "127.0.0.1:3000")
    .split(",")[0]
    .trim();
  const forwarded = headerList.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const proto =
    forwarded || (host.startsWith("localhost") || host.startsWith("127.0.0.1") ? "http" : "https");
  return `${proto}://${host}`;
}

async function fetchFramePermission(src: string, ancestor: string): Promise<FramePermission> {
  try {
    const response = await fetch(src, {
      redirect: "follow",
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
    await response.body?.cancel();
    if (!response.ok) return "unreachable";
    return allowsFrame(
      {
        xFrameOptions: response.headers.get("x-frame-options"),
        contentSecurityPolicy: response.headers.get("content-security-policy"),
      },
      ancestor,
    )
      ? "allowed"
      : "blocked";
  } catch {
    return "unreachable";
  }
}

/** Reads the game's own framing headers. The browser will not let the page do this itself. */
export async function readFramePermission(src: string, ancestor: string): Promise<FramePermission> {
  const key = frameCacheKey(src, ancestor);
  const cached = frameCache.get(key);
  // Monotonic timer. Date.now() is rejected while Next prerenders this route.
  if (cached && performance.now() - cached.at < FRAME_PERMISSION_TTL_MS) return cached.permission;
  const inflight = frameInflight.get(key);
  if (inflight) return inflight;
  const request = fetchFramePermission(src, ancestor).then((permission) => {
    frameCache.set(key, { at: performance.now(), permission });
    return permission;
  }).finally(() => {
    frameInflight.delete(key);
  });
  frameInflight.set(key, request);
  return request;
}
