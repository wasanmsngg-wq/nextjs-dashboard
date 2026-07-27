import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const publicAndGuestRoutes = [
  "/",
  "/login",
  "/signup",
  "/forgot-password",
  "/dashboard",
  "/settings/profile",
  "/onboarding/import",
];

for (const route of publicAndGuestRoutes) {
  test(`${route} has no automatically detectable WCAG A/AA violations`, async ({
    page,
  }) => {
    await page.goto(route);
    await expect(page.locator("body")).toBeVisible();
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(results.violations).toEqual([]);
  });
}

test("profile form is usable by keyboard and announces save status", async ({
  page,
}) => {
  await page.goto("/settings/profile");
  await page.getByLabel("Display name").focus();
  await expect(page.getByLabel("Display name")).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByLabel("Language")).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByLabel("Timezone")).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByLabel("Units")).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("button", { name: "Save profile" }),
  ).toBeFocused();
});
