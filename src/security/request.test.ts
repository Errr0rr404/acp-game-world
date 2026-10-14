import { expect, test } from "vitest";
import { sameOrigin } from "./request";

test("mutations require the same scheme, host and port", () => {
  const request = (origin?: string, site?: string) => new Request("https://games.example/api/sessions", {
    method: "POST", headers: { ...(origin ? { origin } : {}), ...(site ? { "sec-fetch-site": site } : {}) },
  });
  expect(sameOrigin(request("https://games.example", "same-origin"))).toBe(true);
  expect(sameOrigin(request())).toBe(false);
  expect(sameOrigin(request("https://evil.example"))).toBe(false);
  expect(sameOrigin(request("http://games.example"))).toBe(false);
  expect(sameOrigin(request("https://games.example:8443"))).toBe(false);
  expect(sameOrigin(request("invalid"))).toBe(false);
  expect(sameOrigin(request("https://games.example", "cross-site"))).toBe(false);
});

test("uses the incoming host when Next.js has an internal request URL", () => {
  const headers = { origin: "http://127.0.0.1:3000", host: "127.0.0.1:3000" };
  expect(sameOrigin(new Request("http://localhost:3000/api/sign-in", { method: "POST", headers }))).toBe(true);
  expect(sameOrigin(new Request("http://localhost:3000/api/sign-in", { method: "POST", headers: { ...headers, origin: "https://127.0.0.1:3000" } }))).toBe(false);
});
