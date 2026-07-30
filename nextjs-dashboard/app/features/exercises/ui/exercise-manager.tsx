"use client";

import {
  ArrowLeftIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  equipmentSuggestions,
  exerciseCategories,
  type ExerciseCategory,
  type TrackingMode,
} from "@/app/domain";
import { archiveExercise, saveExercise } from "@/app/features/workouts/actions";
import { useI18n } from "@/app/i18n/provider";

export type ExerciseView = {
  id: string;
  name: string;
  trackingMode: TrackingMode;
  category: string;
  equipment: string;
  custom: boolean;
};

const categoryDescription: Record<ExerciseCategory, string> = {
  strength: "Build strength with resistance or bodyweight.",
  cardio: "Raise your heart rate and improve endurance.",
  mobility: "Improve range of motion and movement quality.",
  balance: "Train stability and body control.",
  sport: "Practice a sport-specific movement.",
  other: "Use when none of the categories fit.",
};

export function ExerciseManager({ exercises }: { exercises: ExerciseView[] }) {
  const { t } = useI18n();
  const router = useRouter();
  const [editing, setEditing] = useState<ExerciseView>();
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [category, setCategory] = useState<ExerciseCategory>("other");
  const visibleExercises = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase();
    return exercises.filter(
      (exercise) =>
        (categoryFilter === "all" || exercise.category === categoryFilter) &&
        (!normalized ||
          exercise.name.toLocaleLowerCase().includes(normalized) ||
          exercise.equipment.toLocaleLowerCase().includes(normalized)),
    );
  }, [categoryFilter, exercises, query]);

  function beginEdit(exercise: ExerciseView) {
    setEditing(exercise);
    setCategory(
      exerciseCategories.includes(exercise.category as ExerciseCategory)
        ? (exercise.category as ExerciseCategory)
        : "other",
    );
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() {
    setEditing(undefined);
    setCategory("other");
  }

  return (
    <main className="mx-auto max-w-6xl space-y-8">
      <header>
        <Link
          className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:text-blue-900"
          href="/workouts"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          {t("Back to workouts")}
        </Link>
        <div className="mt-4">
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-700">
            {t("Build your library")}
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-gray-950">
            {t("Exercise library")}
          </h1>
          <p className="mt-2 max-w-2xl text-gray-600">
            {t(
              "Choose from ready-made exercises or add movements that match your training.",
            )}
          </p>
        </div>
      </header>

      <section
        className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
        aria-labelledby="exercise-form-heading"
      >
        <div className="border-b border-gray-100 bg-gradient-to-r from-blue-50 to-white px-5 py-4 sm:px-6">
          <h2
            className="flex items-center gap-2 text-xl font-bold text-gray-950"
            id="exercise-form-heading"
          >
            <PencilSquareIcon className="h-6 w-6 text-blue-700" />
            {editing ? t("Edit exercise") : t("Create a custom exercise")}
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            {t("Tracking mode controls which fields appear during a workout.")}
          </p>
        </div>
        <form
          className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6"
          onSubmit={async (event) => {
            event.preventDefault();
            setSaving(true);
            setMessage("");
            const form = event.currentTarget;
            const result = await saveExercise(new FormData(form));
            setSaving(false);
            setMessage(result.ok ? t("Exercise saved.") : t(result.error));
            if (result.ok) {
              form.reset();
              cancelEdit();
              router.refresh();
            }
          }}
        >
          {editing ? (
            <input type="hidden" name="id" value={editing.id} />
          ) : null}
          <Field label={t("Exercise name")}>
            <input
              className="input"
              key={editing?.id ?? "new"}
              name="name"
              defaultValue={editing?.name}
              maxLength={80}
              placeholder={t("Example: Incline dumbbell press")}
              required
            />
          </Field>
          <Field label={t("Tracking mode")}>
            <select
              className="input"
              key={`${editing?.id ?? "new"}-mode`}
              name="trackingMode"
              defaultValue={editing?.trackingMode ?? "reps_load"}
            >
              <option value="reps_load">{t("Repetitions and load")}</option>
              <option value="reps">{t("Repetitions only")}</option>
              <option value="duration">{t("Duration only")}</option>
              <option value="distance_duration">
                {t("Distance and duration")}
              </option>
            </select>
          </Field>
          <Field label={t("Category")} hint={t(categoryDescription[category])}>
            <select
              className="input"
              name="category"
              value={category}
              onChange={(event) =>
                setCategory(event.target.value as ExerciseCategory)
              }
            >
              {exerciseCategories.map((item) => (
                <option key={item} value={item}>
                  {t(`Category: ${item}`)}
                </option>
              ))}
            </select>
          </Field>
          <Field
            label={t("Equipment")}
            hint={t("Choose a suggestion or type your own equipment.")}
          >
            <input
              className="input"
              key={`${editing?.id ?? "new"}-equipment`}
              name="equipment"
              list="equipment-suggestions"
              defaultValue={editing?.equipment}
              maxLength={80}
              placeholder={t("Example: dumbbell")}
            />
            <datalist id="equipment-suggestions">
              {equipmentSuggestions.map((item) => (
                <option key={item} value={t(`Equipment: ${item}`)} />
              ))}
            </datalist>
          </Field>
          <div className="flex flex-wrap gap-3 sm:col-span-2">
            <button
              className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-60"
              disabled={saving}
            >
              {saving
                ? t("Saving...")
                : editing
                  ? t("Save changes")
                  : t("Create exercise")}
            </button>
            {editing ? (
              <button
                className="rounded-xl border border-gray-300 px-5 py-3 font-semibold text-gray-700 hover:bg-gray-50"
                type="button"
                onClick={cancelEdit}
              >
                {t("Cancel")}
              </button>
            ) : null}
            <p
              className="min-h-6 self-center font-medium text-gray-700"
              aria-live="polite"
            >
              {message}
            </p>
          </div>
        </form>
      </section>

      <section aria-labelledby="library-heading">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h2
              className="text-2xl font-bold text-gray-950"
              id="library-heading"
            >
              {t("Available exercises")}
            </h2>
            <p className="text-sm text-gray-600">
              {t("{count} exercises", { count: visibleExercises.length })}
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <label className="relative">
              <span className="sr-only">{t("Search exercises")}</span>
              <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                className="input pl-10"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t("Search exercises")}
              />
            </label>
            <label>
              <span className="sr-only">{t("Filter by category")}</span>
              <select
                className="input"
                value={categoryFilter}
                onChange={(event) => setCategoryFilter(event.target.value)}
              >
                <option value="all">{t("All categories")}</option>
                {exerciseCategories.map((item) => (
                  <option key={item} value={item}>
                    {t(`Category: ${item}`)}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
        {visibleExercises.length ? (
          <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visibleExercises.map((exercise) => (
              <li
                className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                key={exercise.id}
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-lg font-bold text-gray-950">
                    {exercise.name}
                  </h3>
                  <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600">
                    {exercise.custom ? t("Custom") : t("Built in")}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-xs font-medium">
                  <Chip>{t(`Category: ${exercise.category}`)}</Chip>
                  {exercise.equipment ? (
                    <Chip>{t(`Equipment: ${exercise.equipment}`)}</Chip>
                  ) : null}
                </div>
                <p className="mt-4 text-sm text-gray-600">
                  {t(trackingLabel(exercise.trackingMode))}
                </p>
                {exercise.custom ? (
                  <div className="mt-5 flex gap-2 border-t pt-4">
                    <button
                      className="rounded-lg border px-3 py-2 text-sm font-semibold hover:bg-gray-50"
                      onClick={() => beginEdit(exercise)}
                    >
                      {t("Edit")}
                    </button>
                    <button
                      className="rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
                      onClick={async () => {
                        if (!confirm(t("Archive this exercise?"))) return;
                        const result = await archiveExercise(exercise.id);
                        setMessage(
                          result.ok ? t("Exercise archived.") : t(result.error),
                        );
                        if (result.ok) router.refresh();
                      }}
                    >
                      {t("Archive")}
                    </button>
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-5 rounded-2xl border border-dashed bg-white p-10 text-center">
            <h3 className="font-bold">{t("No matching exercises")}</h3>
            <p className="mt-1 text-sm text-gray-600">
              {t("Change the search or category filter and try again.")}
            </p>
          </div>
        )}
      </section>
    </main>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="font-semibold text-gray-800">
      {label}
      <span className="mt-1 block">{children}</span>
      {hint ? (
        <span className="mt-1 block text-xs font-normal text-gray-500">
          {hint}
        </span>
      ) : null}
    </label>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-blue-50 px-2.5 py-1 text-blue-800">
      {children}
    </span>
  );
}

function trackingLabel(mode: TrackingMode) {
  return mode === "reps_load"
    ? "Repetitions and load"
    : mode === "reps"
      ? "Repetitions only"
      : mode === "duration"
        ? "Duration only"
        : "Distance and duration";
}
