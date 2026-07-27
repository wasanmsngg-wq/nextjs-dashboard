"use client";

import { useState } from "react";
import type { ProfilePreferences } from "@/app/domain";
import { GuestProfileStore } from "@/app/features/profile/data/guest-profile-store";
import { saveRegisteredProfile } from "@/app/features/profile/actions";
import { profileSchema } from "@/app/lib/profile-validation";

export function ProfileForm({
  initial,
  userId,
}: {
  initial: ProfilePreferences;
  userId?: string;
}) {
  const [message, setMessage] = useState("");
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    try {
      if (userId) {
        const result = await saveRegisteredProfile(
          new FormData(event.currentTarget),
        );
        setMessage(result.ok ? "Profile saved." : result.error);
      } else {
        const submittedProfile = profileSchema.parse(
          Object.fromEntries(new FormData(event.currentTarget)),
        );
        await new GuestProfileStore().save(
          { kind: "guest", guestId: "browser" },
          submittedProfile,
        );
        setMessage("Guest profile saved on this browser.");
      }
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "The profile could not be saved.",
      );
    }
  }
  return (
    <form onSubmit={submit} className="max-w-xl space-y-4">
      {!userId ? (
        <p className="rounded-md bg-amber-50 p-3 text-sm">
          Guest data stays on this device and browser. It is not backed up and
          browser cleanup may remove it.
        </p>
      ) : null}
      <label className="block">
        Display name
        <input
          name="displayName"
          maxLength={80}
          className="mt-1 block w-full rounded border p-2"
          defaultValue={initial.displayName}
        />
      </label>
      <label className="block">
        Language
        <select
          name="locale"
          className="mt-1 block w-full rounded border p-2"
          defaultValue={initial.locale}
        >
          <option value="en">English</option>
          <option value="th">ไทย</option>
        </select>
      </label>
      <label className="block">
        Timezone
        <input
          name="timezone"
          className="mt-1 block w-full rounded border p-2"
          defaultValue={initial.timezone}
          required
        />
      </label>
      <label className="block">
        Units
        <select
          name="unitSystem"
          className="mt-1 block w-full rounded border p-2"
          defaultValue={initial.unitSystem}
        >
          <option value="metric">Metric</option>
          <option value="us">US customary</option>
        </select>
      </label>
      <button className="rounded bg-blue-600 px-4 py-2 text-white">
        Save profile
      </button>
      <p aria-live="polite">{message}</p>
    </form>
  );
}
