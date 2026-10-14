import { expect, test } from "@playwright/test";

test("shelf plays Velocity inside the hub and keeps Vanguard off the frame", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Pick a game and play it here." })).toBeVisible();

  const velocity = page.getByRole("article", { name: "Velocity" });
  const vanguard = page.getByRole("article", { name: "Vanguard" });
  await expect(velocity.getByRole("link", { name: "Play" })).toBeVisible();
  await expect(vanguard.getByRole("link", { name: "Play" })).toHaveCount(0);
  await expect(vanguard.getByRole("button", { name: "Not on the web yet" })).toBeDisabled();

  await velocity.getByRole("link", { name: "Play" }).click();
  await expect(page).toHaveURL("/play/velocity");
  await expect(page.locator("iframe")).toHaveAttribute("src", "https://racing.worldofz.info/?hub=1");

  await expect(
    page.getByRole("heading", { name: "Velocity will not open inside this page yet." }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Open on its own site" }).last()).toHaveAttribute(
    "href",
    "https://racing.worldofz.info/",
  );

  await page.getByRole("link", { name: "Leave game" }).click();
  await expect(page).toHaveURL("/");
});

test("a game that is not playable returns to the shelf", async ({ page }) => {
  await page.goto("/play/vanguard");
  await expect(page).toHaveURL("/");
  await page.goto("/play/not-a-game");
  await expect(page).toHaveURL("/");
});

test("phone shelf stays on the screen", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
  );
  expect(overflow).toBe(true);
  await page.getByRole("article", { name: "Velocity" }).getByRole("link", { name: "Play" }).click();
  await expect(page.getByRole("link", { name: "Leave game" })).toBeVisible();
  const playOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
  );
  expect(playOverflow).toBe(true);
});
