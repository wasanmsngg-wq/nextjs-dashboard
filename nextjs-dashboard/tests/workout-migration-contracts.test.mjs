import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import test from "node:test";

const migration = () =>
  readFile(
    join(
      process.cwd(),
      "supabase/migrations/20260730090000_workout_planning.sql",
    ),
    "utf8",
  );
const experienceMigration = () =>
  readFile(
    join(
      process.cwd(),
      "supabase/migrations/20260730110000_workout_experience.sql",
    ),
    "utf8",
  );

test("workout migration enables RLS for every workout relation", async () => {
  const sql = await migration();
  for (const table of [
    "exercises",
    "workout_templates",
    "workout_template_exercises",
    "workout_template_sets",
    "workout_sessions",
    "workout_session_exercises",
    "workout_sets",
    "workout_mutations",
  ])
    assert.match(
      sql,
      new RegExp(
        `alter table public\\.${table} enable row level security`,
        "i",
      ),
    );
});

test("workout migration enforces ownership, one active session, and immutable completion", async () => {
  const sql = await migration();
  assert.match(sql, /one_active_workout_per_user/i);
  assert.match(sql, /reject_completed_session_mutation/i);
  assert.match(sql, /user_id = \(select auth\.uid\(\)\)/i);
  assert.match(sql, /security invoker/i);
  assert.doesNotMatch(sql, /service_role/i);
});

test("workout writes are transactional and retry-safe", async () => {
  const sql = await migration();
  assert.match(sql, /function public\.save_workout_template/i);
  assert.match(sql, /function public\.save_workout_set/i);
  assert.match(sql, /primary key \(user_id, mutation_id\)/i);
  assert.match(sql, /workout version conflict/i);
  assert.match(sql, /function public\.complete_workout/i);
});

test("the system library contains exactly twelve bilingual exercises", async () => {
  const sql = await migration();
  const keys = [
    "squat",
    "bench-press",
    "deadlift",
    "overhead-press",
    "barbell-row",
    "pull-up",
    "push-up",
    "lunge",
    "plank",
    "running",
    "cycling",
    "walking",
  ];
  for (const key of keys) assert.match(sql, new RegExp(`'${key}'`));
  assert.equal(
    [...sql.matchAll(/'20000000-0000-4000-8000-0000000000\d{2}'/g)].length,
    12,
  );
});

test("the corrective migration constrains guided exercise categories", async () => {
  const sql = await experienceMigration();
  assert.match(sql, /exercise_category_value/i);
  for (const category of [
    "strength",
    "cardio",
    "mobility",
    "balance",
    "sport",
    "other",
  ])
    assert.match(sql, new RegExp(`'${category}'`));
});

test("workout sets preserve template targets separately from actual results", async () => {
  const sql = await readFile(
    join(
      process.cwd(),
      "supabase",
      "migrations",
      "20260730130000_workout_checklist.sql",
    ),
    "utf8",
  );
  for (const column of [
    "target_reps",
    "target_load_grams",
    "target_duration_seconds",
    "target_distance_meters",
    "target_rpe",
  ]) {
    assert.match(sql, new RegExp(`add column ${column}`, "i"));
  }
  assert.match(sql, /requested_completed and[\s\S]*requested_reps is null/i);
  assert.match(
    sql,
    /function public\.reject_completed_session_mutation\(\)[\s\S]*security definer/i,
  );
});

test("workout exercise outcomes retain cancellations and restrict removal", async () => {
  const sql = await readFile(
    join(
      process.cwd(),
      "supabase",
      "migrations",
      "20260730150000_workout_exercise_outcomes.sql",
    ),
    "utf8",
  );
  for (const contract of [
    "workout_session_exercise_status",
    "cancellation_reason",
    "remove_workout_exercise",
    "cancel_workout_exercise",
    "recorded exercise cannot be removed",
    "se.status = 'active'",
  ])
    assert.match(
      sql,
      new RegExp(contract.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
      `exercise outcome migration must include ${contract}`,
    );
});
