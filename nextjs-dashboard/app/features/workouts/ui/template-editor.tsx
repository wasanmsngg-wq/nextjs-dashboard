"use client";

import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  convertDistance,
  convertMass,
  fieldsForTrackingMode,
  type TrackingMode,
  type UnitSystem,
} from "@/app/domain";
import { saveTemplate } from "../actions";
import { useI18n } from "@/app/i18n/provider";
import { BackNavigation } from "@/app/ui/molecules/back-navigation";

type ExerciseOption = { id: string; name: string; trackingMode: TrackingMode };
type TargetSet = {
  id: string;
  targetReps: number | null;
  targetLoadGrams: number | null;
  targetDurationSeconds: number | null;
  targetDistanceMeters: number | null;
  targetRpe: number | null;
};
export type TemplateEditorValue = {
  id: string;
  name: string;
  notes: string;
  exercises: {
    id: string;
    exerciseId: string;
    sets: TargetSet[];
  }[];
};

export function TemplateEditor({
  initial,
  exerciseOptions,
  unitSystem,
}: {
  initial: TemplateEditorValue;
  exerciseOptions: ExerciseOption[];
  unitSystem: UnitSystem;
}) {
  const { t } = useI18n();
  const router = useRouter();
  const [value, setValue] = useState(initial);
  const [selectedExercise, setSelectedExercise] = useState(
    exerciseOptions[0]?.id ?? "",
  );
  const [exerciseQuery, setExerciseQuery] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const exerciseById = new Map(exerciseOptions.map((item) => [item.id, item]));
  const filteredOptions = useMemo(() => {
    const query = exerciseQuery.trim().toLocaleLowerCase();
    return query
      ? exerciseOptions.filter((item) =>
          item.name.toLocaleLowerCase().includes(query),
        )
      : exerciseOptions;
  }, [exerciseOptions, exerciseQuery]);
  const loadUnit = unitSystem === "us" ? "lb" : "kg";
  const distanceUnit = unitSystem === "us" ? "mi" : "km";
  function defaultSet(mode: TrackingMode): TargetSet {
    const fields = fieldsForTrackingMode(mode);
    return {
      id: crypto.randomUUID(),
      targetReps: fields.reps ? 8 : null,
      targetLoadGrams: fields.load ? 0 : null,
      targetDurationSeconds: fields.duration ? 60 : null,
      targetDistanceMeters: fields.distance ? 1_000 : null,
      targetRpe: null,
    };
  }
  function updateTargetSet(
    exerciseId: string,
    setId: string,
    change: Partial<TargetSet>,
  ) {
    setValue((current) => ({
      ...current,
      exercises: current.exercises.map((exercise) =>
        exercise.id !== exerciseId
          ? exercise
          : {
              ...exercise,
              sets: exercise.sets.map((set) =>
                set.id === setId ? { ...set, ...change } : set,
              ),
            },
      ),
    }));
  }
  return (
    <main className="mx-auto max-w-6xl space-y-8">
      <header>
        <BackNavigation href="/workouts">
          {t("Back to workouts")}
        </BackNavigation>
        <p className="mt-4 text-sm font-semibold uppercase tracking-wider text-blue-700">
          {t("Workout builder")}
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-gray-950">
          {initial.name
            ? t("Edit workout template")
            : t("Create workout template")}
        </h1>
        <p className="mt-2 max-w-2xl text-gray-600">
          {t("Choose exercises, set targets, and save a plan you can reuse.")}
        </p>
      </header>
      <section className="grid gap-5 rounded-2xl border bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-xl font-bold">{t("Template details")}</h2>
        <label className="font-semibold text-gray-800">
          {t("Template name")}
          <input
            className="input mt-1"
            value={value.name}
            maxLength={80}
            placeholder={t("Example: Full body strength")}
            onInput={(event) => {
              const name = event.currentTarget.value;
              setValue((current) => ({
                ...current,
                name,
              }));
            }}
          />
        </label>
        <label className="font-semibold text-gray-800">
          {t("Notes")}
          <textarea
            className="input mt-1 min-h-24"
            value={value.notes}
            maxLength={2_000}
            placeholder={t("Optional coaching notes or workout goal")}
            onInput={(event) => {
              const notes = event.currentTarget.value;
              setValue((current) => ({
                ...current,
                notes,
              }));
            }}
          />
        </label>
      </section>
      <section className="rounded-2xl border bg-white p-5 shadow-sm sm:p-6">
        <div>
          <h2 className="text-xl font-bold">{t("Exercises")}</h2>
          <p className="mt-1 text-sm text-gray-600">
            {t("Search your library, then add exercises in workout order.")}
          </p>
        </div>
        {exerciseOptions.length ? (
          <div className="mt-5 grid items-end gap-3 md:grid-cols-[1fr_1fr_auto]">
            <label className="font-semibold text-gray-800">
              {t("Search exercises")}
              <span className="relative mt-1 block">
                <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  className="input pl-10"
                  value={exerciseQuery}
                  onChange={(event) => {
                    const query = event.target.value;
                    setExerciseQuery(query);
                    const normalized = query.trim().toLocaleLowerCase();
                    const nextOptions = normalized
                      ? exerciseOptions.filter((item) =>
                          item.name.toLocaleLowerCase().includes(normalized),
                        )
                      : exerciseOptions;
                    if (
                      !nextOptions.some(
                        (exercise) => exercise.id === selectedExercise,
                      )
                    )
                      setSelectedExercise(nextOptions[0]?.id ?? "");
                  }}
                  placeholder={t("Search by exercise name")}
                />
              </span>
            </label>
            <label className="font-semibold text-gray-800">
              {t("Add exercise")}
              <select
                className="input mt-1"
                value={selectedExercise}
                onChange={(event) => setSelectedExercise(event.target.value)}
              >
                {!filteredOptions.length ? (
                  <option value="">{t("No matching exercises")}</option>
                ) : null}
                {filteredOptions.map((exercise) => (
                  <option key={exercise.id} value={exercise.id}>
                    {exercise.name}
                  </option>
                ))}
              </select>
            </label>
            <button
              className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
              type="button"
              disabled={!selectedExercise || value.exercises.length >= 100}
              onClick={() => {
                const selected = exerciseById.get(selectedExercise);
                if (!selected) return;
                setValue((current) => ({
                  ...current,
                  exercises: [
                    ...current.exercises,
                    {
                      id: crypto.randomUUID(),
                      exerciseId: selected.id,
                      sets: Array.from({ length: 3 }, () =>
                        defaultSet(selected.trackingMode),
                      ),
                    },
                  ],
                }));
              }}
            >
              {t("Add")}
            </button>
          </div>
        ) : (
          <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4">
            <h3 className="font-bold text-amber-950">
              {t("No exercises are available")}
            </h3>
            <p className="mt-1 text-sm text-amber-900">
              {t(
                "Create an exercise first, then return to build your template.",
              )}
            </p>
            <Link
              className="mt-3 inline-flex rounded-lg bg-amber-900 px-4 py-2 font-semibold text-white"
              href="/workouts/exercises"
            >
              {t("Open exercise library")}
            </Link>
          </div>
        )}
      </section>
      <ol className="space-y-4">
        {value.exercises.map((item, exerciseIndex) => {
          const exercise = exerciseById.get(item.exerciseId);
          if (!exercise) return null;
          const fields = fieldsForTrackingMode(exercise.trackingMode);
          return (
            <li
              className="rounded-2xl border bg-white p-5 shadow-sm"
              key={item.id}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-semibold">{exercise.name}</h2>
                <div className="flex flex-wrap gap-2">
                  {[
                    [t("Move up"), -1],
                    [t("Move down"), 1],
                  ].map(([label, offset]) => (
                    <button
                      className="rounded-lg border px-3 py-2 text-sm font-semibold"
                      type="button"
                      key={String(label)}
                      disabled={
                        exerciseIndex + Number(offset) < 0 ||
                        exerciseIndex + Number(offset) >= value.exercises.length
                      }
                      onClick={() => {
                        const exercises = [...value.exercises];
                        const target = exerciseIndex + Number(offset);
                        [exercises[exerciseIndex], exercises[target]] = [
                          exercises[target],
                          exercises[exerciseIndex],
                        ];
                        setValue({ ...value, exercises });
                      }}
                    >
                      {label}
                    </button>
                  ))}
                  <button
                    className="rounded border border-red-300 px-3 py-2 text-red-700"
                    type="button"
                    onClick={() =>
                      setValue({
                        ...value,
                        exercises: value.exercises.filter(
                          (candidate) => candidate.id !== item.id,
                        ),
                      })
                    }
                  >
                    {t("Remove")}
                  </button>
                </div>
              </div>
              <ol className="mt-3 space-y-3">
                {item.sets.map((set, setIndex) => (
                  <li
                    className="grid gap-2 rounded bg-gray-50 p-3 sm:grid-cols-3"
                    key={set.id}
                  >
                    <span className="font-medium">
                      {t("Set {number}", { number: setIndex + 1 })}
                    </span>
                    {fields.reps ? (
                      <NumberField
                        label={t("Target reps")}
                        value={set.targetReps}
                        onChange={(next) =>
                          updateTargetSet(item.id, set.id, {
                            targetReps: next,
                          })
                        }
                      />
                    ) : null}
                    {fields.load ? (
                      <NumberField
                        label={`${t("Target load")} (${loadUnit})`}
                        value={
                          set.targetLoadGrams === null
                            ? null
                            : convertMass(
                                set.targetLoadGrams,
                                "grams",
                                unitSystem === "us" ? "pounds" : "kilograms",
                                2,
                              )
                        }
                        step={0.5}
                        onChange={(next) => {
                          const targetLoadGrams =
                            next === null
                              ? null
                              : Math.round(
                                  convertMass(
                                    next,
                                    unitSystem === "us"
                                      ? "pounds"
                                      : "kilograms",
                                    "grams",
                                  ),
                                );
                          updateTargetSet(item.id, set.id, {
                            targetLoadGrams,
                          });
                        }}
                      />
                    ) : null}
                    {fields.duration ? (
                      <NumberField
                        label={`${t("Target duration")} (${t("seconds")})`}
                        value={set.targetDurationSeconds}
                        onChange={(next) =>
                          updateTargetSet(item.id, set.id, {
                            targetDurationSeconds: next,
                          })
                        }
                      />
                    ) : null}
                    {fields.distance ? (
                      <NumberField
                        label={`${t("Target distance")} (${distanceUnit})`}
                        step={0.1}
                        value={
                          set.targetDistanceMeters === null
                            ? null
                            : convertDistance(
                                set.targetDistanceMeters,
                                "meters",
                                unitSystem === "us" ? "miles" : "kilometers",
                                2,
                              )
                        }
                        onChange={(next) => {
                          const targetDistanceMeters =
                            next === null
                              ? null
                              : Math.round(
                                  convertDistance(
                                    next,
                                    unitSystem === "us"
                                      ? "miles"
                                      : "kilometers",
                                    "meters",
                                  ),
                                );
                          updateTargetSet(item.id, set.id, {
                            targetDistanceMeters,
                          });
                        }}
                      />
                    ) : null}
                    <NumberField
                      label={t("Target RPE")}
                      value={set.targetRpe}
                      min={1}
                      max={10}
                      step={0.5}
                      optional
                      onChange={(next) =>
                        updateTargetSet(item.id, set.id, { targetRpe: next })
                      }
                    />
                    <button
                      className="rounded border px-3 py-2"
                      type="button"
                      disabled={item.sets.length === 1}
                      onClick={() => {
                        setValue((current) => ({
                          ...current,
                          exercises: current.exercises.map((exercise) =>
                            exercise.id === item.id
                              ? {
                                  ...exercise,
                                  sets: exercise.sets.filter(
                                    (candidate) => candidate.id !== set.id,
                                  ),
                                }
                              : exercise,
                          ),
                        }));
                      }}
                    >
                      {t("Remove set")}
                    </button>
                  </li>
                ))}
              </ol>
              <button
                className="mt-3 rounded border px-3 py-2"
                type="button"
                disabled={item.sets.length >= 20}
                onClick={() => {
                  setValue((current) => ({
                    ...current,
                    exercises: current.exercises.map((candidate) =>
                      candidate.id === item.id
                        ? {
                            ...candidate,
                            sets: [
                              ...candidate.sets,
                              defaultSet(exercise.trackingMode),
                            ],
                          }
                        : candidate,
                    ),
                  }));
                }}
              >
                {t("Add set")}
              </button>
            </li>
          );
        })}
      </ol>
      <button
        className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-60"
        disabled={saving || !value.name.trim()}
        type="button"
        onClick={async () => {
          setSaving(true);
          setMessage(t("Saving..."));
          const result = await saveTemplate({
            ...value,
            exercises: value.exercises.map((item, position) => ({
              ...item,
              position,
              sets: item.sets.map((set, setPosition) => ({
                ...set,
                position: setPosition,
              })),
            })),
          });
          setSaving(false);
          setMessage(result.ok ? t("Template saved.") : t(result.error));
          if (result.ok) router.push("/workouts");
        }}
      >
        {saving ? t("Saving...") : t("Save template")}
      </button>
      <p aria-live="polite">{message}</p>
    </main>
  );
}

function NumberField({
  label,
  value,
  onChange,
  min = 0,
  max,
  step = 1,
  optional = false,
}: {
  label: string;
  value: number | null;
  onChange: (value: number | null) => void;
  min?: number;
  max?: number;
  step?: number;
  optional?: boolean;
}) {
  return (
    <label className="text-sm">
      {label}
      <input
        className="input mt-1"
        type="number"
        min={min}
        max={max}
        step={step}
        required={!optional}
        value={value ?? ""}
        onChange={(event) =>
          onChange(
            event.target.value === "" ? null : Number(event.target.value),
          )
        }
      />
    </label>
  );
}
