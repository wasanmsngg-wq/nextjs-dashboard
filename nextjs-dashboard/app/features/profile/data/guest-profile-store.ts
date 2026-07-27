"use client";

import {
  GUEST_STORAGE_KEY,
  type AppIdentity,
  type GuestDataEnvelopeV1,
  type ProfilePreferences,
  type ProfileStore,
} from "@/app/domain";
import { profileSchema } from "@/app/lib/profile-validation";

export type GuestStorageResult =
  | { ok: true; envelope: GuestDataEnvelopeV1 | null }
  | { ok: false; reason: "unavailable" | "corrupt" | "unsupported" };

export function readGuestEnvelope(
  storage: Pick<Storage, "getItem"> = localStorage,
): GuestStorageResult {
  let raw: string | null;
  try {
    raw = storage.getItem(GUEST_STORAGE_KEY);
  } catch {
    return { ok: false, reason: "unavailable" };
  }
  if (!raw) return { ok: true, envelope: null };

  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    return { ok: false, reason: "corrupt" };
  }

  try {
    if (!value || typeof value !== "object" || !("schemaVersion" in value))
      return { ok: false, reason: "corrupt" };
    if ((value as { schemaVersion: unknown }).schemaVersion !== 1)
      return { ok: false, reason: "unsupported" };
    const candidate = value as GuestDataEnvelopeV1;
    if (
      !candidate.exportId ||
      !candidate.exportedAt ||
      !profileSchema.safeParse(candidate.profile).success
    ) {
      return { ok: false, reason: "corrupt" };
    }
    return { ok: true, envelope: candidate };
  } catch {
    return { ok: false, reason: "corrupt" };
  }
}

export function createGuestEnvelope(
  profile: ProfilePreferences,
): GuestDataEnvelopeV1 {
  return {
    schemaVersion: 1,
    exportId: crypto.randomUUID(),
    exportedAt: new Date().toISOString(),
    profile,
  };
}

export class GuestProfileStore implements ProfileStore {
  constructor(
    private readonly storage: Pick<
      Storage,
      "getItem" | "setItem"
    > = localStorage,
  ) {}
  async load(identity: AppIdentity) {
    if (identity.kind !== "guest")
      throw new Error("GuestProfileStore only accepts guest identities.");
    const result = readGuestEnvelope(this.storage);
    if (!result.ok) throw new Error(`Guest storage is ${result.reason}.`);
    return result.envelope?.profile ?? null;
  }
  async save(identity: AppIdentity, profile: ProfilePreferences) {
    if (identity.kind !== "guest")
      throw new Error("GuestProfileStore only accepts guest identities.");
    const parsed = profileSchema.parse(profile);
    try {
      this.storage.setItem(
        GUEST_STORAGE_KEY,
        JSON.stringify(createGuestEnvelope(parsed)),
      );
    } catch {
      throw new Error(
        "Guest data could not be saved. Browser storage may be unavailable or full.",
      );
    }
  }
}
