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

async function removeAdminMasterData() {
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
    "delete from public.exercises where system_key='rehab-band-pull'; delete from public.exercise_categories where key='rehab';",
  ]);
}

async function createAdminExerciseRecord() {
  const completedAt = new Date().toISOString();
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
    `insert into public.workout_sessions(id,user_id,status,completed_at,template_name_snapshot) values ('47000000-0000-4000-8000-000000000001','${userId}','completed','${completedAt}','Admin audit workout'); insert into public.workout_session_exercises(id,session_id,exercise_id,exercise_name_snapshot,tracking_mode,position,completed) values ('47000000-0000-4000-8000-000000000002','47000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000001','Admin Record Squat','reps_load',0,true); insert into public.workout_sets(id,session_exercise_id,position,completed,reps,load_grams,elapsed_seconds) values ('47000000-0000-4000-8000-000000000003','47000000-0000-4000-8000-000000000002',0,true,8,50000,45);`,
  ]);
}

test.beforeAll(async () => {
  await removeBrowserTestUsers();
  await removeAdminMasterData();
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
  await removeAdminMasterData();
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
  test.setTimeout(60_000);

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
  await expect(
    page.getByRole("button", { name: "Complete workout" }),
  ).toBeDisabled();
  await expect(
    page.getByText("Add at least one exercise before completing this workout."),
  ).toBeVisible();
  await page.getByLabel("Add exercise").selectOption({
    label: "Browser Curl",
  });
  await page.getByLabel("Sets").fill("2");
  const sessionUrl = page.url();
  let addMutationRequests = 0;
  let signalAddRequestStarted!: () => void;
  let releaseAddRequest!: () => void;
  const addRequestStarted = new Promise<void>((resolve) => {
    signalAddRequestStarted = resolve;
  });
  const addRequestReleased = new Promise<void>((resolve) => {
    releaseAddRequest = resolve;
  });
  await page.route(sessionUrl, async (route) => {
    const request = route.request();
    if (request.method() === "POST" && request.headers()["next-action"]) {
      addMutationRequests += 1;
      signalAddRequestStarted();
      await addRequestReleased;
    }
    await route.continue();
  });
  const addButton = page.getByRole("button", { name: "Add", exact: true });
  const addClick = addButton.click();
  await addRequestStarted;
  await expect(addButton).toBeDisabled();
  await expect(addButton).toHaveAttribute("aria-busy", "true");
  await expect(addButton).toHaveClass(/ant-btn-loading/);
  await expect(page.getByLabel("Add exercise")).toBeDisabled();
  await expect(page.getByLabel("Sets")).toBeDisabled();
  await addButton.dispatchEvent("click");
  releaseAddRequest();
  await addClick;
  await expect(
    page.getByRole("heading", { name: "Browser Curl" }),
  ).toBeVisible();
  expect(addMutationRequests).toBe(1);
  await expect(addButton).toBeEnabled();
  await expect(addButton).toHaveAttribute("aria-busy", "false");
  await page.unroute(sessionUrl);
  await expect(page.getByText("Planned target")).toHaveCount(0);
  await page.getByRole("button", { name: "Remove", exact: true }).click();
  const removeDialog = page.getByRole("dialog", {
    name: "Remove this exercise?",
  });
  await expect(removeDialog).toBeVisible();
  await removeDialog.getByRole("button", { name: "Remove exercise" }).click();
  await expect(page.getByText("Exercise removed.")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Browser Curl" })).toHaveCount(
    0,
  );
  await page.getByLabel("Sets").fill("0");
  await addButton.click();
  await expect(
    page.locator('[role="alert"]').filter({
      hasText: "Check the exercise and set count.",
    }),
  ).toBeVisible();
  await expect(addButton).toBeEnabled();
  await expect(addButton).toHaveAttribute("aria-busy", "false");
  await expect(page.getByLabel("Add exercise")).toBeEnabled();
  await expect(page.getByLabel("Sets")).toBeEnabled();
  await page.getByLabel("Sets").fill("2");
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
  await expect(
    page.locator('[role="status"]').filter({
      hasText: "Exercise canceled and kept in the workout record.",
    }),
  ).toBeVisible();
  await expect(page.getByText("Canceled", { exact: true })).toBeVisible();
  await expect(cancellationDialog).toBeHidden();
  await expect(
    page.getByRole("paragraph").filter({ hasText: "Shoulder discomfort" }),
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
  await page.getByLabel("Add exercise").selectOption({
    label: "Browser Curl",
  });
  await page.getByLabel("Sets").fill("1");
  await page.getByRole("button", { name: "Add", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Browser Curl" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Complete workout" }).click();
  const completionDialog = page.getByRole("dialog", {
    name: "Cancel unfinished exercises?",
  });
  const completionButton = completionDialog.getByRole("button", {
    name: "Complete workout",
  });
  await expect(completionButton).toBeDisabled();
  await completionDialog
    .getByLabel("Reason for Browser Curl")
    .fill("Session time ended");
  for (const textarea of await completionDialog.locator("textarea").all()) {
    if (!(await textarea.inputValue()))
      await textarea.fill("Session time ended");
  }
  await expect(completionButton).toBeEnabled();
  await completionButton.click();
  const completionToast = page.locator('[role="status"]').filter({
    hasText: "Workout completed.",
  });
  await expect(completionToast).toBeVisible();
  await expect(page.getByText("Completed workout — read only")).toBeVisible();
  await expect(firstSet.getByRole("checkbox")).toBeDisabled();
  await expect(completionDialog).toBeHidden();
  await expect(page.getByText("Session time ended").first()).toBeVisible();

  if (await completionToast.isVisible()) {
    await completionToast
      .getByRole("button")
      .click({ timeout: 2_000 })
      .catch(() => undefined);
  }
  await expect(completionToast).toBeHidden();
  await expectAccessibleResponsivePage(page);

  await page.goto("/workouts/history");
  await expect(
    page.getByRole("heading", { name: "Workout history" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Browser Strength" }),
  ).toBeVisible();
  await expect(page.getByText(/Squat ·/).first()).toBeVisible();
  await page
    .getByRole("combobox", { name: "Exercise" })
    .selectOption({ label: "Squat" });
  await page.getByRole("button", { name: "Apply filters" }).click();
  await expect(page).toHaveURL(/exercise=20000000-0000-4000-8000-000000000001/);
  await expect(
    page.getByRole("heading", { name: "Browser Strength" }),
  ).toBeVisible();
  const today = new Date().toISOString().slice(0, 10);
  await page.getByLabel("From date").fill(today);
  await page.getByLabel("To date").fill(today);
  await page.getByRole("button", { name: "Apply filters" }).click();
  await expect(page.getByText("1 workouts found")).toBeVisible();
  await expectAccessibleResponsivePage(page);
});

test("administrator manages master data and inspects users and exercise records", async ({
  page,
}) => {
  await login(page);
  await createAdminExerciseRecord();
  await page.goto("/admin");
  await expect(
    page.getByRole("heading", { name: "Administration" }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Open users" })).toBeVisible();
  await expectAccessibleResponsivePage(page);

  await page.goto("/admin/users");
  await page.waitForLoadState("networkidle");
  const userAccounts = page.getByLabel("User accounts");
  await expect(userAccounts.getByText(email).first()).toBeVisible();
  await page.getByLabel("Search").fill("browser-admin");
  await expect(page).toHaveURL(/query=browser-admin/);
  await expect(userAccounts.getByText(email).first()).toBeVisible();

  await page.goto("/admin/master-data/categories");
  await page.getByLabel("Category key").fill("rehab");
  await page.getByLabel("Sort order").fill("35");
  await page.getByLabel("English name").fill("Rehabilitation");
  await page.getByLabel("Thai name").fill("ฟื้นฟู");
  await page.getByRole("button", { name: "Create category" }).click();
  await expect(page.getByText("Category saved.")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Rehabilitation" }),
  ).toBeVisible();

  await page.goto("/admin/master-data/exercises");
  await page.getByLabel("System key").fill("rehab-band-pull");
  await page.getByLabel("Tracking mode").selectOption("reps");
  await page.getByLabel("English name").fill("Rehab Band Pull");
  await page.getByLabel("Thai name").fill("ดึงยางฟื้นฟู");
  await page.getByLabel("Category").selectOption("rehab");
  await page.getByLabel("Equipment").fill("resistance band");
  const createSystemExerciseButton = page.getByRole("button", {
    name: "Create system exercise",
  });
  await createSystemExerciseButton.click();
  await expect(page.getByText("System exercise saved.")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Rehab Band Pull" }),
  ).toBeVisible();
  await page.mouse.move(0, 0);
  await expect(createSystemExerciseButton).toHaveCSS(
    "background-color",
    "rgb(30, 64, 175)",
  );
  await expectAccessibleResponsivePage(page);

  await page.goto("/workouts/exercises");
  await expect(
    page.locator('select[name="category"] option[value="rehab"]'),
  ).toHaveText("Rehabilitation");

  await page.goto("/admin/exercise-records");
  await expect(
    page.getByRole("heading", { name: "Admin Record Squat" }),
  ).toBeVisible();
  await page.getByLabel("Search").fill("Admin Record Squat");
  await expect(
    page.getByRole("heading", { name: "Admin Record Squat" }),
  ).toBeVisible();
  await expectAccessibleResponsivePage(page);
});

test("navigation exposes subpages and reports a protected route transition immediately", async ({
  page,
}) => {
  await login(page);
  await page.goto("/workouts");

  const languageSelect = page.getByLabel("Language");
  await expect(languageSelect).toHaveCSS("background-image", "none");
  const languageControl = page.locator("label").filter({ has: languageSelect });
  await expect(languageControl.locator("svg")).toHaveCount(1);

  let navigationDelayed = false;
  await page.route(/\/admin(?:\?|$)/, async (route) => {
    const headers = route.request().headers();
    if (
      headers["next-router-prefetch"] === "1" ||
      headers.purpose === "prefetch"
    ) {
      await route.abort();
      return;
    }
    if (!navigationDelayed) {
      navigationDelayed = true;
      await new Promise((resolve) => setTimeout(resolve, 1_000));
    }
    await route.continue();
  });
  await page.getByRole("button", { name: "Open navigation" }).click();
  const sidebar = page.locator("#application-sidebar");
  const workoutsGroup = sidebar
    .getByRole("link", { name: "Workouts", exact: true })
    .locator("xpath=ancestor::li[1]");
  const workoutsToggle = workoutsGroup.getByRole("button");
  await expect(workoutsToggle).toHaveAccessibleName("Collapse submenu");
  await expect(workoutsToggle).toHaveAttribute("aria-expanded", "true");
  for (const linkName of ["Exercise library", "Create template"]) {
    await expect(
      workoutsGroup.getByRole("link", { name: linkName }),
    ).toBeVisible();
  }

  const administrationGroup = sidebar
    .getByRole("link", { name: "Administration", exact: true })
    .locator("xpath=ancestor::li[1]");
  const administrationToggle = administrationGroup.getByRole("button");
  await expect(administrationToggle).toHaveAccessibleName("Expand submenu");
  await expect(administrationToggle).toHaveAttribute("aria-expanded", "false");
  for (const linkName of [
    "Users",
    "Exercise records",
    "Exercise categories",
    "System exercises",
    "Customers",
  ]) {
    await expect(
      administrationGroup.getByRole("link", { name: linkName }),
    ).toBeHidden();
  }
  await administrationToggle.focus();
  await page.keyboard.press("Enter");
  await expect(administrationToggle).toHaveAccessibleName("Collapse submenu");
  await expect(administrationToggle).toHaveAttribute("aria-expanded", "true");
  await expect(
    administrationGroup.getByRole("link", { name: "Users" }),
  ).toBeVisible();

  await workoutsToggle.press("Space");
  await expect(workoutsToggle).toHaveAccessibleName("Expand submenu");
  await expect(workoutsToggle).toHaveAttribute("aria-expanded", "false");
  await expect(
    workoutsGroup.getByRole("link", { name: "Exercise library" }),
  ).toBeHidden();
  await workoutsToggle.press("Enter");
  await expect(workoutsToggle).toHaveAccessibleName("Collapse submenu");
  await expect(workoutsToggle).toHaveAttribute("aria-expanded", "true");

  await sidebar
    .getByRole("link", { name: "Administration", exact: true })
    .dispatchEvent("click", { button: 0 });
  await expect(page.getByTestId("route-transition-loading")).toBeVisible();
  await expect(page).toHaveURL(/\/workouts$/);
  await expect(page).toHaveURL(/\/admin$/);
  await expect(page.getByTestId("route-transition-loading")).toBeHidden();
  await expect(
    page.getByRole("heading", { name: "Administration" }),
  ).toBeVisible({ timeout: 15_000 });
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
    for (const route of [
      "/admin",
      "/admin/users",
      "/admin/exercise-records",
      "/admin/master-data/categories",
      "/admin/master-data/exercises",
      "/admin/customers",
    ]) {
      await page.goto(route);
      await expect(page.locator("html")).toHaveAttribute("lang", locale);
      await expect(page.locator("h1")).toBeVisible();
      await expect(page.locator("header").first()).toBeVisible();
      if (route !== "/admin") {
        await expect(
          page.getByRole("link", {
            name:
              locale === "th"
                ? "กลับไปหน้าการดูแลระบบ"
                : "Back to administration",
          }),
        ).toBeVisible();
      }
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
        .analyze();
      expect(results.violations).toEqual([]);
    }
  });
}
