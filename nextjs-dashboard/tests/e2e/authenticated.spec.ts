import AxeBuilder from "@axe-core/playwright";
import { createClient } from "@supabase/supabase-js";
import { expect, test, type Page } from "@playwright/test";
import { execFileSync } from "node:child_process";

const localSupabaseUrl = "http://127.0.0.1:54321";
// Supabase CLI's documented local-only service-role JWT. It has no access
// outside the disposable stack and is never imported by application code.
const localServiceRoleKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU";
let userId = "40000000-0000-4000-8000-000000000001";
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

async function expectAccessibleResponsivePage(page: Page) {
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(results.violations).toEqual([]);
}

test.describe.configure({ mode: "serial" });

async function removeBrowserTestUsers() {
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
    `delete from auth.users where email = '${email}'`,
  ]);
}

test.beforeAll(async () => {
  await removeBrowserTestUsers();
  const { data: created, error: userError } = await admin.auth.admin.createUser(
    {
      id: userId,
      email,
      password,
      email_confirm: true,
    },
  );
  if (userError) throw userError;
  userId = created.user.id;
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
  await removeBrowserTestUsers();
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

test("registered user creates a template and completes an immutable workout", async ({
  context,
  page,
}) => {
  await login(page);
  await page.goto("/workouts/exercises");
  await expect(
    page.getByRole("link", { name: "Back to workouts" }),
  ).toBeVisible();
  await page.getByLabel("Exercise name").fill("Browser Curl");
  await page.getByLabel("Tracking mode").selectOption("reps_load");
  await page.locator('select[name="category"]').selectOption("strength");
  await page.getByLabel("Equipment").fill("curl bench");
  await page.getByRole("button", { name: "Create exercise" }).click();
  await expect(page.getByText("Exercise saved.")).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Browser Curl" }),
  ).toBeVisible();
  await expect(page.getByText("curl bench")).toBeVisible();
  await expectAccessibleResponsivePage(page);

  await page.goto("/workouts");
  await page.getByRole("button", { name: "Start empty workout" }).click();
  await expect(page).toHaveURL(/\/workouts\/sessions\//);
  await page.getByLabel("Add exercise").selectOption({
    label: "Browser Curl",
  });
  await page.getByLabel("Sets").fill("2");
  await page.getByRole("button", { name: "Add", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Browser Curl" }),
  ).toBeVisible();
  await expect(page.getByText("Planned target")).toHaveCount(0);
  await page.getByRole("button", { name: "Remove", exact: true }).click();
  const removeDialog = page.getByRole("dialog", {
    name: "Remove this exercise?",
  });
  await expect(removeDialog).toBeVisible();
  await removeDialog.getByRole("button", { name: "Remove exercise" }).click();
  await expect(page.getByRole("heading", { name: "Browser Curl" })).toHaveCount(
    0,
  );
  await expect(page.getByText("Exercise removed.")).toBeVisible();
  await page.getByRole("button", { name: "Add", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Browser Curl" }),
  ).toBeVisible();
  const adHocSet = page
    .getByRole("checkbox")
    .first()
    .locator("xpath=ancestor::li[1]");
  await adHocSet.getByLabel("Reps").fill("8");
  await adHocSet.getByLabel(/Load/).fill("12.5");
  await page.getByRole("button", { name: "Cancel exercise" }).click();
  const cancellationDialog = page.getByRole("dialog", {
    name: "Cancel exercise",
  });
  await cancellationDialog
    .getByLabel("Why are you canceling this exercise?")
    .fill("Shoulder discomfort");
  await cancellationDialog
    .getByRole("button", { name: "Cancel exercise" })
    .click();
  await expect(page.getByText("Canceled", { exact: true })).toBeVisible();
  await expect(cancellationDialog).toBeHidden();
  await expect(
    page.getByRole("paragraph").filter({ hasText: "Shoulder discomfort" }),
  ).toBeVisible();
  await expect(
    page.getByText("Exercise canceled and kept in the workout record."),
  ).toBeVisible();
  await page.getByRole("button", { name: "Discard workout" }).click();
  await page
    .getByRole("dialog", { name: "Discard this workout?" })
    .getByRole("button", { name: "Discard workout" })
    .click();
  await expect(page).toHaveURL(/\/workouts$/);

  await page.goto("/workouts/templates/new");
  await page.getByLabel("Template name").fill("Browser Strength");
  await page
    .getByLabel("Notes")
    .fill("A complete multi-character template description");
  await expect(page.getByLabel("Template name")).toHaveValue(
    "Browser Strength",
  );
  await page.getByLabel("Search exercises").fill("Squat");
  await page.getByLabel("Add exercise").selectOption({ label: "Squat" });
  await page.getByRole("button", { name: "Add", exact: true }).click();
  await expectAccessibleResponsivePage(page);
  await page.getByRole("button", { name: "Save template" }).click();
  await expect(page).toHaveURL(/\/workouts$/);

  const template = page
    .getByRole("listitem")
    .filter({ hasText: "Browser Strength" });
  await template.getByRole("button", { name: "Start" }).click();
  await expect(page).toHaveURL(/\/workouts\/sessions\//);
  await expect(page.getByText("Planned target").first()).toBeVisible();
  await expect(page.getByText(/8 reps/i).first()).toBeVisible();
  await expect(page.getByText("Actual result").first()).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Remove", exact: true }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Cancel exercise" }),
  ).toBeVisible();
  const firstSet = page
    .getByRole("checkbox")
    .first()
    .locator("xpath=ancestor::li[1]");
  await firstSet.getByLabel("Reps").fill("10");
  await firstSet.getByLabel(/Load/).fill("25");
  await firstSet.getByRole("button", { name: "Start timer" }).click();
  await page.waitForTimeout(1_100);
  await firstSet.getByRole("button", { name: "Stop timer" }).click();
  await expect(firstSet.getByLabel(/Set time: 00:0[1-9]/)).toBeVisible();
  await expect(page.getByText(/Exercise time: 00:0[1-9]/)).toBeVisible();
  await firstSet.getByRole("checkbox").focus();
  await page.keyboard.press("Space");
  await expect(page.getByText("Changes saved.", { exact: true })).toBeVisible();
  await context.setOffline(true);
  await firstSet.getByLabel("Set notes").fill("queued while offline");
  await page.getByRole("heading", { name: "Squat" }).click();
  await expect(page.getByText(/Offline/)).toBeVisible();
  await context.setOffline(false);
  await expect(page.getByText("Changes saved.", { exact: true })).toBeVisible();
  await page.reload();
  await expect(firstSet.getByLabel("Reps")).toHaveValue("10");
  await expect(firstSet.getByLabel(/Set time: 00:0[1-9]/)).toBeVisible();
  await expect(firstSet.getByLabel("Set notes")).toHaveValue(
    "queued while offline",
  );
  await page.getByRole("button", { name: "Complete workout" }).click();
  const completionDialog = page.getByRole("dialog", {
    name: "Complete this workout?",
  });
  await completionDialog
    .getByRole("button", { name: "Complete workout" })
    .click();
  await expect(page.getByText("Workout completed.")).toBeVisible();
  await expect(page.getByText("Completed workout — read only")).toBeVisible();
  await expect(firstSet.getByRole("checkbox")).toBeDisabled();
  await expect(completionDialog).toBeHidden();

  await expectAccessibleResponsivePage(page);
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
    await expect(
      page.getByRole("button", {
        name: locale === "en" ? "Open navigation" : "เปิดเมนูนำทาง",
      }),
    ).toBeVisible();
    await expect(page.locator("header").first()).toBeVisible();
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(results.violations).toEqual([]);
  });
}
