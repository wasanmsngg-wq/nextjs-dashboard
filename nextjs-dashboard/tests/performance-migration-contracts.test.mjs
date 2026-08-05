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
const aggregateMigration = readFileSync(
  new URL(
    "../supabase/migrations/20260805150000_performance_aggregates.sql",
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

test("weekly aggregates preserve ownership, timezone, and formula contracts", () => {
  assert.match(aggregateMigration, /security invoker/i);
  assert.match(aggregateMigration, /s\.user_id\s*=\s*auth\.uid\(\)/i);
  assert.match(aggregateMigration, /at time zone p\.timezone/i);
  assert.match(aggregateMigration, /coalesce[\s\S]*'UTC'/i);
  assert.match(aggregateMigration, /count\(distinct local_date\)/i);
  assert.match(
    aggregateMigration,
    /ws\.reps::bigint \* ws\.load_grams::bigint/i,
  );
  assert.match(
    aggregateMigration,
    /ws\.load_grams \* \(1 \+ ws\.reps \/ 30\.0\)/i,
  );
  assert.match(aggregateMigration, /se\.status\s*<>\s*'canceled'/i);
  assert.match(aggregateMigration, /se\.tracking_mode\s*=\s*'reps'/i);
  assert.match(aggregateMigration, /and ws\.completed/i);
  assert.match(aggregateMigration, /grant execute[\s\S]*to authenticated/i);
  assert.doesNotMatch(aggregateMigration, /drop table|truncate|delete from/i);
});
