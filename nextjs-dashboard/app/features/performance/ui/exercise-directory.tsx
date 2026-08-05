import { TrophyIcon } from "@heroicons/react/24/outline";
import { ButtonLink } from "@/app/ui/atoms/button";
import { EmptyState } from "@/app/ui/atoms/empty-state";
import { Surface } from "@/app/ui/atoms/surface";
import { BackNavigation } from "@/app/ui/molecules/back-navigation";
import { PageHeading } from "@/app/ui/molecules/page-heading";

type Translation = (key: string) => string;

export function ExerciseDirectory({
  exercises,
  t,
}: {
  exercises: Array<{ id: string; name: string; archived: boolean }>;
  t: Translation;
}) {
  return (
    <main className="mx-auto max-w-6xl space-y-6">
      <BackNavigation href="/workouts/history">
        {t("Back to workout history")}
      </BackNavigation>
      <PageHeading
        eyebrow={t("Performance")}
        title={t("Personal bests")}
        description={t(
          "Choose an exercise to see its records, completed sets, and personal bests.",
        )}
      />

      {exercises.length ? (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {exercises.map((exercise) => (
            <Surface as="li" key={exercise.id} className="flex flex-col gap-4">
              <div className="flex items-start gap-3">
                <TrophyIcon
                  aria-hidden="true"
                  className="h-6 w-6 shrink-0 text-blue-700"
                />
                <div className="min-w-0 grow">
                  <h2 className="break-words font-bold text-slate-950">
                    {exercise.name}
                  </h2>
                  {exercise.archived ? (
                    <p className="mt-1 text-sm text-slate-600">
                      {t("Archived")}
                    </p>
                  ) : null}
                </div>
              </div>
              <ButtonLink
                className="mt-auto self-start"
                href={`/workouts/history/exercises/${exercise.id}`}
                variant="secondary"
              >
                {t("View personal bests")}
              </ButtonLink>
            </Surface>
          ))}
        </ul>
      ) : (
        <Surface padding="none">
          <EmptyState
            title={t("No exercises available yet.")}
            description={t(
              "Add an exercise and complete a workout to begin tracking personal bests.",
            )}
            action={
              <ButtonLink href="/workouts/exercises">
                {t("Go to exercise library")}
              </ButtonLink>
            }
          />
        </Surface>
      )}
    </main>
  );
}
