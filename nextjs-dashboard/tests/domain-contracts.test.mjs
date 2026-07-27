import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import test from "node:test";

const domainRoot = join(process.cwd(), "app", "domain");

test("guest storage contract remains explicitly versioned", async () => {
  const source = await readFile(join(domainRoot, "guest-data.ts"), "utf8");

  assert.match(
    source,
    /GUEST_STORAGE_KEY\s*=\s*['"]exercise-tracker:guest:v1['"]/,
  );
  assert.match(source, /schemaVersion:\s*1/);
  assert.match(source, /exportId:\s*string/);
  assert.match(source, /exportedAt:\s*string/);
  assert.match(source, /profile:\s*ProfilePreferences/);
});

test("profile contract exposes only the Phase 1 preference fields", async () => {
  const source = await readFile(join(domainRoot, "profile.ts"), "utf8");
  const match = source.match(
    /export type ProfilePreferences\s*=\s*\{(?<body>[\s\S]*?)\};/,
  );

  assert.ok(match?.groups?.body, "ProfilePreferences must remain declared");
  const fields = [...match.groups.body.matchAll(/^\s*(\w+):/gm)]
    .map((entry) => entry[1])
    .sort();
  assert.deepEqual(fields, ["displayName", "locale", "timezone", "unitSystem"]);
  assert.match(source, /locales\s*=\s*\[['"]en['"],\s*['"]th['"]\]/);
  assert.match(source, /unitSystems\s*=\s*\[['"]metric['"],\s*['"]us['"]\]/);
});

test("domain modules stay framework, persistence, and browser independent", async () => {
  const modules = [
    "guest-data.ts",
    "identity.ts",
    "index.ts",
    "operations.ts",
    "profile.ts",
  ];
  const forbidden =
    /from\s+['"](?:react|next(?:\/[^'"]*)?|@supabase[^'"]*|postgres)['"]|\b(?:window|document|localStorage)\b|\bselect\b|\binsert\b|\bupdate\b|\bdelete\s+from\b/i;

  for (const module of modules) {
    const source = await readFile(join(domainRoot, module), "utf8");
    assert.doesNotMatch(
      source,
      forbidden,
      `${module} crosses a domain boundary`,
    );
  }
});
