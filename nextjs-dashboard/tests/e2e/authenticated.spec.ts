import AxeBuilder from "@axe-core/playwright";
import { createClient } from "@supabase/supabase-js";
import { expect, test, type Page } from "@playwright/test";
import { execFileSync } from "node:child_process";

const localSupabaseUrl = "http://127.0.0.1:54321";
// Supabase CLI's documented local-only service-role JWT. It has no access
// outside the disposable stack and is never imported by application code.
const localServiceRoleKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU";
const userId = "40000000-0000-4000-8000-000000000001";
const email = "browser-admin@example.test";
const password = "browser-test-password";

const admin = createClient(localSupabaseUrl, localServiceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function login(page: Page) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Log in" }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
}

test.describe.configure({ mode: "serial" });

test.beforeAll(async () => {
  await admin.auth.admin.deleteUser(userId);
  const { error: userError } = await admin.auth.admin.createUser({
    id: userId,
    email,
    password,
    email_confirm: true,
  });
  if (userError) throw userError;
  execFileSync("docker", [
    "exec",
    "supabase_db_exercise-tracker",
    "psql",
    "-U",
    "postgres",
    "-d",
    "postgres",
    "-v",
    "ON_ERROR_STOP=1",
    "-c",
    `insert into public.admins (user_id) values ('${userId}')`,
  ]);
});

test.afterAll(async () => {
  await admin.auth.admin.deleteUser(userId);
});

test("registered profile persists across refresh and logout revokes the browser session", async ({
  page,
}) => {
  await login(page);
  await page.goto("/settings/profile");
  await page.getByLabel("Display name").fill("Browser Admin");
  await page.getByLabel("Language").selectOption("en");
  await page.getByLabel("Timezone").fill("Asia/Bangkok");
  await page.getByLabel("Units").selectOption("metric");
  await page.getByRole("button", { name: "Save profile" }).click();
  await expect(page.getByText("Profile saved.")).toBeVisible();

  await page.reload();
  await expect(page.getByLabel("Display name")).toHaveValue("Browser Admin");
  await expect(page.getByLabel("Timezone")).toHaveValue("Asia/Bangkok");
  await page.goto("/dashboard");
  await page.getByRole("button", { name: "Open navigation" }).click();
  await page.getByRole("button", { name: "Sign Out" }).click();
  await expect(page).toHaveURL(/\/login$/);
  const denied = await page.goto("/admin/customers");
  expect(denied?.status()).toBe(404);
});

test("confirmed guest import is persisted once and clears browser data", async ({
  page,
}) => {
  const envelope = {
    schemaVersion: 1,
    exportId: "40000000-0000-4000-8000-000000000002",
    exportedAt: "2026-07-27T00:00:00.000Z",
    profile: {
      displayName: "Imported Account",
      locale: "en",
      timezone: "UTC",
      unitSystem: "us",
    },
  };
  await page.goto("/");
  await page.evaluate(
    ([key, value]) => localStorage.setItem(key, value),
    ["exercise-tracker:guest:v1", JSON.stringify(envelope)],
  );
  await login(page);
  await page.goto("/onboarding/import");
  await page.getByRole("button", { name: "Confirm import" }).click();
  await expect(
    page.getByText("Guest profile imported successfully."),
  ).toBeVisible();
  expect(
    await page.evaluate(() =>
      localStorage.getItem("exercise-tracker:guest:v1"),
    ),
  ).toBeNull();

  await page.goto("/settings/profile");
  await expect(page.getByLabel("Display name")).toHaveValue("Imported Account");
  await expect(page.getByLabel("Units")).toHaveValue("us");
});

for (const locale of ["en", "th"] as const) {
  test(`authenticated administrator page in ${locale} has no detectable WCAG A/AA violations`, async ({
    context,
    page,
  }) => {
    await login(page);
    await context.addCookies([
      {
        name: "exercise_tracker_locale",
        value: locale,
        domain: "127.0.0.1",
        path: "/",
      },
    ]);
    await page.goto("/admin/customers");
    await expect(page.locator("html")).toHaveAttribute("lang", locale);
    await expect(page.locator("h1")).toBeVisible();
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(results.violations).toEqual([]);
  });
}
