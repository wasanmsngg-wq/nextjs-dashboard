"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { TrackingMode } from "@/app/domain";
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

export function ExerciseManager({ exercises }: { exercises: ExerciseView[] }) {
  const { t } = useI18n();
  const router = useRouter();
  const [editing, setEditing] = useState<ExerciseView>();
  const [message, setMessage] = useState("");
  return (
    <main className="space-y-6 p-4 md:p-8">
      <div>
        <h1 className="text-2xl font-semibold">{t("Exercise library")}</h1>
        <p className="text-gray-600">
          {t(
            "System exercises are bilingual. Your custom names stay as entered.",
          )}
        </p>
      </div>
      <form
        className="grid max-w-2xl gap-3 rounded-lg border bg-white p-4 md:grid-cols-2"
        onSubmit={async (event) => {
          event.preventDefault();
          const form = event.currentTarget;
          const result = await saveExercise(new FormData(form));
          setMessage(result.ok ? t("Exercise saved.") : t(result.error));
          if (result.ok) {
            form.reset();
            setEditing(undefined);
            router.refresh();
          }
        }}
      >
        {editing ? <input type="hidden" name="id" value={editing.id} /> : null}
        <label>
          {t("Exercise name")}
          <input
            className="mt-1 w-full rounded border p-2"
            key={editing?.id ?? "new"}
            name="name"
            defaultValue={editing?.name}
            maxLength={80}
            required
          />
        </label>
        <label>
          {t("Tracking mode")}
          <select
            className="mt-1 w-full rounded border p-2"
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
        </label>
        <label>
          {t("Category")}
          <input
            className="mt-1 w-full rounded border p-2"
            key={`${editing?.id ?? "new"}-category`}
            name="category"
            defaultValue={editing?.category ?? "other"}
            maxLength={40}
          />
        </label>
        <label>
          {t("Equipment")}
          <input
            className="mt-1 w-full rounded border p-2"
            key={`${editing?.id ?? "new"}-equipment`}
            name="equipment"
            defaultValue={editing?.equipment}
            maxLength={80}
          />
        </label>
        <div className="flex gap-2 md:col-span-2">
          <button className="rounded bg-blue-600 px-4 py-2 text-white">
            {editing ? t("Save changes") : t("Create exercise")}
          </button>
          {editing ? (
            <button
              className="rounded border px-4 py-2"
              type="button"
              onClick={() => setEditing(undefined)}
            >
              {t("Cancel")}
            </button>
          ) : null}
        </div>
      </form>
      <ul className="grid gap-3 md:grid-cols-2">
        {exercises.map((exercise) => (
          <li className="rounded-lg border bg-white p-4" key={exercise.id}>
            <h2 className="font-semibold">{exercise.name}</h2>
            <p className="text-sm text-gray-600">
              {t(
                exercise.trackingMode === "reps_load"
                  ? "Repetitions and load"
                  : exercise.trackingMode === "reps"
                    ? "Repetitions only"
                    : exercise.trackingMode === "duration"
                      ? "Duration only"
                      : "Distance and duration",
              )}
            </p>
            {exercise.custom ? (
              <div className="mt-3 flex gap-2">
                <button
                  className="rounded border px-3 py-2"
                  onClick={() => setEditing(exercise)}
                >
                  {t("Edit")}
                </button>
                <button
                  className="rounded border border-red-300 px-3 py-2 text-red-700"
                  onClick={async () => {
                    if (!confirm(t("Archive this exercise?"))) return;
                    const result = await archiveExercise(exercise.id);
                    setMessage(
                      result.ok ? t("Exercise archived.") : t(result.error),
                    );
                    router.refresh();
                  }}
                >
                  {t("Archive")}
                </button>
              </div>
            ) : null}
          </li>
        ))}
      </ul>
      <p aria-live="polite">{message}</p>
    </main>
  );
}
