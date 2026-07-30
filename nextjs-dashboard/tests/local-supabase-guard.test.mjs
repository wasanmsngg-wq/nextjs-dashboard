import assert from "node:assert/strict";
import test from "node:test";

const localHosts = new Set(["127.0.0.1", "localhost", "::1"]);

function assertLocalSupabaseUrl(value, name) {
  if (!value) return;
  const parsed = new URL(value);
  assert.ok(
    localHosts.has(parsed.hostname),
    `${name} must target disposable local Supabase, received ${parsed.hostname}`,
  );
}

test("integration-test database configuration cannot target a remote project", () => {
  for (const name of [
    "SUPABASE_DB_URL",
    "DATABASE_URL",
    "NEXT_PUBLIC_SUPABASE_URL",
  ]) {
    assertLocalSupabaseUrl(process.env[name], name);
  }
});
