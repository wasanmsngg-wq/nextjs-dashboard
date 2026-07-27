import { describe, expect, it } from "vitest";
import { legacyLocaleCookie, localeCookie } from "../../app/i18n/config";
import { translate } from "../../app/i18n/dictionaries";

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
});
