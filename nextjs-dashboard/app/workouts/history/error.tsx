"use client";

import { useI18n } from "@/app/i18n/provider";
import { Button } from "@/app/ui/atoms/button";
import { Surface } from "@/app/ui/atoms/surface";
import { BackNavigation } from "@/app/ui/molecules/back-navigation";
import { PageHeading } from "@/app/ui/molecules/page-heading";

export default function WorkoutHistoryError({ reset }: { reset: () => void }) {
  const { t } = useI18n();
  return (
    <main className="mx-auto max-w-3xl space-y-6">
      <BackNavigation href="/workouts">{t("Back to workouts")}</BackNavigation>
      <PageHeading
        eyebrow={t("Performance")}
        title={t("Workout history could not be loaded.")}
        description={t(
          "Try again in a moment. Your workout data is unchanged.",
        )}
      />
      <Surface>
        <Button onClick={reset}>{t("Try again")}</Button>
      </Surface>
    </main>
  );
}
