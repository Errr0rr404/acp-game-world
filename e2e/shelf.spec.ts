import { expect, test } from "@playwright/test";

const gameOrigin = "https://racing.worldofz.info";
async function gameFixture(page: import("@playwright/test").Page) {
  await page.route(`${gameOrigin}/**`, (route) => route.fulfill({
    contentType: "text/html",
    body: '<!doctype html><html><body style="margin:0;background:#17203b;color:white;font:24px sans-serif"><h1>Test race</h1><script>parent.postMessage({type:"game.ready",v:1},"*")</script></body></html>',
  }));
}

test("discovery launches the real game address and keeps upcoming games unavailable", async ({ page }) => {
  test.setTimeout(60_000);
  await gameFixture(page);
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "A good day to play." })).toBeVisible();
  const velocity = page.getByRole("article", { name: "Velocity" });
  const vanguard = page.getByRole("article", { name: "Vanguard" });
  await expect(velocity.getByRole("link", { name: "Play Velocity" })).toBeVisible();
  await expect(vanguard.getByRole("link", { name: /Play/ })).toHaveCount(0);
  await expect(vanguard.getByText("Coming soon")).toBeVisible();
  await velocity.getByRole("link", { name: "Play Velocity" }).click();
  await expect(page).toHaveURL("/play/velocity");
  await expect(page.locator("[data-frame-state]")).toBeVisible({ timeout: 20_000 });
  // Server-side framing permission is determined by the game's actual response headers.
  // The browser game itself is a fixture, so gameplay never depends on third-party scripts.
  if (await page.locator("iframe").count()) {
    await expect(page.locator("iframe")).toHaveAttribute("src", `${gameOrigin}/?hub=1`);
    await expect(page.locator("[data-frame-state='playing']")).toBeVisible();
    await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem("game-world-library-v1") ?? "{}").recent?.[0]?.slug)).toBe("velocity");
    await page.evaluate((origin) => window.dispatchEvent(new MessageEvent("message", {
      data: { type: "game.exit", v: 1 }, origin, source: window,
    })), gameOrigin);
    await expect(page).toHaveURL("/play/velocity");
  } else {
    await expect(page.getByRole("heading", { name: "Velocity cannot open here right now." })).toBeVisible();
  }
  await expect(page.getByRole("link", { name: "Open on its own site" }).last()).toHaveAttribute("href", `${gameOrigin}/`);
  await page.getByRole("button", { name: "Game controls", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Ready, player?" })).toBeVisible();
  await page.getByRole("button", { name: "Close controls" }).click();
  await page.getByRole("button", { name: "Enter fullscreen" }).click();
  await expect(page.getByRole("button", { name: "Exit fullscreen" })).toBeVisible();
  await page.getByRole("button", { name: "Exit fullscreen" }).click();
  await page.getByRole("link", { name: "Leave game" }).click();
  await expect(page).toHaveURL("/", { timeout: 15_000 });
});

test("recent games appear in the library and offer a quick return", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("game-world-library-v1", JSON.stringify({ saved: [], recent: [{ slug: "velocity", lastPlayed: Date.now() }] })));
  await page.goto("/library");
  await page.getByRole("button", { name: "Recently played 1" }).click();
  await expect(page.getByRole("article", { name: "Velocity" })).toBeVisible();
  await page.getByRole("navigation", { name: "Main navigation" }).getByRole("link", { name: "Discover" }).click();
  await expect(page.getByRole("link", { name: "Play again", exact: true })).toHaveAttribute("href", "/play/velocity");
});

test("a game that is not playable returns to discovery", async ({ page }) => {
  await page.goto("/play/vanguard");
  await expect(page).toHaveURL("/");
  await page.goto("/play/not-a-game");
  await expect(page).toHaveURL("/");
});

test("search, genre, availability and clear filters work together", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("searchbox", { name: "Search games" }).fill("BLUE touch");
  await expect(page.getByRole("article", { name: "Velocity" })).toBeVisible();
  await expect(page.getByRole("article", { name: "Vanguard" })).toHaveCount(0);
  await page.getByLabel("Genre", { exact: true }).selectOption("Action");
  await expect(page.getByRole("heading", { name: "No games match just yet." })).toBeVisible();
  await page.getByRole("button", { name: "Clear filters" }).click();
  await expect(page.getByRole("article")).toHaveCount(2);
  await page.getByRole("button", { name: "Coming soon 1", exact: true }).click();
  await expect(page.getByRole("article", { name: "Vanguard" })).toBeVisible();
  await expect(page.getByRole("article", { name: "Velocity" })).toHaveCount(0);
});

test("saving works without an account, persists and can be undone", async ({ page }) => {
  await page.goto("/library");
  await expect(page.getByRole("heading", { name: "Keep your favorites close." })).toBeVisible();
  await page.getByRole("navigation", { name: "Main navigation" }).getByRole("link", { name: "Discover" }).click();
  const vanguard = page.getByRole("article", { name: "Vanguard" });
  await vanguard.getByRole("button", { name: "Save Vanguard", exact: true }).click();
  await expect(vanguard.getByRole("button", { name: "Unsave Vanguard" })).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("navigation", { name: "Main navigation" }).getByRole("link", { name: "Your library" }).click();
  await expect(page).toHaveURL("/library");
  await expect(page.getByRole("heading", { name: "Your library", exact: true })).toBeVisible();
  await expect(page.getByRole("article", { name: "Vanguard" })).toBeVisible();
  await page.reload();
  await expect(page.getByRole("article", { name: "Vanguard" })).toBeVisible();
  await page.getByRole("button", { name: "Unsave Vanguard" }).click();
  await expect(page.getByRole("heading", { name: "Keep your favorites close." })).toBeVisible();
});

test("game details support keyboard dismissal and do not launch an upcoming game", async ({ page }) => {
  await page.goto("/");
  const trigger = page.getByRole("button", { name: "About Vanguard" });
  await trigger.click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByRole("heading", { name: "Vanguard" })).toBeVisible();
  await expect(dialog.getByText("This game is not a browser game yet.")).toBeVisible();
  await expect(dialog.getByRole("link", { name: /Play/ })).toHaveCount(0);
  await expect(dialog.getByRole("button", { name: "Close game details" })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await trigger.click();
  await page.getByRole("button", { name: "Close game details" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(trigger).toBeFocused();
});

test("saved library syncs between tabs and tolerates corrupt storage", async ({ page, context }) => {
  await page.addInitScript(() => localStorage.setItem("game-world-library-v1", "{broken"));
  await page.goto("/");
  await expect(page.getByRole("article")).toHaveCount(2);
  const other = await context.newPage();
  await other.goto("/library");
  await expect(other.getByRole("heading", { name: "Keep your favorites close." })).toBeVisible();
  await page.getByRole("article", { name: "Vanguard" }).getByRole("button", { name: "Save Vanguard", exact: true }).click();
  await expect(other.getByRole("article", { name: "Vanguard" })).toBeVisible();
  await other.close();
});

test("library remains usable when browser storage is unavailable", async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.getItem = () => { throw new Error("Storage disabled"); };
    Storage.prototype.setItem = () => { throw new Error("Storage disabled"); };
  });
  await page.goto("/");
  await page.getByRole("article", { name: "Vanguard" }).getByRole("button", { name: "Save Vanguard", exact: true }).click();
  await page.getByRole("navigation", { name: "Main navigation" }).getByRole("link", { name: "Your library" }).click();
  await expect(page.getByRole("article", { name: "Vanguard" })).toBeVisible();
});

test("phone and tablet layouts stay on screen, including the game toolbar", async ({ page }) => {
  test.setTimeout(60_000);
  for (const width of [320, 390, 768]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/");
    await expect(page.getByRole("article", { name: "Velocity" })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  }
  await page.setViewportSize({ width: 320, height: 844 });
  await gameFixture(page);
  await page.getByRole("article", { name: "Velocity" }).getByRole("link", { name: "Play Velocity" }).click();
  await expect(page.getByRole("link", { name: "Leave game" })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
});

test("missing pages give a way back to the games", async ({ page }) => {
  await page.goto("/missing-page");
  await expect(page.getByRole("heading", { name: "This world hasn’t been discovered." })).toBeVisible();
  await page.getByRole("link", { name: "Back to games" }).click();
  await expect(page).toHaveURL("/");
});
