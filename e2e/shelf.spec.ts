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
  await expect(page.getByRole("article", { name: "Vanguard" })).toHaveCount(0);
  await expect(velocity.getByRole("link", { name: "Play Velocity" })).toBeVisible();
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

test("flap flap fly opens on its own origin", async ({ page }) => {
  test.setTimeout(60_000);
  const origin = "https://flap-flap-fly.liveapps.dev";
  await page.route(`${origin}/**`, (route) => route.fulfill({
    contentType: "text/html",
    body: "<!doctype html><html><body>Flap</body></html>",
  }));
  await page.goto("/");
  const card = page.getByRole("article", { name: "Flap Flap Fly" });
  await card.getByRole("link", { name: "Play Flap Flap Fly" }).click();
  await expect(page).toHaveURL("/play/flap-flap-fly");
  // Framing permission is checked on the server against the live game. The card's own-site link is the origin either way.
  await expect(page.locator("[data-frame-state]")).toBeVisible({ timeout: 20_000 });
  if (await page.locator("iframe").count()) {
    await expect(page.locator("iframe")).toHaveAttribute("src", `${origin}/?hub=1`);
  }
  await expect(page.getByRole("link", { name: "Open on its own site" }).last()).toHaveAttribute("href", `${origin}/`);
});

test("scrapyard opens on its own origin", async ({ page }) => {
  test.setTimeout(60_000);
  const origin = "https://scrapyard-fps.liveapps.dev";
  await page.route(`${origin}/**`, (route) => route.fulfill({
    contentType: "text/html",
    body: "<!doctype html><html><body>Scrapyard</body></html>",
  }));
  await page.goto("/");
  const card = page.getByRole("article", { name: "Scrapyard" });
  await card.getByRole("link", { name: "Play Scrapyard" }).click();
  await expect(page).toHaveURL("/play/scrapyard-fps");
  await expect(page.locator("[data-frame-state]")).toBeVisible({ timeout: 20_000 });
  if (await page.locator("iframe").count()) {
    await expect(page.locator("iframe")).toHaveAttribute("src", `${origin}/?hub=1`);
  }
  await expect(page.getByRole("link", { name: "Open on its own site" }).last()).toHaveAttribute("href", `${origin}/`);
});

for (const game of [
  { slug: "sundial-dash", title: "Sundial Dash" },
  { slug: "voxel-rivals", title: "Voxel Rivals" },
  { slug: "tetherfly", title: "Tetherfly" },
  { slug: "stunt-ridge", title: "Stunt Ridge" },
  { slug: "wicks-end", title: "Wick's End" },
]) {
  test(`${game.title} opens on its own origin`, async ({ page }) => {
    test.setTimeout(60_000);
    const origin = `https://${game.slug}.liveapps.dev`;
    await page.route(`${origin}/**`, (route) => route.fulfill({
      contentType: "text/html",
      body: `<!doctype html><html><body>${game.title}</body></html>`,
    }));
    await page.goto("/");
    const card = page.getByRole("article", { name: game.title });
    await card.getByRole("link", { name: `Play ${game.title}` }).click();
    await expect(page).toHaveURL(`/play/${game.slug}`);
    await expect(page.locator("[data-frame-state]")).toBeVisible({ timeout: 20_000 });
    if (await page.locator("iframe").count()) {
      await expect(page.locator("iframe")).toHaveAttribute("src", `${origin}/?hub=1`);
    }
    await expect(page.getByRole("link", { name: "Open on its own site" }).last()).toHaveAttribute("href", `${origin}/`);
  });
}

test("a game that is not playable returns to discovery", async ({ page }) => {
  await page.goto("/play/vanguard");
  await expect(page).toHaveURL("/");
  await page.goto("/play/wordwell");
  await expect(page).toHaveURL("/");
  await page.goto("/play/sweet-snip");
  await expect(page).toHaveURL("/");
  await page.goto("/play/lab-escape");
  await expect(page).toHaveURL("/");
  await page.goto("/play/monster-haul");
  await expect(page).toHaveURL("/");
  await page.goto("/play/balloon-bastion");
  await expect(page).toHaveURL("/");
  await page.goto("/play/inkland");
  await expect(page).toHaveURL("/");
  await page.goto("/play/corner-pocket");
  await expect(page).toHaveURL("/");
  await page.goto("/play/patience-parlor");
  await expect(page).toHaveURL("/");
  await page.goto("/play/glowtail");
  await expect(page).toHaveURL("/");
  await page.goto("/play/twofold");
  await expect(page).toHaveURL("/");
  await page.goto("/play/beatline");
  await expect(page).toHaveURL("/");
  await page.goto("/play/rim-rivals");
  await expect(page).toHaveURL("/");
  await page.goto("/play/bubble-reef");
  await expect(page).toHaveURL("/");
  await page.goto("/play/hop-lanes");
  await expect(page).toHaveURL("/");
  await page.goto("/play/orchard-drop");
  await expect(page).toHaveURL("/");
  await page.goto("/play/crumb-tycoon");
  await expect(page).toHaveURL("/");
  await page.goto("/play/not-a-game");
  await expect(page).toHaveURL("/");
});

for (const title of ["Wordwell", "Sweet Snip", "Lab Escape", "Monster Haul", "Balloon Bastion", "Inkland", "Corner Pocket", "Patience Parlor", "Glowtail", "Twofold", "Beatline", "Rim Rivals", "Bubble Reef", "Hop Lanes", "Orchard Drop", "Crumb Tycoon"]) {
  test(`${title} is on the shelf and not playable yet`, async ({ page }) => {
    await page.goto("/");
    const card = page.getByRole("article", { name: title });
    await expect(card).toBeVisible({ timeout: 20_000 });
    await expect(card.getByText("Coming soon")).toBeVisible();
    await expect(card.getByRole("link", { name: `Play ${title}` })).toHaveCount(0);
    await card.getByRole("button", { name: `About ${title}` }).click();
    await expect(page.getByRole("dialog").getByText("The browser version is packaged and waiting to go live.")).toBeVisible();
  });
}

test("search, genre, availability and clear filters work together", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("searchbox", { name: "Search games" }).fill("BLUE touch");
  await expect(page.getByRole("article", { name: "Velocity" })).toBeVisible();
  await expect(page.getByRole("article", { name: "Vanguard" })).toHaveCount(0);
  await page.getByLabel("Genre", { exact: true }).selectOption("Action");
  await expect(page.getByRole("heading", { name: "No games match just yet." })).toBeVisible();
  await page.getByRole("button", { name: "Clear filters" }).click();
  await expect(page.getByRole("article")).toHaveCount(24);
  await page.getByRole("button", { name: "Coming soon 16", exact: true }).click();
  await expect(page.getByRole("article", { name: "Wordwell" })).toBeVisible();
  await expect(page.getByRole("article", { name: "Sweet Snip" })).toBeVisible();
  await expect(page.getByRole("article", { name: "Lab Escape" })).toBeVisible();
  await expect(page.getByRole("article", { name: "Monster Haul" })).toBeVisible();
  await expect(page.getByRole("article", { name: "Balloon Bastion" })).toBeVisible();
  await expect(page.getByRole("article", { name: "Inkland" })).toBeVisible();
  await expect(page.getByRole("article", { name: "Corner Pocket" })).toBeVisible();
  await expect(page.getByRole("article", { name: "Patience Parlor" })).toBeVisible();
  await expect(page.getByRole("article", { name: "Glowtail" })).toBeVisible();
  await expect(page.getByRole("article", { name: "Twofold" })).toBeVisible();
  await expect(page.getByRole("article", { name: "Beatline" })).toBeVisible();
  await expect(page.getByRole("article", { name: "Rim Rivals" })).toBeVisible();
  await expect(page.getByRole("article", { name: "Bubble Reef" })).toBeVisible();
  await expect(page.getByRole("article", { name: "Hop Lanes" })).toBeVisible();
  await expect(page.getByRole("article", { name: "Orchard Drop" })).toBeVisible();
  await expect(page.getByRole("article", { name: "Crumb Tycoon" })).toBeVisible();
  await expect(page.getByRole("article", { name: "Velocity" })).toHaveCount(0);
});

test("saving works without an account, persists and can be undone", async ({ page }) => {
  await page.goto("/library");
  await expect(page.getByRole("heading", { name: "Keep your favorites close." })).toBeVisible();
  await page.getByRole("navigation", { name: "Main navigation" }).getByRole("link", { name: "Discover" }).click();
  const velocity = page.getByRole("article", { name: "Velocity" });
  await velocity.getByRole("button", { name: "Save Velocity", exact: true }).click();
  await expect(velocity.getByRole("button", { name: "Unsave Velocity" })).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("navigation", { name: "Main navigation" }).getByRole("link", { name: "Your library" }).click();
  await expect(page).toHaveURL("/library");
  await expect(page.getByRole("heading", { name: "Your library", exact: true })).toBeVisible();
  await expect(page.getByRole("article", { name: "Velocity" })).toBeVisible();
  await page.reload();
  await expect(page.getByRole("article", { name: "Velocity" })).toBeVisible();
  await page.getByRole("button", { name: "Unsave Velocity" }).click();
  await expect(page.getByRole("heading", { name: "Keep your favorites close." })).toBeVisible();
});

test("game details support keyboard dismissal", async ({ page }) => {
  await page.goto("/");
  const trigger = page.getByRole("button", { name: "About Velocity" });
  await trigger.click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByRole("heading", { name: "Velocity" })).toBeVisible();
  await expect(dialog.getByRole("link", { name: "Play Velocity" })).toBeVisible();
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
  await expect(page.getByRole("article")).toHaveCount(24);
  const other = await context.newPage();
  await other.goto("/library");
  await expect(other.getByRole("heading", { name: "Keep your favorites close." })).toBeVisible();
  await page.getByRole("article", { name: "Velocity" }).getByRole("button", { name: "Save Velocity", exact: true }).click();
  await expect(other.getByRole("article", { name: "Velocity" })).toBeVisible();
  await other.close();
});

test("library remains usable when browser storage is unavailable", async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.getItem = () => { throw new Error("Storage disabled"); };
    Storage.prototype.setItem = () => { throw new Error("Storage disabled"); };
  });
  await page.goto("/");
  await page.getByRole("article", { name: "Velocity" }).getByRole("button", { name: "Save Velocity", exact: true }).click();
  await page.getByRole("navigation", { name: "Main navigation" }).getByRole("link", { name: "Your library" }).click();
  await expect(page.getByRole("article", { name: "Velocity" })).toBeVisible();
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
