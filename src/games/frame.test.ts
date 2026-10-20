import { afterEach, expect, test, vi } from "vitest";
import { allowsFrame, ancestorOrigin, classifyFrameDocument, clearFramePermissionCache, FRAME_PERMISSION_TTL_MS, frameAncestorSources, readFramePermission } from "./frame";

afterEach(() => {
  clearFramePermissionCache();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

test("a cross-origin document means the game accepted the frame", () => {
  expect(classifyFrameDocument("cross-origin", "")).toBe("playing");
});

test("about:blank is not a refusal yet", () => {
  expect(classifyFrameDocument("same-origin", "about:blank")).toBe("pending");
  expect(classifyFrameDocument("same-origin", "")).toBe("pending");
});

test("any other same-origin document is a refusal", () => {
  expect(classifyFrameDocument("same-origin", "chrome-error://chromewebdata/")).toBe("blocked");
});

test("a deny policy refuses every ancestor", () => {
  const headers = {
    xFrameOptions: "DENY",
    contentSecurityPolicy: "default-src 'self'; frame-ancestors 'none'",
  };
  expect(allowsFrame(headers, "http://127.0.0.1:3000")).toBe(false);
  expect(allowsFrame(headers, "https://game.agentcontrolpanel.dev")).toBe(false);
});

test("only the actual frame-ancestors directive controls framing", () => {
  expect(frameAncestorSources("frame-ancestors-report https://other.example; default-src 'self'")).toBeNull();
  expect(frameAncestorSources("default-src 'self'; FRAME-ANCESTORS https://games.example")).toEqual(["https://games.example"]);
});

test("a failed game response is unavailable even without framing headers", async () => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("Service unavailable", { status: 503 })));
  expect(await readFramePermission("https://racing.worldofz.info", "https://games.example")).toBe("unreachable");
});

test("a network failure does not pretend that a game refused framing", async () => {
  vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
  expect(await readFramePermission("https://racing.worldofz.info", "https://games.example")).toBe("unreachable");
});

test("framing headers are fetched once per origin until the minute is up", async () => {
  let now = 1_000_000;
  vi.spyOn(performance, "now").mockImplementation(() => now);
  const fetchMock = vi.fn().mockResolvedValue(new Response("ok", {
    headers: { "content-security-policy": "frame-ancestors https://games.example" },
  }));
  vi.stubGlobal("fetch", fetchMock);
  const src = "https://racing.worldofz.info/play";
  expect(await readFramePermission(src, "https://games.example")).toBe("allowed");
  expect(await readFramePermission("https://racing.worldofz.info", "https://games.example")).toBe("allowed");
  expect(fetchMock).toHaveBeenCalledTimes(1);
  now += FRAME_PERMISSION_TTL_MS;
  expect(await readFramePermission(src, "https://games.example")).toBe("allowed");
  expect(fetchMock).toHaveBeenCalledTimes(2);
});

test("an allowlist names the hub and nobody else", () => {
  const headers = {
    xFrameOptions: null,
    contentSecurityPolicy: "frame-ancestors https://game.agentcontrolpanel.dev",
  };
  expect(allowsFrame(headers, "https://game.agentcontrolpanel.dev")).toBe(true);
  expect(allowsFrame(headers, "https://evil.example")).toBe(false);
  expect(allowsFrame({ xFrameOptions: "SAMEORIGIN", contentSecurityPolicy: null }, "https://game.agentcontrolpanel.dev")).toBe(false);
  expect(allowsFrame({ xFrameOptions: null, contentSecurityPolicy: null }, "https://game.agentcontrolpanel.dev")).toBe(true);
});

test("ancestor origin comes from the request host", () => {
  expect(ancestorOrigin({ get: (name) => (name === "host" ? "127.0.0.1:3000" : null) })).toBe(
    "http://127.0.0.1:3000",
  );
  expect(
    ancestorOrigin({
      get: (name) =>
        name === "x-forwarded-host" ? "game.agentcontrolpanel.dev" : name === "x-forwarded-proto" ? "https" : null,
    }),
  ).toBe("https://game.agentcontrolpanel.dev");
});
