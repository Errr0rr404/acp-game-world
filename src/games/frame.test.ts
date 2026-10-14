import { expect, test } from "vitest";
import { allowsFrame, ancestorOrigin, classifyFrameDocument } from "./frame";

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

test("Velocity's current headers refuse every ancestor", () => {
  const headers = {
    xFrameOptions: "DENY",
    contentSecurityPolicy: "default-src 'self'; frame-ancestors 'none'",
  };
  expect(allowsFrame(headers, "http://127.0.0.1:3000")).toBe(false);
  expect(allowsFrame(headers, "https://game.agentcontrolpanel.dev")).toBe(false);
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
