import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import test from "node:test";

async function files(root) {
  const entries = await readdir(root, { withFileTypes: true });
  return (
    await Promise.all(
      entries.map((entry) =>
        entry.isDirectory()
          ? files(join(root, entry.name))
          : [join(root, entry.name)],
      ),
    )
  ).flat();
}

test("shared layers do not import database, actions, or server data modules", async () => {
  for (const layer of ["atoms", "molecules", "organisms", "templates"]) {
    for (const file of await files(join(process.cwd(), "app", "ui", layer))) {
      const source = await readFile(file, "utf8");
      assert.doesNotMatch(
        source,
        /app\/lib\/(?:db|data|support\/data|support\/actions)/,
        `${file} crosses the shared-layer boundary`,
      );
    }
  }
});

test("feature UI consumes project components instead of Ant Design directly", async () => {
  const featureRoot = join(process.cwd(), "app", "features");
  for (const file of (await files(featureRoot)).filter(
    (name) => name.endsWith(".ts") || name.endsWith(".tsx"),
  )) {
    const source = await readFile(file, "utf8");
    assert.doesNotMatch(
      source,
      /from\s+["']antd(?:\/[^"']*)?["']/,
      `${file} must use app/ui primitives instead of importing Ant Design`,
    );
  }
});

test("product UI uses shared dialogs instead of browser prompts", async () => {
  const featureRoot = join(process.cwd(), "app", "features");
  for (const file of (await files(featureRoot)).filter(
    (name) => name.endsWith(".ts") || name.endsWith(".tsx"),
  )) {
    const source = await readFile(file, "utf8");
    assert.doesNotMatch(
      source,
      /\b(?:window\.)?(?:alert|confirm|prompt)\s*\(/,
      `${file} must use the shared Dialog or Toast component`,
    );
  }
});

test("every user-facing page has a loading boundary", async () => {
  const app = join(process.cwd(), "app");
  for (const file of (await files(app)).filter((name) =>
    name.endsWith("page.tsx"),
  )) {
    const loading = join(file.slice(0, -"page.tsx".length), "loading.tsx");
    const all = await files(app);
    assert.ok(all.includes(loading), `${file} is missing loading.tsx`);
  }
});
