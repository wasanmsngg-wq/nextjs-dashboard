import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const migration = readFileSync(
  new URL(
    "../supabase/migrations/20260805110000_performance_history.sql",
    import.meta.url,
  ),
  "utf8",
);
const exercisePerformanceMigration = readFileSync(
  new URL(
    "../supabase/migrations/20260805130000_exercise_performance.sql",
    import.meta.url,
  ),
  "utf8",
);

test("performance history migration is additive and indexed", () => {
  assert.match(
    migration,
    /create index workout_session_exercises_exercise_session_idx/i,
  );
  assert.match(migration, /\(exercise_id, session_id\)/i);
  assert.doesNotMatch(migration, /drop table|truncate|delete from/i);
});

test("exercise performance views preserve RLS and version-one formulas", () => {
  assert.match(exercisePerformanceMigration, /security_invoker\s*=\s*true/gi);
  assert.match(exercisePerformanceMigration, /s\.status\s*=\s*'completed'/i);
  assert.match(exercisePerformanceMigration, /se\.status\s*<>\s*'canceled'/i);
  assert.match(exercisePerformanceMigration, /ws\.completed/i);
  assert.match(
    exercisePerformanceMigration,
    /ws\.load_grams \* \(1 \+ ws\.reps \/ 30\.0\)/i,
  );
  assert.match(
    exercisePerformanceMigration,
    /ws\.duration_seconds::numeric \/ ws\.distance_meters/i,
  );
  assert.doesNotMatch(
    exercisePerformanceMigration,
    /drop table|truncate|delete from/i,
  );
});
