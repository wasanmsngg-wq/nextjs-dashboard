// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { GUEST_STORAGE_KEY } from "@/app/domain";
import {
  GuestProfileStore,
  readGuestEnvelope,
} from "@/app/features/profile/data/guest-profile-store";

describe("guest profile storage", () => {
  it("uses only the versioned key and round trips a profile", async () => {
    const values = new Map<string, string>();
    const storage = {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
    };
    const store = new GuestProfileStore(storage);
    await store.save(
      { kind: "guest", guestId: "browser" },
      {
        displayName: "Guest",
        locale: "th",
        timezone: "Asia/Bangkok",
        unitSystem: "metric",
      },
    );
    expect([...values.keys()]).toEqual([GUEST_STORAGE_KEY]);
    await expect(
      store.load({ kind: "guest", guestId: "browser" }),
    ).resolves.toMatchObject({ displayName: "Guest" });
  });

  it("detects corrupt and unsupported envelopes", () => {
    expect(readGuestEnvelope({ getItem: () => "{" })).toEqual({
      ok: false,
      reason: "corrupt",
    });
    expect(readGuestEnvelope({ getItem: () => '{"schemaVersion":2}' })).toEqual(
      { ok: false, reason: "unsupported" },
    );
  });

  it("reports quota failures without losing the contract", async () => {
    const store = new GuestProfileStore({
      getItem: () => null,
      setItem: () => {
        throw new DOMException("full", "QuotaExceededError");
      },
    });
    await expect(
      store.save(
        { kind: "guest", guestId: "browser" },
        {
          displayName: "",
          locale: "en",
          timezone: "UTC",
          unitSystem: "metric",
        },
      ),
    ).rejects.toThrow("unavailable or full");
  });
});
