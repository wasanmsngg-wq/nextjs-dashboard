"use client";

import { useI18n } from "@/app/i18n/provider";
import { SkeletonBlock } from "@/app/ui/atoms/skeleton-block";

export function RouteTransitionLoading() {
  const { t } = useI18n();

  return (
    <section
      className="mx-auto max-w-7xl space-y-6"
      aria-busy="true"
      aria-label={t("Loading next page")}
      data-testid="route-transition-loading"
    >
      <p
        className="text-sm font-semibold text-blue-700"
        role="status"
        aria-live="polite"
      >
        {t("Loading next page")}
      </p>
      <SkeletonBlock className="h-10 w-64 max-w-full" />
      <SkeletonBlock className="h-20 w-full" />
      <div className="grid gap-4 md:grid-cols-2">
        <SkeletonBlock className="h-48 w-full" />
        <SkeletonBlock className="h-48 w-full" />
      </div>
    </section>
  );
}
