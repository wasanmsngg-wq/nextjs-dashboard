import { ChartBarSquareIcon } from "@heroicons/react/24/outline";
import {
  convertMass,
  type Locale,
  type PerformanceTrendSummary,
  type UnitSystem,
  type WeeklyPerformance,
} from "@/app/domain";
import { Button, ButtonLink } from "@/app/ui/atoms/button";
import { EmptyState } from "@/app/ui/atoms/empty-state";
import { Select } from "@/app/ui/atoms/form-control";
import { Surface } from "@/app/ui/atoms/surface";
import { BackNavigation } from "@/app/ui/molecules/back-navigation";
import { BarChart, type BarChartPoint } from "@/app/ui/molecules/bar-chart";
import { PageHeading } from "@/app/ui/molecules/page-heading";
import { formatActiveTime } from "../format-active-time";

type Translation = (
  key: string,
  values?: Record<string, string | number>,
) => string;

type ProgressResult = {
  weeks: WeeklyPerformance[];
  summary: PerformanceTrendSummary;
  exercises: Array<{ id: string; name: string; archived: boolean }>;
  exerciseId?: string;
  timezone: string;
  unitSystem: UnitSystem;
  startDate: string;
  endDate: string;
};

export function ProgressDashboard({
  result,
  selectedWeeks,
  locale,
  t,
}: {
  result: ProgressResult;
  selectedWeeks: number;
  locale: Locale;
  t: Translation;
}) {
  const weekFormatter = new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
  const rangeFormatter = new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeZone: "UTC",
  });
  const weekLabel = (weekStart: string) =>
    weekFormatter.format(new Date(`${weekStart}T00:00:00Z`));
  const chartPoints = (
    value: (week: WeeklyPerformance) => number,
    format: (week: WeeklyPerformance) => string,
  ): BarChartPoint[] =>
    result.weeks.map((week) => ({
      label: weekLabel(week.weekStart),
      value: value(week),
      formattedValue: format(week),
    }));
  const tableId = "weekly-progress-table";
  const hasTraining = result.summary.sessionCount > 0;

  return (
    <main className="mx-auto max-w-6xl space-y-6">
      <BackNavigation href="/workouts">{t("Back to workouts")}</BackNavigation>
      <PageHeading
        actions={
          <ButtonLink href="/workouts/history" variant="secondary">
            {t("Workout history")}
          </ButtonLink>
        }
        eyebrow={t("Performance")}
        title={t("Progress")}
        description={t(
          "Review weekly training volume, strength estimates, active time, and consistency.",
        )}
      />

      <Surface as="section" aria-labelledby="progress-filters-heading">
        <h2 id="progress-filters-heading" className="font-bold text-slate-950">
          {t("Progress filters")}
        </h2>
        <form
          className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          method="get"
        >
          <label className="space-y-1 text-sm font-semibold text-slate-800">
            <span>{t("Time range")}</span>
            <Select name="weeks" defaultValue={String(selectedWeeks)}>
              {[4, 8, 12, 26].map((weeks) => (
                <option key={weeks} value={weeks}>
                  {t("Last {count} weeks", { count: weeks })}
                </option>
              ))}
            </Select>
          </label>
          <label className="space-y-1 text-sm font-semibold text-slate-800">
            <span>{t("Exercise")}</span>
            <Select name="exercise" defaultValue={result.exerciseId ?? ""}>
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
            <ButtonLink href="/workouts/progress" variant="secondary">
              {t("Clear")}
            </ButtonLink>
          </div>
        </form>
        <p className="mt-3 text-sm text-slate-600">
          {t("{start} to {end}, using {timezone}.", {
            start: rangeFormatter.format(
              new Date(`${result.startDate}T00:00:00Z`),
            ),
            end: rangeFormatter.format(new Date(`${result.endDate}T00:00:00Z`)),
            timezone: result.timezone,
          })}
        </p>
      </Surface>

      {!hasTraining ? (
        <Surface padding="none">
          <EmptyState
            icon={<ChartBarSquareIcon className="h-10 w-10" />}
            title={t("No completed workouts in this range.")}
            description={t(
              "Complete a workout or expand the time range to see progress.",
            )}
            action={
              <ButtonLink href="/workouts">{t("Go to workouts")}</ButtonLink>
            }
          />
        </Surface>
      ) : (
        <>
          <section
            aria-labelledby="progress-summary-heading"
            className="space-y-4"
          >
            <h2
              id="progress-summary-heading"
              className="text-xl font-bold text-slate-950"
            >
              {t("Range summary")}
            </h2>
            <dl className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <MetricCard
                label={t("Training volume")}
                value={formatVolume(
                  result.summary.volumeGrams,
                  result.unitSystem,
                  t,
                )}
                detail={t("{count} completed sets", {
                  count: result.summary.completedSets,
                })}
              />
              <MetricCard
                label={t("Peak estimated 1RM")}
                value={formatOptionalLoad(
                  result.summary.peakEstimatedOneRepMaxGrams,
                  result.unitSystem,
                  t,
                )}
                detail={t("Epley estimate from 1 to 10 repetitions")}
              />
              <MetricCard
                label={t("Active time")}
                value={formatActiveTime(result.summary.durationSeconds, t)}
                detail={t("Completed-set active time")}
              />
              <MetricCard
                label={t("Consistency")}
                value={t("{count} workouts", {
                  count: result.summary.sessionCount,
                })}
                detail={t("{count} active days", {
                  count: result.summary.activeDays,
                })}
              />
            </dl>
          </section>

          <section
            aria-labelledby="progress-trends-heading"
            className="space-y-4"
          >
            <div>
              <h2
                id="progress-trends-heading"
                className="text-xl font-bold text-slate-950"
              >
                {t("Weekly trends")}
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                {t("Every chart value is also available in the weekly table.")}
              </p>
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              <Surface>
                <BarChart
                  title={t("Training volume")}
                  titleId="volume-chart-heading"
                  descriptionId={tableId}
                  points={chartPoints(
                    (week) => week.volumeGrams,
                    (week) =>
                      formatVolume(week.volumeGrams, result.unitSystem, t),
                  )}
                />
              </Surface>
              <Surface>
                <BarChart
                  title={t("Peak estimated 1RM")}
                  titleId="one-rm-chart-heading"
                  descriptionId={tableId}
                  points={chartPoints(
                    (week) => week.peakEstimatedOneRepMaxGrams ?? 0,
                    (week) =>
                      formatOptionalLoad(
                        week.peakEstimatedOneRepMaxGrams,
                        result.unitSystem,
                        t,
                      ),
                  )}
                />
              </Surface>
              <Surface>
                <BarChart
                  title={t("Active time")}
                  titleId="duration-chart-heading"
                  descriptionId={tableId}
                  points={chartPoints(
                    (week) => week.durationSeconds,
                    (week) => formatActiveTime(week.durationSeconds, t),
                  )}
                />
              </Surface>
              <Surface>
                <BarChart
                  title={t("Consistency")}
                  titleId="consistency-chart-heading"
                  descriptionId={tableId}
                  points={chartPoints(
                    (week) => week.sessionCount,
                    (week) =>
                      t("{count} workouts", { count: week.sessionCount }),
                  )}
                />
              </Surface>
            </div>
          </section>

          <Surface as="section" aria-labelledby="weekly-table-heading">
            <h2
              id="weekly-table-heading"
              className="text-xl font-bold text-slate-950"
            >
              {t("Weekly progress table")}
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              {t(
                "Bodyweight repetitions are reported separately because body mass is never inferred as external load.",
              )}
            </p>
            <div
              aria-labelledby="weekly-table-heading"
              className="mt-4 overflow-x-auto focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              role="region"
              tabIndex={0}
            >
              <table
                id={tableId}
                className="w-full min-w-[64rem] text-left text-sm"
              >
                <thead>
                  <tr className="border-b border-slate-200 text-slate-600">
                    {[
                      "Week",
                      "Workouts",
                      "Active days",
                      "Training volume",
                      "Peak estimated 1RM",
                      "Active time",
                      "Completed sets",
                      "Bodyweight repetitions",
                    ].map((heading) => (
                      <th
                        key={heading}
                        className="px-3 py-2 font-semibold"
                        scope="col"
                      >
                        {t(heading)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {result.weeks.map((week) => (
                    <tr
                      key={week.weekStart}
                      className="border-b border-slate-100 last:border-0"
                    >
                      <th
                        className="px-3 py-3 font-semibold text-slate-950"
                        scope="row"
                      >
                        <time dateTime={week.weekStart}>
                          {weekLabel(week.weekStart)}
                        </time>
                      </th>
                      <td className="px-3 py-3 text-slate-700">
                        {week.sessionCount}
                      </td>
                      <td className="px-3 py-3 text-slate-700">
                        {week.activeDays}
                      </td>
                      <td className="px-3 py-3 text-slate-700">
                        {formatVolume(week.volumeGrams, result.unitSystem, t)}
                      </td>
                      <td className="px-3 py-3 text-slate-700">
                        {formatOptionalLoad(
                          week.peakEstimatedOneRepMaxGrams,
                          result.unitSystem,
                          t,
                        )}
                      </td>
                      <td className="px-3 py-3 text-slate-700">
                        {formatActiveTime(week.durationSeconds, t)}
                      </td>
                      <td className="px-3 py-3 text-slate-700">
                        {week.completedSets}
                      </td>
                      <td className="px-3 py-3 text-slate-700">
                        {week.bodyweightReps}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Surface>
        </>
      )}
    </main>
  );
}

function MetricCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <Surface as="div">
      <dt className="text-sm font-semibold text-slate-600">{label}</dt>
      <dd className="mt-2 text-2xl font-bold text-slate-950">{value}</dd>
      <dd className="mt-2 text-sm text-slate-600">{detail}</dd>
    </Surface>
  );
}

function formatVolume(grams: number, unitSystem: UnitSystem, t: Translation) {
  const value = convertMass(
    grams,
    "grams",
    unitSystem === "us" ? "pounds" : "kilograms",
    2,
  );
  return t(unitSystem === "us" ? "{value} lb-reps" : "{value} kg-reps", {
    value,
  });
}

function formatOptionalLoad(
  grams: number | null,
  unitSystem: UnitSystem,
  t: Translation,
) {
  if (grams === null) return t("Not available");
  const value = convertMass(
    grams,
    "grams",
    unitSystem === "us" ? "pounds" : "kilograms",
    2,
  );
  return t(unitSystem === "us" ? "{value} lb" : "{value} kg", { value });
}
