import type { AppIdentity } from "./identity";

export const locales = ["en", "th"] as const;
export type Locale = (typeof locales)[number];

export const unitSystems = ["metric", "us"] as const;
export type UnitSystem = (typeof unitSystems)[number];

export type ProfilePreferences = {
  displayName: string;
  locale: Locale;
  timezone: string;
  unitSystem: UnitSystem;
};

export interface ProfileStore {
  load(identity: AppIdentity): Promise<ProfilePreferences | null>;
  save(identity: AppIdentity, profile: ProfilePreferences): Promise<void>;
}
