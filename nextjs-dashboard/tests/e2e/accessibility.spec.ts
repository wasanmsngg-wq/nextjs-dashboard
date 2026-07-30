import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const publicAndGuestRoutes = [
  "/",
  "/login",
  "/signup",
  "/forgot-password",
  "/update-password",
  "/dashboard",
  "/settings/profile",
  "/onboarding/import",
  "/workouts",
];

for (const route of publicAndGuestRoutes) {
  for (const locale of ["en", "th"] as const) {
    test(`${route} in ${locale} has no automatically detectable WCAG A/AA violations`, async ({
      context,
      page,
    }) => {
      await context.addCookies([
        {
          name: "exercise_tracker_locale",
          value: locale,
          domain: "127.0.0.1",
          path: "/",
        },
      ]);
      await page.goto(route);
      await expect(page.locator("html")).toHaveAttribute("lang", locale);
      await expect(page.locator("body")).toBeVisible();
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
        .analyze();
      expect(results.violations).toEqual([]);
    });
  }
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
  await page.keyboard.press("Enter");
  await expect(page.locator('[aria-live="polite"]')).toContainText(
    "Guest profile saved on this browser.",
  );
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(results.violations).toEqual([]);
});

test("mobile navigation contains focus and restores it when closed", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await page.goto("/dashboard");
  const trigger = page.getByRole("button", { name: "Open navigation" });
  await trigger.focus();
  await page.keyboard.press("Enter");
  const close = page.getByRole("button", { name: "Close navigation" });
  await expect(close).toBeFocused();

  await page.keyboard.press("Shift+Tab");
  await expect(page.getByRole("link", { name: "Log in" })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(close).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
});

test("public and guest pages reflow at 320 CSS pixels with WCAG text spacing", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 640 });
  for (const route of publicAndGuestRoutes) {
    await page.goto(route);
    await page.addStyleTag({
      content: `
        * {
          line-height: 1.5 !important;
          letter-spacing: 0.12em !important;
          word-spacing: 0.16em !important;
        }
        p { margin-bottom: 2em !important; }
      `,
    });
    await expect
      .poll(() =>
        page.evaluate(
          () =>
            document.documentElement.scrollWidth <=
            document.documentElement.clientWidth,
        ),
      )
      .toBe(true);
  }
});
