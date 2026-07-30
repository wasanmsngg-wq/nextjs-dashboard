import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { legacyLocaleCookie, localeCookie } from "../../app/i18n/config";
import { hasTranslation, translate } from "../../app/i18n/dictionaries";

function sourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory()
      ? sourceFiles(path)
      : /\.(?:ts|tsx)$/.test(entry.name)
        ? [path]
        : [];
  });
}

describe("Phase 1 localization", () => {
  it("keeps English source messages and provides readable Thai translations", () => {
    expect(translate("en", "Create account")).toBe("Create account");
    expect(translate("th", "Create account")).toBe("สร้างบัญชี");
    expect(translate("th", "Profile settings")).toBe("การตั้งค่าโปรไฟล์");
    expect(translate("th", "Loading...")).toBe("กำลังโหลด...");
    expect(translate("th", "{name}'s profile picture", { name: "มาลี" })).toBe(
      "รูปโปรไฟล์ของ มาลี",
    );
  });

  it("uses the product cookie while retaining the legacy cookie name for migration", () => {
    expect(localeCookie).toBe("exercise_tracker_locale");
    expect(legacyLocaleCookie).toBe("acme_locale");
  });

  it("provides Thai translations for every literal application message", () => {
    const keys = new Set<string>();
    for (const file of sourceFiles(join(process.cwd(), "app"))) {
      const source = readFileSync(file, "utf8");
      for (const pattern of [
        /\bt\(\s*"((?:[^"\\]|\\.)*)"/g,
        /\bt\(\s*'((?:[^'\\]|\\.)*)'/g,
      ]) {
        for (const match of source.matchAll(pattern)) keys.add(match[1]);
      }
    }

    expect(
      [...keys].filter((key) => !hasTranslation("th", key)).sort(),
    ).toEqual([]);
  });
});
