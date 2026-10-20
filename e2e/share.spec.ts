import { expect, test } from "@playwright/test";

const publicSite = "https://games.agentcontrolpanel.dev";

test("Share Game World copies the public URL without local or account parameters", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "share", { value: undefined, configurable: true });
    Object.defineProperty(navigator, "clipboard", { value: { writeText: async (url: string) => { Object.assign(window, { copiedShareUrl: url }); } }, configurable: true });
  });
  await page.goto("/?private=do-not-share");
  await page.getByRole("button", { name: "Share Game World", exact: true }).click();
  await expect(page.getByText("Link copied. Send it to a friend.", { exact: true })).toBeVisible();
  expect(await page.evaluate(() => (window as Window & { copiedShareUrl?: string }).copiedShareUrl)).toBe(`${publicSite}/`);
});

test("native sharing receives a public link and readable invitation", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "share", { value: async (data: ShareData) => { Object.assign(window, { capturedShare: data }); }, configurable: true });
    Object.defineProperty(navigator, "canShare", { value: () => true, configurable: true });
  });
  await page.goto("/");
  await page.getByRole("button", { name: "Share Game World", exact: true }).click();
  await expect(page.getByText("Share menu opened.", { exact: true })).toBeVisible();
  expect(await page.evaluate(() => (window as Window & { capturedShare?: ShareData }).capturedShare)).toMatchObject({ title: "Game World", url: `${publicSite}/`, text: expect.stringContaining("Free browser games") });
});

test("canceling native sharing does not copy a link", async ({ page }) => {
  await page.addInitScript(() => {
    Object.assign(window, { copyCalls: 0 });
    Object.defineProperty(navigator, "share", { value: async () => { throw new DOMException("Canceled", "AbortError"); }, configurable: true });
    Object.defineProperty(navigator, "canShare", { value: () => true, configurable: true });
    Object.defineProperty(navigator, "clipboard", { value: { writeText: async () => { Object.assign(window, { copyCalls: 1 }); } }, configurable: true });
  });
  await page.goto("/");
  const button = page.getByRole("button", { name: "Share Game World", exact: true });
  await button.click();
  await expect(button).toBeEnabled();
  expect(await page.evaluate(() => (window as Window & { copyCalls?: number }).copyCalls)).toBe(0);
  await expect(page.getByRole("group", { name: "Copy share link" })).toHaveCount(0);
});

test("clipboard failure offers a selected link that fits on a phone", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 844 });
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "share", { value: undefined, configurable: true });
    Object.defineProperty(navigator, "clipboard", { value: { writeText: async () => { throw new Error("Denied"); } }, configurable: true });
  });
  await page.goto("/");
  const button = page.getByRole("button", { name: "Share Game World", exact: true });
  await button.click();
  const input = page.getByRole("textbox", { name: "Link to share" });
  await expect(input).toHaveValue(`${publicSite}/`);
  await expect(input).toBeFocused();
  expect(await input.evaluate((node: HTMLInputElement) => node.selectionStart === 0 && node.selectionEnd === node.value.length)).toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  await page.keyboard.press("Escape");
  await expect(input).toHaveCount(0);
  await expect(button).toBeFocused();
});

test("a playable game's details share its direct play URL", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "share", { value: undefined, configurable: true });
    Object.defineProperty(navigator, "clipboard", { value: { writeText: async (url: string) => { Object.assign(window, { copiedShareUrl: url }); } }, configurable: true });
  });
  await page.goto("/");
  await page.getByRole("button", { name: "About Velocity" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Share Velocity", exact: true }).click();
  await expect(page.getByText("Link copied. Send it to a friend.", { exact: true })).toBeVisible();
  expect(await page.evaluate(() => (window as Window & { copiedShareUrl?: string }).copiedShareUrl)).toBe(`${publicSite}/play/velocity`);
});

test("shared links advertise a working PNG preview and canonical public URL", async ({ page, request }) => {
  await page.goto("/");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /^https:\/\/games\.agentcontrolpanel\.dev\/?$/);
  await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute("content", "summary_large_image");
  const image = page.locator('meta[property="og:image"]').first();
  // Next.js intentionally serves file-based social images from localhost in dev.
  // The production deployment is checked separately for its absolute public URL.
  await expect(image).toHaveAttribute("content", /\/opengraph-image(?:\?|$)/);
  const url = new URL((await image.getAttribute("content"))!);
  const response = await request.get(`${url.pathname}${url.search}`);
  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toContain("image/png");
  expect((await response.body()).subarray(0, 8).toString("hex")).toBe("89504e470d0a1a0a");
});
