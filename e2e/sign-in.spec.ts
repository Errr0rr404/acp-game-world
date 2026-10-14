import { expect, test } from "@playwright/test";

test("sign-in asks for an email and an age confirmation", async ({ page }) => {
  await page.goto("/sign-in");
  await page.getByRole("button", { name: "Send a sign-in link" }).click();
  await expect(page.getByText("Enter an email.")).toBeVisible({ timeout: 20_000 });

  await page.getByLabel("Email", { exact: true }).fill("ada@example.com");
  await page.getByRole("button", { name: "Send a sign-in link" }).click();
  await expect(page.getByText("Confirm you are 13 or older.")).toBeVisible();
});

test("history asks a guest to sign in", async ({ page }) => {
  await page.goto("/me");
  await expect(page).toHaveURL(/\/sign-in$/);
  await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
});

test("sign-in explains request failures and shows an email confirmation", async ({ page }) => {
  await page.route("**/api/sign-in", (route) => route.fulfill({ status: 503, contentType: "application/json", body: JSON.stringify({ ok: false, message: "Accounts are unavailable. Try again in a moment." }) }));
  await page.goto("/sign-in");
  await page.getByLabel("Email", { exact: true }).fill("ada@example.com");
  await page.getByLabel("I am 13 or older.").check();
  await page.getByRole("button", { name: "Send a sign-in link" }).click();
  await expect(page.getByRole("form", { name: "Email sign-in" }).getByRole("alert")).toHaveText("Accounts are unavailable. Try again in a moment.");
  await page.route("**/api/sign-in", (route) => route.fulfill({ contentType: "application/json", body: JSON.stringify({ ok: true }) }));
  await page.getByRole("button", { name: "Send a sign-in link" }).click();
  await expect(page.getByRole("heading", { name: "Check your inbox." })).toBeVisible();
  await expect(page.getByRole("status")).toContainText("ada@example.com");
  await page.getByRole("button", { name: "Use another email" }).click();
  await expect(page.getByLabel("Email", { exact: true })).toHaveValue("");
});
