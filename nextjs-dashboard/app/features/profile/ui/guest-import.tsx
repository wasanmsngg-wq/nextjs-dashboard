"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { GUEST_STORAGE_KEY, type GuestDataEnvelopeV1 } from "@/app/domain";
import {
  parseGuestExportJson,
  readGuestEnvelope,
} from "@/app/features/profile/data/guest-profile-store";
import { importGuestProfile } from "@/app/features/profile/import-actions";
import { useI18n } from "@/app/i18n/provider";

export function GuestImport({ canImport }: { canImport: boolean }) {
  const { t } = useI18n();
  const [envelope, setEnvelope] = useState<GuestDataEnvelopeV1 | null>(null);
  const [pendingEnvelope, setPendingEnvelope] =
    useState<GuestDataEnvelopeV1 | null>(null);
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const reviewedEnvelope = pendingEnvelope ?? envelope;
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const initial = readGuestEnvelope(window.localStorage);
      setEnvelope(initial.ok ? initial.envelope : null);
      setMessage(
        initial.ok
          ? ""
          : t(
              initial.reason === "corrupt"
                ? "Guest storage is corrupt."
                : initial.reason === "unsupported"
                  ? "Guest storage is unsupported."
                  : "Guest storage is unavailable.",
            ),
      );
    }, 0);
    return () => window.clearTimeout(timer);
  }, [t]);
  function clear() {
    try {
      localStorage.removeItem(GUEST_STORAGE_KEY);
      setEnvelope(null);
      setPendingEnvelope(null);
      setMessage(t("Guest data cleared from this browser."));
    } catch {
      setMessage(
        t("Guest data could not be cleared because storage is unavailable."),
      );
    }
  }
  async function chooseFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      const parsed = parseGuestExportJson(await file.text());
      if (!parsed.ok) {
        setPendingEnvelope(null);
        setMessage(
          parsed.reason === "unsupported"
            ? t("This guest export version is not supported.")
            : t("The selected file is not a valid guest export."),
        );
        return;
      }
      setPendingEnvelope(parsed.envelope);
      setMessage(
        t(
          "Review the selected preferences. Existing browser data has not changed.",
        ),
      );
    } catch {
      setPendingEnvelope(null);
      setMessage(t("The selected guest export could not be read."));
    }
  }
  function download() {
    if (!reviewedEnvelope) return;
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(reviewedEnvelope, null, 2)], {
        type: "application/json",
      }),
    );
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `exercise-tracker-guest-${reviewedEnvelope.exportId}.json`;
    document.body.appendChild(anchor);
    setMessage(t("Guest export downloaded."));
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  }
  async function confirmImport() {
    if (!reviewedEnvelope) return;
    if (!canImport) {
      try {
        localStorage.setItem(
          GUEST_STORAGE_KEY,
          JSON.stringify(reviewedEnvelope),
        );
        setEnvelope(reviewedEnvelope);
        setPendingEnvelope(null);
        setMessage(t("Guest export imported into this browser."));
      } catch {
        setMessage(
          t(
            "Guest data could not be saved. Browser storage may be unavailable or full.",
          ),
        );
      }
      return;
    }
    const result = await importGuestProfile(reviewedEnvelope);
    if (!result.ok) return setMessage(t(result.error));
    const shouldClearBrowserData =
      !pendingEnvelope || envelope?.exportId === pendingEnvelope.exportId;
    try {
      if (shouldClearBrowserData) localStorage.removeItem(GUEST_STORAGE_KEY);
    } catch {
      return setMessage(
        t(
          "Profile imported, but guest data could not be cleared from this browser.",
        ),
      );
    }
    if (shouldClearBrowserData) setEnvelope(null);
    setPendingEnvelope(null);
    setMessage(
      result.alreadyImported
        ? t("This export was already imported.")
        : t("Guest profile imported successfully."),
    );
  }
  return (
    <section className="max-w-xl space-y-4">
      <p>
        {t(
          "Guest data is device/browser-specific, is not backed up, and may be cleared by the browser.",
        )}
      </p>
      <label className="block">
        {t("Import a guest JSON export")}
        <input
          type="file"
          accept="application/json,.json"
          onChange={chooseFile}
          className="mt-1 block w-full"
        />
      </label>
      {reviewedEnvelope ? (
        <div className="rounded border p-4">
          <h2 className="font-semibold">
            {pendingEnvelope
              ? t("Review selected preferences")
              : t("Review preferences")}
          </h2>
          <dl>
            <dt>{t("Display name")}</dt>
            <dd>{reviewedEnvelope.profile.displayName || t("Not set")}</dd>
            <dt>{t("Language")}</dt>
            <dd>{reviewedEnvelope.profile.locale}</dd>
            <dt>{t("Timezone")}</dt>
            <dd>{reviewedEnvelope.profile.timezone}</dd>
            <dt>{t("Units")}</dt>
            <dd>{reviewedEnvelope.profile.unitSystem}</dd>
          </dl>
        </div>
      ) : (
        <p>{t("No guest profile found.")}</p>
      )}
      <div className="flex flex-wrap gap-3">
        {reviewedEnvelope ? (
          <>
            <button
              type="button"
              onClick={download}
              className="rounded border px-4 py-2"
            >
              {t("Export JSON")}
            </button>
            {canImport || pendingEnvelope ? (
              <button
                type="button"
                onClick={() => startTransition(confirmImport)}
                disabled={isPending}
                className="rounded bg-blue-600 px-4 py-2 text-white"
              >
                {isPending ? t("Importing…") : t("Confirm import")}
              </button>
            ) : null}
            <button
              type="button"
              onClick={clear}
              disabled={isPending}
              className="rounded border border-red-600 px-4 py-2 text-red-700"
            >
              {t("Clear guest data")}
            </button>
          </>
        ) : null}
        <Link
          href="/dashboard"
          className="rounded border border-blue-600 px-4 py-2 text-blue-700"
        >
          {t("Continue to dashboard")}
        </Link>
      </div>
      <p aria-live="polite">{message}</p>
    </section>
  );
}
