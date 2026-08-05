import { CalendarDaysIcon } from "@heroicons/react/24/outline";
import { type Locale, type UnitSystem } from "@/app/domain";
import { Button, ButtonLink } from "@/app/ui/atoms/button";
import { EmptyState } from "@/app/ui/atoms/empty-state";
import { Input, Select } from "@/app/ui/atoms/form-control";
import { Surface } from "@/app/ui/atoms/surface";
import { BackNavigation } from "@/app/ui/molecules/back-navigation";
import { PageHeading } from "@/app/ui/molecules/page-heading";

type Translation = (
  key: string,
  values?: Record<string, string | number>,
) => string;

type HistoryResult = {
  sessions: Array<{
    id: string;
    template_name_snapshot: string | null;
    notes: string;
    started_at: string;
    completed_at: string | null;
    durationSeconds: number | null;
    completedSets: number;
    totalSets: number;
    exercises: Array<{
      id: string;
      exercise_id: string | null;
      exercise_name_snapshot: string;
      status: "active" | "canceled";
      completed: boolean;
      completedSets: number;
      totalSets: number;
    }>;
  }>;
  exercises: Array<{ id: string; name: string; archived: boolean }>;
  timezone: string;
  unitSystem: UnitSystem;
  page: number;
  total: number;
  pageCount: number;
};

export function SessionHistory({
  result,
  filters,
  filterError,
  locale,
  t,
}: {
  result: HistoryResult;
  filters: {
    from?: string;
    to?: string;
    exerciseId?: string;
    page: number;
  };
  filterError: string | null;
  locale: Locale;
  t: Translation;
}) {
  const dateFormatter = new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: result.timezone,
  });
  const pageHref = (page: number) => {
    const query = new URLSearchParams();
    if (filters.from) query.set("from", filters.from);
    if (filters.to) query.set("to", filters.to);
    if (filters.exerciseId) query.set("exercise", filters.exerciseId);
    if (page > 1) query.set("page", String(page));
    return `/workouts/history${query.size ? `?${query}` : ""}`;
  };

  return (
    <main className="mx-auto max-w-6xl space-y-6">
      <BackNavigation href="/workouts">{t("Back to workouts")}</BackNavigation>
      <PageHeading
        eyebrow={t("Performance")}
        title={t("Workout history")}
        description={t(
          "Review completed workouts and filter them by date or exercise.",
        )}
      />

      <Surface as="section" aria-labelledby="history-filters-heading">
        <h2
          id="history-filters-heading"
          className="text-lg font-bold text-slate-950"
        >
          {t("Filter history")}
        </h2>
        <form
          className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4"
          method="get"
        >
          <label className="space-y-1 text-sm font-semibold text-slate-800">
            <span>{t("From date")}</span>
            <Input type="date" name="from" defaultValue={filters.from} />
          </label>
          <label className="space-y-1 text-sm font-semibold text-slate-800">
            <span>{t("To date")}</span>
            <Input type="date" name="to" defaultValue={filters.to} />
          </label>
          <label className="space-y-1 text-sm font-semibold text-slate-800">
            <span>{t("Exercise")}</span>
            <Select name="exercise" defaultValue={filters.exerciseId ?? ""}>
              <option value="">{t("All exercises")}</option>
              {result.exercises.map((exercise) => (
                <option key={exercise.id} value={exercise.id}>
                  {exercise.name}
                  {exercise.archived ? ` (${t("Archived")})` : ""}
                </option>
              ))}
            </Select>
          </label>
          <div className="flex items-end gap-2">
            <Button htmlType="submit">{t("Apply filters")}</Button>
            <ButtonLink href="/workouts/history" variant="secondary">
              {t("Clear")}
            </ButtonLink>
          </div>
        </form>
        {filterError ? (
          <p className="mt-3 text-sm font-semibold text-red-700" role="alert">
            {t(filterError)}
          </p>
        ) : null}
        <p className="mt-3 text-sm text-slate-600">
          {t("Dates use your saved timezone: {timezone}.", {
            timezone: result.timezone,
          })}
        </p>
      </Surface>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-slate-950">
          {t("Completed sessions")}
        </h2>
        <p className="text-sm text-slate-600">
          {t("{count} workouts found", { count: result.total })}
        </p>
      </div>

      {result.sessions.length ? (
        <ol className="grid gap-4" aria-label={t("Completed sessions")}>
          {result.sessions.map((session) => (
            <Surface as="li" key={session.id} className="space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold text-slate-950">
                    {session.template_name_snapshot || t("Empty workout")}
                  </h3>
                  <p className="mt-1 flex items-center gap-2 text-sm text-slate-600">
                    <CalendarDaysIcon className="h-4 w-4" aria-hidden="true" />
                    <time dateTime={session.started_at}>
                      {dateFormatter.format(new Date(session.started_at))}
                    </time>
                  </p>
                </div>
                <ButtonLink
                  href={`/workouts/sessions/${session.id}`}
                  variant="secondary"
                >
                  {t("View workout")}
                </ButtonLink>
              </div>
              <dl className="grid gap-3 text-sm sm:grid-cols-3">
                <div>
                  <dt className="font-semibold text-slate-950">
                    {t("Duration")}
                  </dt>
                  <dd className="text-slate-600">
                    {formatDuration(session.durationSeconds, t)}
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-slate-950">
                    {t("Exercises")}
                  </dt>
                  <dd className="text-slate-600">{session.exercises.length}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-slate-950">
                    {t("Completed sets")}
                  </dt>
                  <dd className="text-slate-600">
                    {t("{completed} of {total}", {
                      completed: session.completedSets,
                      total: session.totalSets,
                    })}
                  </dd>
                </div>
              </dl>
              <ul
                className="flex flex-wrap gap-2"
                aria-label={t("Exercises in workout")}
              >
                {session.exercises.map((exercise) => (
                  <li key={exercise.id}>
                    {exercise.exercise_id ? (
                      <ButtonLink
                        href={`/workouts/history/exercises/${exercise.exercise_id}`}
                        size="small"
                        variant="quiet"
                      >
                        {exercise.exercise_name_snapshot} ·{" "}
                        {exercise.status === "canceled"
                          ? t("Canceled")
                          : t("{completed} of {total} sets", {
                              completed: exercise.completedSets,
                              total: exercise.totalSets,
                            })}
                      </ButtonLink>
                    ) : (
                      <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700">
                        {exercise.exercise_name_snapshot} ·{" "}
                        {t("Catalog removed")}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
              {session.notes ? (
                <p className="text-sm text-slate-600">
                  <span className="font-semibold text-slate-950">
                    {t("Notes")}:
                  </span>{" "}
                  {session.notes}
                </p>
              ) : null}
            </Surface>
          ))}
        </ol>
      ) : (
        <Surface padding="none">
          <EmptyState
            title={t("No completed workouts found.")}
            description={t(
              "Complete a workout or change the filters to see session history.",
            )}
            action={
              <ButtonLink href="/workouts">{t("Go to workouts")}</ButtonLink>
            }
          />
        </Surface>
      )}

      {result.pageCount > 1 ? (
        <nav
          className="flex items-center justify-between gap-3"
          aria-label={t("History pages")}
        >
          {result.page > 1 ? (
            <ButtonLink href={pageHref(result.page - 1)} variant="secondary">
              {t("Previous page")}
            </ButtonLink>
          ) : (
            <span />
          )}
          <p className="text-sm text-slate-600">
            {t("Page {page} of {pages}", {
              page: result.page,
              pages: result.pageCount,
            })}
          </p>
          {result.page < result.pageCount ? (
            <ButtonLink href={pageHref(result.page + 1)} variant="secondary">
              {t("Next page")}
            </ButtonLink>
          ) : (
            <span />
          )}
        </nav>
      ) : null}
    </main>
  );
}

function formatDuration(seconds: number | null, t: Translation) {
  if (seconds === null) return t("Not available");
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours) return t("{hours} hr {minutes} min", { hours, minutes });
  return t("{minutes} min", { minutes });
}
