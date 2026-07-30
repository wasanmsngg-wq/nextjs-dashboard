"use client";

import Link from "next/link";
import { useI18n } from "@/app/i18n/provider";

export default function WorkoutsError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useI18n();
  return (
    <main className="mx-auto max-w-xl rounded-2xl border border-red-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-wide text-red-700">
        {t("Unable to load workouts")}
      </p>
      <h1 className="mt-2 text-2xl font-bold text-gray-950">
        {t("Your workout data is temporarily unavailable.")}
      </h1>
      <p className="mt-2 text-gray-600">
        {t(
          "Try again. If the problem continues, check the staging connection.",
        )}
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <button
          className="rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700"
          onClick={reset}
        >
          {t("Try again")}
        </button>
        <Link
          className="rounded-xl border px-4 py-3 font-semibold"
          href="/dashboard"
        >
          {t("Back to dashboard")}
        </Link>
      </div>
    </main>
  );
}
