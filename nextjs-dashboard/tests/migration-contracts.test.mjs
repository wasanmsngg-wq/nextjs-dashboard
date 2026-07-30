import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import test from "node:test";

async function foundationMigration() {
  const directory = join(process.cwd(), "supabase", "migrations");
  const migrations = (await readdir(directory))
    .filter((name) => /^\d{14}_.+\.sql$/.test(name))
    .sort();
  assert.ok(migrations.length > 0, "a timestamped migration is required");
  return readFile(join(directory, migrations.at(-1)), "utf8");
}

test("migration removes the legacy password table and enables RLS everywhere", async () => {
  const sql = await foundationMigration();

  assert.match(sql, /drop table if exists public\.users\s*;/i);
  for (const table of [
    "user_profiles",
    "admins",
    "guest_imports",
    "customers",
    "revenue",
  ]) {
    assert.match(
      sql,
      new RegExp(
        `alter table public\\.${table} enable row level security`,
        "i",
      ),
      `${table} must have RLS enabled`,
    );
  }
});

test("migration constrains profiles and guest import idempotency", async () => {
  const sql = await foundationMigration();

  assert.match(sql, /locale in \('en', 'th'\)/i);
  assert.match(sql, /unit_system in \('metric', 'us'\)/i);
  assert.match(sql, /char_length\(display_name\) <= 80/i);
  assert.match(sql, /primary key \(user_id, export_id\)/i);
  assert.match(sql, /before update on public\.user_profiles/i);
});

test("users can mutate only their own profile and cannot mutate admin roles", async () => {
  const sql = await foundationMigration();

  for (const operation of ["select", "insert", "update", "delete"]) {
    assert.match(
      sql,
      new RegExp(`profiles_${operation}_own`, "i"),
      `own-profile ${operation} policy is required`,
    );
  }
  assert.doesNotMatch(
    sql,
    /create policy[\s\S]{0,160}on public\.admins for (?:insert|update|delete|all)/i,
  );
  assert.match(sql, /grant select on table public\.admins to authenticated/i);
  assert.doesNotMatch(
    sql,
    /grant (?:insert|update|delete|all)[^;]*public\.admins to authenticated/i,
  );
});

test("customers and revenue require server-confirmed admin membership", async () => {
  const sql = await foundationMigration();

  assert.match(sql, /where user_id = \(select auth\.uid\(\)\)/i);
  for (const table of ["customers", "revenue"]) {
    assert.match(
      sql,
      new RegExp(
        `create policy ["']?${table}_admin_all["']?[\\s\\S]*?on public\\.${table}[\\s\\S]*?public\\.is_admin\\(\\)`,
        "i",
      ),
    );
    assert.match(
      sql,
      new RegExp(`revoke all on table public\\.${table} from anon`, "i"),
    );
  }
});

test("readiness RPC is minimal and callable without privileged credentials", async () => {
  const sql = await foundationMigration();

  assert.match(sql, /function public\.health_check\(\)/i);
  assert.match(sql, /jsonb_build_object\('status', 'ok'\)/i);
  assert.match(
    sql,
    /grant execute on function public\.health_check\(\) to anon, authenticated/i,
  );
});

test("seed data is visibly synthetic and contains no administrator bootstrap", async () => {
  const seed = await readFile(
    join(process.cwd(), "supabase", "seed.sql"),
    "utf8",
  );

  assert.match(seed, /Synthetic local-development data only/i);
  assert.match(seed, /@example\.test\b/i);
  assert.doesNotMatch(seed, /insert into public\.admins/i);
});
