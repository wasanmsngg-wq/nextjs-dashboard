"use client";

import { useEffect, useRef, useState } from "react";
import type { ProfilePreferences } from "@/app/domain";
import { GuestProfileStore } from "@/app/features/profile/data/guest-profile-store";
import { saveRegisteredProfile } from "@/app/features/profile/actions";
import { profileSchema } from "@/app/lib/profile-validation";
import { legacyLocaleCookie, localeCookie } from "@/app/i18n/config";
import { useI18n } from "@/app/i18n/provider";

export function ProfileForm({
  initial,
  userId,
  useBrowserDefaults = false,
}: {
  initial: ProfilePreferences;
  userId?: string;
  useBrowserDefaults?: boolean;
}) {
  const { t } = useI18n();
  const [message, setMessage] = useState("");
  const timezoneRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (!useBrowserDefaults || !timezoneRef.current) return;
    const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (
      browserTimezone &&
      profileSchema.shape.timezone.safeParse(browserTimezone).success
    )
      timezoneRef.current.value = browserTimezone;
  }, [useBrowserDefaults]);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    try {
      const formData = new FormData(event.currentTarget);
      if (userId) {
        const result = await saveRegisteredProfile(formData);
        setMessage(result.ok ? t("Profile saved.") : t(result.error));
        if (!result.ok) return;
      } else {
        const submittedProfile = profileSchema.parse(
          Object.fromEntries(formData),
        );
        await new GuestProfileStore().save(
          { kind: "guest", guestId: "browser" },
          submittedProfile,
        );
        setMessage(t("Guest profile saved on this browser."));
      }
      const locale = formData.get("locale");
      if (locale === "en" || locale === "th")
        document.cookie = `${localeCookie}=${locale}; Path=/; Max-Age=31536000; SameSite=Lax`;
      document.cookie = `${legacyLocaleCookie}=; Path=/; Max-Age=0; SameSite=Lax`;
    } catch (error) {
      setMessage(
        error instanceof Error
          ? t(error.message)
          : t("The profile could not be saved."),
      );
    }
  }
  return (
    <form onSubmit={submit} className="max-w-xl space-y-4">
      {!userId ? (
        <p className="rounded-md bg-amber-50 p-3 text-sm">
          {t(
            "Guest data stays on this device and browser. It is not backed up and browser cleanup may remove it.",
          )}
        </p>
      ) : null}
      <label className="block">
        {t("Display name")}
        <input
          name="displayName"
          maxLength={80}
          className="mt-1 block w-full rounded border p-2"
          defaultValue={initial.displayName}
        />
      </label>
      <label className="block">
        {t("Language")}
        <select
          name="locale"
          className="mt-1 block w-full rounded border p-2"
          defaultValue={initial.locale}
        >
          <option value="en">{t("English")}</option>
          <option value="th">{t("Thai")}</option>
        </select>
      </label>
      <label className="block">
        {t("Timezone")}
        <input
          name="timezone"
          ref={timezoneRef}
          className="mt-1 block w-full rounded border p-2"
          defaultValue={initial.timezone}
          required
        />
      </label>
      <label className="block">
        {t("Units")}
        <select
          name="unitSystem"
          className="mt-1 block w-full rounded border p-2"
          defaultValue={initial.unitSystem}
        >
          <option value="metric">{t("Metric")}</option>
          <option value="us">{t("US customary")}</option>
        </select>
      </label>
      <button className="rounded bg-blue-600 px-4 py-2 text-white">
        {t("Save profile")}
      </button>
      <p aria-live="polite">{message}</p>
    </form>
  );
}
