import { expect, test } from "@playwright/test";

test("authentication entry points expose accessible email workflows", async ({
  page,
}) => {
  for (const route of ["/login", "/signup", "/forgot-password"]) {
    await page.goto(route);
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.locator('[aria-live="polite"]')).toHaveCount(1);
  }
});

test("login preserves only a local callback destination", async ({ page }) => {
  await page.goto("/login?callbackUrl=%2Fsettings%2Fprofile");
  await expect(page.locator('input[name="callbackUrl"]')).toHaveValue(
    "/settings/profile",
  );

  await page.goto("/login?callbackUrl=https%3A%2F%2Fevil.example");
  await expect(page.locator('input[name="callbackUrl"]')).toHaveCount(0);
});

test("invalid confirmation input fails without exposing sensitive details", async ({
  request,
}) => {
  const response = await request.get(
    "/auth/confirm?token_hash=invalid&type=signup",
    {
      maxRedirects: 0,
    },
  );

  expect(response.status()).toBeGreaterThanOrEqual(300);
  expect(await response.text()).not.toMatch(
    /(?:stack|postgres|supabase_service_role|password)/i,
  );
});
