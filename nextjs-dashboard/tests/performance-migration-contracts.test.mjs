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

test("performance history migration is additive and indexed", () => {
  assert.match(
    migration,
    /create index workout_session_exercises_exercise_session_idx/i,
  );
  assert.match(migration, /\(exercise_id, session_id\)/i);
  assert.doesNotMatch(migration, /drop table|truncate|delete from/i);
});
