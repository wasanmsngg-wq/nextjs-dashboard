import AxeBuilder from "@axe-core/playwright";
import { createClient } from "@supabase/supabase-js";
import { expect, test, type Page } from "@playwright/test";
import { execFileSync } from "node:child_process";

const localSupabaseUrl = "http://127.0.0.1:54321";
const localServiceRoleKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU";
const userId = "76000000-0000-4000-8000-000000000001";
const exerciseId = "76000000-0000-4000-8000-000000000002";
const bodyweightExerciseId = "76000000-0000-4000-8000-000000000003";
const email = "performance-browser@example.test";
const password = "performance-browser-password";

const admin = createClient(localSupabaseUrl, localServiceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

function runSql(sql: string) {
  execFileSync(
    "docker",
    [
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
      sql,
    ],
    { stdio: "pipe" },
  );
}

async function removeFixture() {
  runSql(`delete from auth.users where id='${userId}' or email='${email}'`);
}

async function login(page: Page) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Log in" }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
}

async function expectAccessibleResponsivePage(page: Page) {
  await page.waitForLoadState("networkidle");
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

async function navigateAfterLocaleRefresh(page: Page, url: string) {
  try {
    await page.goto(url);
  } catch (error) {
    if (
      !(error instanceof Error) ||
      !/interrupted by another navigation|NS_BINDING_ABORTED/.test(
        error.message,
      )
    ) {
      throw error;
    }
    await page.waitForLoadState("load");
  }
}

test.describe.configure({ mode: "serial" });

test.beforeAll(async () => {
  await removeFixture();
  const { error } = await admin.auth.admin.createUser({
    id: userId,
    email,
    password,
    email_confirm: true,
  });
  if (error) throw error;
  runSql(`
    update public.user_profiles
      set locale='en', timezone='UTC', unit_system='metric'
      where user_id='${userId}';
    insert into public.exercises(
      id,user_id,name,tracking_mode,category,equipment,archived_at
    ) values (
      '${exerciseId}','${userId}','Fixture Squat','reps_load',
      'strength','barbell',now()
    ), (
      '${bodyweightExerciseId}','${userId}','Fixture Push-Up','reps',
      'strength','bodyweight',null
    );
    insert into public.workout_sessions(
      id,user_id,status,template_name_snapshot,started_at,completed_at
    ) values
      ('76000000-0000-4000-8000-000000000010','${userId}','completed',
       'Fixture Early','2026-07-01T01:00:00Z','2026-07-01T02:00:00Z'),
      ('76000000-0000-4000-8000-000000000020','${userId}','completed',
       'Fixture Latest','2026-07-08T01:00:00Z','2026-07-10T05:08:28Z');
    insert into public.workout_session_exercises(
      id,session_id,exercise_id,exercise_name_snapshot,tracking_mode,position,completed
    ) values
      ('76000000-0000-4000-8000-000000000011',
       '76000000-0000-4000-8000-000000000010','${exerciseId}',
       'Fixture Squat','reps_load',0,true),
      ('76000000-0000-4000-8000-000000000021',
       '76000000-0000-4000-8000-000000000020','${exerciseId}',
       'Fixture Squat','reps_load',0,true),
      ('76000000-0000-4000-8000-000000000023',
       '76000000-0000-4000-8000-000000000020','${bodyweightExerciseId}',
       'Fixture Push-Up','reps',1,true);
    insert into public.workout_sets(
      id,session_exercise_id,position,completed,reps,load_grams,elapsed_seconds,rpe,notes
    ) values
      ('76000000-0000-4000-8000-000000000012',
       '76000000-0000-4000-8000-000000000011',0,true,5,100000,60,8,'earliest tie'),
      ('76000000-0000-4000-8000-000000000022',
       '76000000-0000-4000-8000-000000000021',0,true,5,100000,120,8,'later tie'),
      ('76000000-0000-4000-8000-000000000024',
       '76000000-0000-4000-8000-000000000023',0,true,20,null,30,7,'bodyweight work');
  `);
});

test.afterAll(async () => {
  await removeFixture();
});

test("weekly progress is discoverable, equivalent in text, and bilingual", async ({
  page,
}) => {
  await login(page);
  await page.goto("/workouts");
  await page.getByRole("link", { name: "Progress", exact: true }).click();
  await expect(page).toHaveURL(/\/workouts\/progress$/);
  await expect(
    page.getByRole("heading", { name: "Progress", exact: true }),
  ).toBeVisible();

  await page.getByLabel("Time range").selectOption("8");
  await page.getByLabel("Exercise").selectOption(exerciseId);
  await page.getByRole("button", { name: "Apply filters" }).click();
  await expect(page).toHaveURL(
    new RegExp(`/workouts/progress\\?weeks=8&exercise=${exerciseId}$`),
  );
  await expect(
    page.getByText("1000 kg-reps", { exact: true }).first(),
  ).toBeVisible();
  await expect(
    page.getByText("116.67 kg", { exact: true }).first(),
  ).toBeVisible();
  await expect(page.getByText("3 min", { exact: true }).first()).toBeVisible();
  await expect(
    page.getByText("2 workouts", { exact: true }).first(),
  ).toBeVisible();
  await expect(
    page.getByRole("columnheader", { name: "Active days" }),
  ).toBeVisible();
  await expect(
    page.getByRole("columnheader", { name: "Active time" }),
  ).toBeVisible();
  await expect(
    page.getByRole("columnheader", { name: "Bodyweight repetitions" }),
  ).toBeVisible();
  await expect(page.locator("#weekly-progress-table tbody tr")).toHaveCount(8);
  await expect(page.locator("canvas")).toHaveCount(0);
  await expectAccessibleResponsivePage(page);

  await page.getByLabel("Exercise").selectOption("");
  await page.getByRole("button", { name: "Apply filters" }).click();
  await expect(
    page
      .locator("#weekly-progress-table tbody td:last-child")
      .filter({ hasText: /^20$/ }),
  ).toBeVisible();
  await expect(
    page.getByText("Not available", { exact: true }).first(),
  ).toBeVisible();

  const filteredUrl = page.url();
  await page.getByLabel("Time range").selectOption("26");
  await page.getByRole("button", { name: "Apply filters" }).click();
  await expect(page.locator("#weekly-progress-table tbody tr")).toHaveCount(26);

  await page.getByLabel("Time range").selectOption("8");
  await page.getByLabel("Exercise").selectOption({ label: "Cycling" });
  await page.getByRole("button", { name: "Apply filters" }).click();
  await expect(
    page.getByRole("heading", {
      name: "No completed workouts in this range.",
    }),
  ).toBeVisible();
  await page.goto(filteredUrl);

  const thaiRefresh = page.waitForResponse(
    (response) =>
      response.url().includes("/workouts/progress") &&
      response.request().headers().rsc === "1",
  );
  await page.getByLabel("Language").selectOption("th");
  await thaiRefresh;
  await navigateAfterLocaleRefresh(page, filteredUrl);
  await expect(
    page.getByRole("heading", { name: "ความก้าวหน้า", exact: true }),
  ).toBeVisible();

  const englishRefresh = page.waitForResponse(
    (response) =>
      response.url().includes("/workouts/progress") &&
      response.request().headers().rsc === "1",
  );
  await page.getByLabel("ภาษา").selectOption("en");
  await englishRefresh;
  await navigateAfterLocaleRefresh(page, filteredUrl);
  await expect(
    page.getByRole("heading", { name: "Progress", exact: true }),
  ).toBeVisible();

  await page.goto("/settings/profile");
  await page.getByLabel("Units").selectOption("us");
  await page.getByRole("button", { name: "Save profile" }).click();
  await expect(page.getByText("Profile saved.")).toBeVisible();
  await page.goto(filteredUrl);
  await expect(
    page.getByText("2204.62 lb-reps", { exact: true }).first(),
  ).toBeVisible();
  await expect(
    page.getByText("257.21 lb", { exact: true }).first(),
  ).toBeVisible();
  await page.goto("/settings/profile");
  await page.getByLabel("Units").selectOption("metric");
  await page.getByRole("button", { name: "Save profile" }).click();
  await expect(page.getByText("Profile saved.")).toBeVisible();
});

test("exercise history presents stable personal bests in both unit systems", async ({
  page,
}) => {
  await login(page);
  await page.goto("/workouts/history");
  await expect(
    page.getByRole("heading", { name: "Fixture Latest" }),
  ).toBeVisible();
  const latestSession = page
    .getByRole("listitem")
    .filter({ has: page.getByRole("heading", { name: "Fixture Latest" }) });
  await expect(
    latestSession.getByText("Active time", { exact: true }),
  ).toBeVisible();
  await expect(latestSession.getByText("2 min", { exact: true })).toBeVisible();
  await page.getByRole("link", { name: "Browse personal bests" }).click();
  await expect(page).toHaveURL(/\/workouts\/history\/exercises$/);
  await expect(
    page.getByRole("heading", { name: "Personal bests" }),
  ).toBeVisible();
  await page
    .getByRole("listitem")
    .filter({ hasText: "Fixture Squat" })
    .getByRole("link", { name: "View personal bests" })
    .click();
  await expect(page).toHaveURL(
    new RegExp(`/workouts/history/exercises/${exerciseId}$`),
  );
  await expect(
    page.getByRole("heading", { name: "Fixture Squat" }),
  ).toBeVisible();
  await expect(
    page.getByText("This exercise is archived.", { exact: false }),
  ).toBeVisible();
  await expect(page.getByText("100 kg", { exact: true })).toBeVisible();
  await expect(page.getByText("116.67 kg", { exact: true })).toBeVisible();
  await expect(page.getByText("5 reps", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("earliest tie", { exact: true })).toBeVisible();
  await expect(
    page.getByRole("columnheader", { name: "Result" }).first(),
  ).toBeVisible();
  await expectAccessibleResponsivePage(page);

  await page.goto("/settings/profile");
  await page.getByLabel("Units").selectOption("us");
  await page.getByRole("button", { name: "Save profile" }).click();
  await expect(page.getByText("Profile saved.")).toBeVisible();
  await page.goto(`/workouts/history/exercises/${exerciseId}`);
  await expect(page.getByText("220.46 lb", { exact: true })).toBeVisible();

  const localeRefresh = page.waitForResponse(
    (response) =>
      response.url().includes(`/workouts/history/exercises/${exerciseId}`) &&
      response.request().headers().rsc === "1",
  );
  await page.getByLabel("Language").selectOption("th");
  await localeRefresh;
  await navigateAfterLocaleRefresh(
    page,
    `/workouts/history/exercises/${exerciseId}`,
  );
  await expect(
    page.getByRole("heading", { name: "สถิติส่วนตัว", exact: true }),
  ).toBeVisible();
  await expectAccessibleResponsivePage(page);
  await page
    .getByRole("link", { name: "กลับไปหน้าประวัติการออกกำลังกาย" })
    .click();
  await expect(page).toHaveURL(/\/workouts\/history$/);
});
