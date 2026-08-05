import { CalendarDaysIcon, TrophyIcon } from "@heroicons/react/24/outline";
import {
  convertDistance,
  convertMass,
  personalBestKinds,
  type Locale,
  type PersonalBest,
  type PersonalBestKind,
  type UnitSystem,
} from "@/app/domain";
import { ButtonLink } from "@/app/ui/atoms/button";
import { EmptyState } from "@/app/ui/atoms/empty-state";
import { Surface } from "@/app/ui/atoms/surface";
import { BackNavigation } from "@/app/ui/molecules/back-navigation";
import { PageHeading } from "@/app/ui/molecules/page-heading";

type Translation = (
  key: string,
  values?: Record<string, string | number>,
) => string;

type ExerciseHistoryResult = {
  exerciseId: string;
  name: string;
  archived: boolean;
  timezone: string;
  unitSystem: UnitSystem;
  personalBests: Partial<Record<PersonalBestKind, PersonalBest>>;
  entries: Array<{
    session_exercise_id: string;
    exercise_name_snapshot: string;
    exercise_status: "active" | "canceled";
    exercise_completed: boolean;
    cancellation_reason: string | null;
    session_id: string;
    template_name_snapshot: string | null;
    started_at: string;
    completed_at: string | null;
    sets: Array<{
      id: string;
      position: number;
      completed: boolean;
      reps: number | null;
      load_grams: number | null;
      duration_seconds: number | null;
      distance_meters: number | null;
      elapsed_seconds: number;
      rpe: number | null;
      notes: string;
    }>;
  }>;
  page: number;
  total: number;
  pageCount: number;
};

export function ExerciseHistory({
  result,
  locale,
  t,
}: {
  result: ExerciseHistoryResult;
  locale: Locale;
  t: Translation;
}) {
  const dateFormatter = new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: result.timezone,
  });
  const bests = personalBestKinds
    .map((kind) => result.personalBests[kind])
    .filter((best): best is PersonalBest => Boolean(best));

  return (
    <main className="mx-auto max-w-6xl space-y-6">
      <BackNavigation href="/workouts/history">
        {t("Back to workout history")}
      </BackNavigation>
      <PageHeading
        eyebrow={t("Exercise performance")}
        title={result.name}
        description={t(
          "Review completed sets and personal bests calculated from immutable workout records.",
        )}
      />
      {result.archived ? (
        <p className="text-sm font-semibold text-amber-800">
          {t("This exercise is archived. Its history remains available.")}
        </p>
      ) : null}

      <section aria-labelledby="personal-bests-heading" className="space-y-4">
        <div>
          <h2
            id="personal-bests-heading"
            className="text-xl font-bold text-slate-950"
          >
            {t("Personal bests")}
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            {t(
              "Only completed sets from non-canceled exercises qualify. Equal results keep the earliest date.",
            )}
          </p>
        </div>
        {bests.length ? (
          <dl className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {bests.map((best) => (
              <Surface
                as="div"
                key={best.kind}
                className="relative overflow-hidden"
              >
                <TrophyIcon
                  className="absolute right-4 top-4 h-6 w-6 text-amber-500"
                  aria-hidden="true"
                />
                <dt className="pr-8 text-sm font-semibold text-slate-600">
                  {t(personalBestLabel(best.kind))}
                </dt>
                <dd className="mt-2 text-2xl font-bold text-slate-950">
                  {formatPersonalBest(best, result.unitSystem, t)}
                </dd>
                <dd className="mt-3 text-sm text-slate-600">
                  {t("First achieved {date}", {
                    date: dateFormatter.format(
                      new Date(best.candidate.achievedAt),
                    ),
                  })}
                </dd>
                <dd className="mt-3">
                  <ButtonLink
                    href={`/workouts/sessions/${best.candidate.sessionId}`}
                    variant="quiet"
                  >
                    {t("View record")}
                  </ButtonLink>
                </dd>
              </Surface>
            ))}
          </dl>
        ) : (
          <Surface padding="none">
            <EmptyState
              title={t("No qualifying personal bests yet.")}
              description={t(
                "Complete a set with repetitions, load, duration, or distance to establish a personal best.",
              )}
            />
          </Surface>
        )}
        <aside>
          <Surface className="text-sm text-slate-600">
            <h3 className="font-bold text-slate-950">
              {t("How estimates work")}
            </h3>
            <p className="mt-2">
              {t(
                "Estimated 1RM uses the Epley v1 formula for 1 to 10 repetitions. Bodyweight without recorded external load can set a repetition best, but not a load or estimated 1RM best.",
              )}
            </p>
          </Surface>
        </aside>
      </section>

      <section aria-labelledby="exercise-history-heading" className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2
              id="exercise-history-heading"
              className="text-xl font-bold text-slate-950"
            >
              {t("Exercise history")}
            </h2>
            <p className="text-sm text-slate-600">
              {t("{count} exercise records found", { count: result.total })}
            </p>
          </div>
          <p className="text-sm text-slate-600">
            {t("Displayed in {units}", {
              units: t(
                result.unitSystem === "us" ? "US units" : "Metric units",
              ),
            })}
          </p>
        </div>
        {result.entries.length ? (
          <ol className="grid gap-4" aria-label={t("Exercise history")}>
            {result.entries.map((entry) => (
              <Surface
                as="li"
                key={entry.session_exercise_id}
                className="space-y-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-slate-950">
                      {entry.template_name_snapshot || t("Empty workout")}
                    </h3>
                    <p className="mt-1 flex items-center gap-2 text-sm text-slate-600">
                      <CalendarDaysIcon
                        className="h-4 w-4"
                        aria-hidden="true"
                      />
                      <time dateTime={entry.started_at}>
                        {dateFormatter.format(new Date(entry.started_at))}
                      </time>
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={
                        entry.exercise_status === "canceled"
                          ? "text-sm font-semibold text-amber-800"
                          : "text-sm font-semibold text-emerald-700"
                      }
                    >
                      {t(
                        entry.exercise_status === "canceled"
                          ? "Canceled"
                          : "Completed",
                      )}
                    </span>
                    <ButtonLink
                      href={`/workouts/sessions/${entry.session_id}`}
                      variant="secondary"
                    >
                      {t("View workout")}
                    </ButtonLink>
                  </div>
                </div>
                {entry.cancellation_reason ? (
                  <p className="text-sm text-slate-600">
                    <span className="font-semibold text-slate-950">
                      {t("Cancellation reason")}:
                    </span>{" "}
                    {entry.cancellation_reason}
                  </p>
                ) : null}
                {entry.sets.length ? (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[36rem] text-left text-sm">
                      <caption className="sr-only">
                        {t("Set results for {workout}", {
                          workout:
                            entry.template_name_snapshot || t("Empty workout"),
                        })}
                      </caption>
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-600">
                          <th className="px-3 py-2 font-semibold" scope="col">
                            {t("Set")}
                          </th>
                          <th className="px-3 py-2 font-semibold" scope="col">
                            {t("Result")}
                          </th>
                          <th className="px-3 py-2 font-semibold" scope="col">
                            {t("RPE")}
                          </th>
                          <th className="px-3 py-2 font-semibold" scope="col">
                            {t("Notes")}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {entry.sets.map((set) => (
                          <tr
                            key={set.id}
                            className="border-b border-slate-100 last:border-0"
                          >
                            <th
                              className="px-3 py-3 font-semibold text-slate-950"
                              scope="row"
                            >
                              {set.position + 1}
                            </th>
                            <td className="px-3 py-3 text-slate-700">
                              {set.completed
                                ? formatSetResult(set, result.unitSystem, t)
                                : t("Not completed")}
                            </td>
                            <td className="px-3 py-3 text-slate-700">
                              {set.rpe ?? t("Not available")}
                            </td>
                            <td className="max-w-xs px-3 py-3 text-slate-700">
                              {set.notes || t("No notes")}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-sm text-slate-600">
                    {t("No sets recorded.")}
                  </p>
                )}
              </Surface>
            ))}
          </ol>
        ) : (
          <Surface padding="none">
            <EmptyState
              title={t("No completed exercise history yet.")}
              description={t(
                "Complete this exercise in a workout to see its history here.",
              )}
            />
          </Surface>
        )}
      </section>

      {result.pageCount > 1 ? (
        <nav
          className="flex items-center justify-between gap-3"
          aria-label={t("Exercise history pages")}
        >
          {result.page > 1 ? (
            <ButtonLink
              href={`/workouts/history/exercises/${result.exerciseId}?page=${result.page - 1}`}
              variant="secondary"
            >
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
            <ButtonLink
              href={`/workouts/history/exercises/${result.exerciseId}?page=${result.page + 1}`}
              variant="secondary"
            >
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

function personalBestLabel(kind: PersonalBestKind) {
  return {
    load: "Heaviest load",
    estimatedOneRepMax: "Estimated 1RM",
    reps: "Most repetitions",
    duration: "Longest duration",
    distance: "Greatest distance",
    pace: "Fastest pace",
  }[kind];
}

function formatPersonalBest(
  best: PersonalBest,
  unitSystem: UnitSystem,
  t: Translation,
) {
  if (best.kind === "load" || best.kind === "estimatedOneRepMax")
    return formatLoad(best.value, unitSystem, t);
  if (best.kind === "reps") return t("{value} reps", { value: best.value });
  if (best.kind === "duration") return formatDuration(best.value, t);
  if (best.kind === "distance")
    return formatDistance(best.value, unitSystem, t);
  return formatPace(best.value, unitSystem, t);
}

function formatLoad(grams: number, unitSystem: UnitSystem, t: Translation) {
  const value = convertMass(
    grams,
    "grams",
    unitSystem === "us" ? "pounds" : "kilograms",
    2,
  );
  return t(unitSystem === "us" ? "{value} lb" : "{value} kg", { value });
}

function formatDistance(
  meters: number,
  unitSystem: UnitSystem,
  t: Translation,
) {
  const value = convertDistance(
    meters,
    "meters",
    unitSystem === "us" ? "miles" : "kilometers",
    2,
  );
  return t(unitSystem === "us" ? "{value} mi" : "{value} km", { value });
}

function formatPace(
  secondsPerMeter: number,
  unitSystem: UnitSystem,
  t: Translation,
) {
  const distance = unitSystem === "us" ? 1_609.344 : 1_000;
  return t(unitSystem === "us" ? "{time} per mi" : "{time} per km", {
    time: clockDuration(Math.round(secondsPerMeter * distance)),
  });
}

function formatDuration(seconds: number, t: Translation) {
  return t("{time} duration", { time: clockDuration(seconds) });
}

function clockDuration(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainder = Math.round(seconds % 60);
  return hours
    ? `${hours}:${String(minutes).padStart(2, "0")}:${String(remainder).padStart(2, "0")}`
    : `${minutes}:${String(remainder).padStart(2, "0")}`;
}

function formatSetResult(
  set: ExerciseHistoryResult["entries"][number]["sets"][number],
  unitSystem: UnitSystem,
  t: Translation,
) {
  const values = [
    set.reps === null ? null : t("{value} reps", { value: set.reps }),
    set.load_grams === null ? null : formatLoad(set.load_grams, unitSystem, t),
    set.duration_seconds === null
      ? null
      : formatDuration(set.duration_seconds, t),
    set.distance_meters === null
      ? null
      : formatDistance(set.distance_meters, unitSystem, t),
    set.elapsed_seconds > 0
      ? t("{time} set time", { time: clockDuration(set.elapsed_seconds) })
      : null,
  ].filter(Boolean);
  return values.length ? values.join(" · ") : t("No result");
}
