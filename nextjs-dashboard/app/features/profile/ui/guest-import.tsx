"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { GUEST_STORAGE_KEY, type GuestDataEnvelopeV1 } from "@/app/domain";
import { readGuestEnvelope } from "@/app/features/profile/data/guest-profile-store";
import { importGuestProfile } from "@/app/features/profile/import-actions";

export function GuestImport({ canImport }: { canImport: boolean }) {
  const [envelope, setEnvelope] = useState<GuestDataEnvelopeV1 | null>(null);
  const [message, setMessage] = useState("");
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const initial = readGuestEnvelope(window.localStorage);
      setEnvelope(initial.ok ? initial.envelope : null);
      setMessage(initial.ok ? "" : `Guest storage is ${initial.reason}.`);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);
  function clear() {
    try {
      localStorage.removeItem(GUEST_STORAGE_KEY);
      setEnvelope(null);
      setMessage("Guest data cleared from this browser.");
    } catch {
      setMessage(
        "Guest data could not be cleared because storage is unavailable.",
      );
    }
  }
  function download() {
    if (!envelope) return;
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(envelope, null, 2)], {
        type: "application/json",
      }),
    );
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `exercise-tracker-guest-${envelope.exportId}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }
  async function confirmImport() {
    if (!envelope || !canImport) return;
    const result = await importGuestProfile(envelope);
    if (!result.ok) return setMessage(result.error);
    try {
      localStorage.removeItem(GUEST_STORAGE_KEY);
    } catch {
      return setMessage(
        "Profile imported, but guest data could not be cleared from this browser.",
      );
    }
    setEnvelope(null);
    setMessage(
      result.alreadyImported
        ? "This export was already imported."
        : "Guest profile imported successfully.",
    );
  }
  return (
    <section className="max-w-xl space-y-4">
      <p>
        Guest data is device/browser-specific, is not backed up, and may be
        cleared by the browser.
      </p>
      {envelope ? (
        <div className="rounded border p-4">
          <h2 className="font-semibold">Review preferences</h2>
          <dl>
            <dt>Display name</dt>
            <dd>{envelope.profile.displayName || "Not set"}</dd>
            <dt>Language</dt>
            <dd>{envelope.profile.locale}</dd>
            <dt>Timezone</dt>
            <dd>{envelope.profile.timezone}</dd>
            <dt>Units</dt>
            <dd>{envelope.profile.unitSystem}</dd>
          </dl>
        </div>
      ) : (
        <p>No guest profile found.</p>
      )}
      <div className="flex flex-wrap gap-3">
        {envelope ? (
          <>
            <button onClick={download} className="rounded border px-4 py-2">
              Export JSON
            </button>
            {canImport ? (
              <button
                onClick={confirmImport}
                className="rounded bg-blue-600 px-4 py-2 text-white"
              >
                Confirm import
              </button>
            ) : null}
            <button
              onClick={clear}
              className="rounded border border-red-600 px-4 py-2 text-red-700"
            >
              Clear guest data
            </button>
          </>
        ) : null}
        <Link
          href="/dashboard"
          className="rounded border border-blue-600 px-4 py-2 text-blue-700"
        >
          Continue to dashboard
        </Link>
      </div>
      <p aria-live="polite">{message}</p>
    </section>
  );
}
