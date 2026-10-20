import { afterEach, expect, test } from "vitest";
import { clearSignInLimits, signInClientAddress, signInRateMessage } from "./sign-in-limit";

afterEach(() => clearSignInLimits());

test("one email can request five sign-in links, then has to wait", () => {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    expect(signInRateMessage("ada@example.com", "203.0.113.5", 0)).toBeNull();
  }
  expect(signInRateMessage("ada@example.com", "203.0.113.9", 0)).toMatch(/Too many sign-in links/);
  expect(signInRateMessage("bea@example.com", "203.0.113.5", 0)).toBeNull();
  expect(signInRateMessage("ada@example.com", "203.0.113.9", 15 * 60 * 1000)).toBeNull();
});

test("one address cannot spray links across many inboxes", () => {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    expect(signInRateMessage(`player${attempt}@example.com`, "203.0.113.5", 0)).toBeNull();
  }
  expect(signInRateMessage("someone@example.com", "203.0.113.5", 0)).toMatch(/Too many sign-in links/);
  expect(signInRateMessage("someone@example.com", "203.0.113.8", 0)).toBeNull();
});

test("the client address is the first forwarded hop", () => {
  const request = new Request("https://game.agentcontrolpanel.dev/api/sign-in", {
    headers: { "x-forwarded-for": " 203.0.113.5, 10.0.0.8 " },
  });
  expect(signInClientAddress(request)).toBe("203.0.113.5");
  expect(signInClientAddress(new Request("https://game.agentcontrolpanel.dev/api/sign-in"))).toBe("unknown");
});
