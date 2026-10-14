import { expect, test } from "@playwright/test";

const origin = "http://127.0.0.1:3000";

test("play history rejects unauthenticated and cross-origin writes", async ({ request }) => {
  const guest = await request.post("/api/sessions", { headers: { origin }, data: { slug: "velocity" } });
  expect(guest.status()).toBe(401);
  const foreign = await request.post("/api/sessions", { headers: { origin: "https://other.example" }, data: { slug: "velocity" } });
  expect(foreign.status()).toBe(403);
  const result = await request.post("/api/sessions/missing", { headers: { origin }, data: { summary: "A result" } });
  expect(result.status()).toBe(401);
  const foreignResult = await request.post("/api/sessions/missing", { headers: { origin: "https://other.example" }, data: { end: true } });
  expect(foreignResult.status()).toBe(403);
});

test("sign-in validates requests on the server", async ({ request }) => {
  const invalid = await request.post("/api/sign-in", { headers: { origin }, data: { email: "bad", over13: true } });
  expect(invalid.status()).toBe(400);
  expect(await invalid.json()).toMatchObject({ ok: false, message: "That email does not look right." });
  const foreign = await request.post("/api/sign-in", { headers: { origin: "https://other.example" }, data: { email: "ada@example.com", over13: true } });
  expect(foreign.status()).toBe(403);
});
