"use client";

import { z } from "zod";
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

export type GuestImportParseResult =
  | { ok: true; envelope: GuestDataEnvelopeV1 }
  | { ok: false; reason: "corrupt" | "unsupported" };

const guestEnvelopeSchema = z.object({
  schemaVersion: z.literal(1),
  exportId: z.string().uuid(),
  exportedAt: z.string().datetime(),
  profile: profileSchema,
});

function validateGuestEnvelope(value: unknown): GuestImportParseResult {
  if (!value || typeof value !== "object" || !("schemaVersion" in value))
    return { ok: false, reason: "corrupt" };
  if ((value as { schemaVersion: unknown }).schemaVersion !== 1)
    return { ok: false, reason: "unsupported" };
  const candidate = guestEnvelopeSchema.safeParse(value);
  return candidate.success
    ? { ok: true, envelope: candidate.data }
    : { ok: false, reason: "corrupt" };
}

export function parseGuestExportJson(raw: string): GuestImportParseResult {
  try {
    return validateGuestEnvelope(JSON.parse(raw));
  } catch {
    return { ok: false, reason: "corrupt" };
  }
}

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

  const parsed = parseGuestExportJson(raw);
  return parsed.ok
    ? { ok: true, envelope: parsed.envelope }
    : { ok: false, reason: parsed.reason };
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
