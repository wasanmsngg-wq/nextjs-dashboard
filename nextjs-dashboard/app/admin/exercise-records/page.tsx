import { loadExerciseRecords } from "@/app/features/admin/data";
import { adminSearchSchema } from "@/app/features/admin/validation";
import { getTranslations } from "@/app/i18n/server";
import { EmptyState } from "@/app/ui/atoms/empty-state";
import { Surface } from "@/app/ui/atoms/surface";
import { PageHeading } from "@/app/ui/molecules/page-heading";
import Search from "@/app/ui/molecules/search-field";

type SetRecord = Awaited<
  ReturnType<typeof loadExerciseRecords>
>[number]["sets"][number];

function setSummary(
  set: SetRecord,
  t: (key: string, values?: Record<string, string | number>) => string,
) {
  return [
    set.reps === null ? null : t("{value} reps", { value: set.reps }),
    set.load_grams === null
      ? null
      : t("{value} kg", { value: set.load_grams / 1000 }),
    set.duration_seconds === null
      ? null
      : t("{value} seconds", { value: set.duration_seconds }),
    set.distance_meters === null
      ? null
      : t("{value} meters", { value: set.distance_meters }),
    set.elapsed_seconds
      ? t("{value} seconds elapsed", { value: set.elapsed_seconds })
      : null,
    set.rpe === null ? null : t("RPE {value}", { value: set.rpe }),
  ]
    .filter(Boolean)
    .join(" · ");
}

export default async function AdminExerciseRecordsPage({
  searchParams,
}: {
  searchParams: Promise<{ query?: string }>;
}) {
  const query = adminSearchSchema.parse((await searchParams).query ?? "");
  const [{ locale, t }, records] = await Promise.all([
    getTranslations(),
    loadExerciseRecords(query),
  ]);
  const dateFormatter = new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  });
  return (
    <main className="mx-auto max-w-7xl space-y-6">
      <PageHeading
        eyebrow={t("Administration")}
        title={t("Exercise records")}
        description={t(
          "Inspect the latest workout exercise results. Historical records are read-only, including for administrators.",
        )}
      />
      <div className="max-w-2xl">
        <Search
          placeholder={t(
            "Search by exercise, template, email, or display name...",
          )}
        />
      </div>
      {records.length ? (
        <ul className="grid gap-4" aria-label={t("Recorded exercises")}>
          {records.map((record) => {
            const completedSets = record.sets.filter(
              (set) => set.completed,
            ).length;
            return (
              <Surface as="li" key={record.id} className="space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold text-slate-950">
                      {record.exercise_name_snapshot}
                    </h2>
                    <p className="break-all text-sm text-slate-600">
                      {record.user.displayName ||
                        record.user.email ||
                        t("Unknown user")}
                      {record.user.displayName && record.user.email
                        ? ` · ${record.user.email}`
                        : ""}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-blue-700">
                    {record.status === "canceled"
                      ? t("Canceled")
                      : record.completed
                        ? t("Completed")
                        : t("Incomplete")}
                  </p>
                </div>
                <dl className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <dt className="font-semibold text-slate-950">
                      {t("Workout")}
                    </dt>
                    <dd className="text-slate-600">
                      {record.session.template_name_snapshot ||
                        t("Empty workout")}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-slate-950">
                      {t("Started")}
                    </dt>
                    <dd className="text-slate-600">
                      {dateFormatter.format(
                        new Date(record.session.started_at),
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-slate-950">
                      {t("Tracking mode")}
                    </dt>
                    <dd className="text-slate-600">
                      {t(
                        record.tracking_mode === "reps_load"
                          ? "Repetitions and load"
                          : record.tracking_mode === "reps"
                            ? "Repetitions only"
                            : record.tracking_mode === "duration"
                              ? "Duration only"
                              : "Distance and duration",
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-slate-950">
                      {t("Sets")}
                    </dt>
                    <dd className="text-slate-600">
                      {t("{completed} of {total} complete", {
                        completed: completedSets,
                        total: record.sets.length,
                      })}
                    </dd>
                  </div>
                </dl>
                {record.cancellation_reason ? (
                  <p className="text-sm text-slate-600">
                    <span className="font-semibold text-slate-950">
                      {t("Cancellation reason")}:
                    </span>{" "}
                    {record.cancellation_reason}
                  </p>
                ) : null}
                {record.sets.length ? (
                  <ol className="space-y-2" aria-label={t("Set results")}>
                    {record.sets.map((set, index) => (
                      <li
                        key={`${record.id}-${index}`}
                        className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700"
                      >
                        <span className="font-semibold text-slate-950">
                          {t("Set {number}", { number: index + 1 })}
                        </span>
                        {setSummary(set, t)
                          ? ` · ${setSummary(set, t)}`
                          : ` · ${t("No result")}`}
                      </li>
                    ))}
                  </ol>
                ) : null}
              </Surface>
            );
          })}
        </ul>
      ) : (
        <Surface padding="none">
          <EmptyState
            title={t("No exercise records found.")}
            description={t(
              "Completed and active workout exercises will appear here.",
            )}
          />
        </Surface>
      )}
    </main>
  );
}
