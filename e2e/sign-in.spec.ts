import { expect, test } from "@playwright/test";

test("sign-in asks for an email and an age confirmation", async ({ page }) => {
  await page.goto("/sign-in");
  await page.getByRole("button", { name: "Send a sign-in link" }).click();
  await expect(page.getByText("Enter an email.")).toBeVisible({ timeout: 20_000 });

  await page.getByLabel("Email").fill("ada@example.com");
  await page.getByRole("button", { name: "Send a sign-in link" }).click();
  await expect(page.getByText("Confirm you are 13 or older.")).toBeVisible();
});

test("history asks a guest to sign in", async ({ page }) => {
  await page.goto("/me");
  await expect(page).toHaveURL(/\/sign-in$/);
  await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
});
