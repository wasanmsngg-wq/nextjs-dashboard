import type { ProfilePreferences } from "./profile";

export const GUEST_STORAGE_KEY = "exercise-tracker:guest:v1";

export type GuestDataEnvelopeV1 = {
  schemaVersion: 1;
  exportId: string;
  exportedAt: string;
  profile: ProfilePreferences;
};
