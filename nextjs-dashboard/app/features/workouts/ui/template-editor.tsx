"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  convertDistance,
  convertMass,
  fieldsForTrackingMode,
  type TrackingMode,
  type UnitSystem,
} from "@/app/domain";
import { saveTemplate } from "../actions";
import { useI18n } from "@/app/i18n/provider";

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
  const [message, setMessage] = useState("");
  const exerciseById = new Map(exerciseOptions.map((item) => [item.id, item]));
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
  return (
    <main className="space-y-6 p-4 md:p-8">
      <h1 className="text-2xl font-semibold">
        {initial.name
          ? t("Edit workout template")
          : t("Create workout template")}
      </h1>
      <div className="grid max-w-3xl gap-4">
        <label>
          {t("Template name")}
          <input
            className="mt-1 w-full rounded border p-2"
            value={value.name}
            maxLength={80}
            onInput={(event) =>
              setValue((current) => ({
                ...current,
                name: event.currentTarget.value,
              }))
            }
          />
        </label>
        <label>
          {t("Notes")}
          <textarea
            className="mt-1 w-full rounded border p-2"
            value={value.notes}
            maxLength={2_000}
            onInput={(event) =>
              setValue((current) => ({
                ...current,
                notes: event.currentTarget.value,
              }))
            }
          />
        </label>
      </div>
      <div className="flex max-w-3xl flex-wrap gap-2">
        <label className="grow">
          {t("Add exercise")}
          <select
            className="mt-1 w-full rounded border p-2"
            value={selectedExercise}
            onChange={(event) => setSelectedExercise(event.target.value)}
          >
            {exerciseOptions.map((exercise) => (
              <option key={exercise.id} value={exercise.id}>
                {exercise.name}
              </option>
            ))}
          </select>
        </label>
        <button
          className="self-end rounded border px-4 py-2"
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
      <ol className="max-w-3xl space-y-4">
        {value.exercises.map((item, exerciseIndex) => {
          const exercise = exerciseById.get(item.exerciseId);
          if (!exercise) return null;
          const fields = fieldsForTrackingMode(exercise.trackingMode);
          return (
            <li className="rounded-lg border bg-white p-4" key={item.id}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-semibold">{exercise.name}</h2>
                <div className="flex flex-wrap gap-2">
                  {[
                    [t("Move up"), -1],
                    [t("Move down"), 1],
                  ].map(([label, offset]) => (
                    <button
                      className="rounded border px-3 py-2"
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
                        onChange={(next) => (set.targetReps = next)}
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
                          set.targetLoadGrams =
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
                        }}
                      />
                    ) : null}
                    {fields.duration ? (
                      <NumberField
                        label={`${t("Target duration")} (${t("seconds")})`}
                        value={set.targetDurationSeconds}
                        onChange={(next) => (set.targetDurationSeconds = next)}
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
                          set.targetDistanceMeters =
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
                      onChange={(next) => (set.targetRpe = next)}
                    />
                    <button
                      className="rounded border px-3 py-2"
                      disabled={item.sets.length === 1}
                      onClick={() => {
                        item.sets = item.sets.filter(
                          (candidate) => candidate.id !== set.id,
                        );
                        setValue({ ...value });
                      }}
                    >
                      {t("Remove set")}
                    </button>
                  </li>
                ))}
              </ol>
              <button
                className="mt-3 rounded border px-3 py-2"
                disabled={item.sets.length >= 20}
                onClick={() => {
                  item.sets.push(defaultSet(exercise.trackingMode));
                  setValue({ ...value });
                }}
              >
                {t("Add set")}
              </button>
            </li>
          );
        })}
      </ol>
      <button
        className="rounded bg-blue-600 px-5 py-3 font-medium text-white"
        onClick={async () => {
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
          setMessage(result.ok ? t("Template saved.") : t(result.error));
          if (result.ok) router.push("/workouts");
        }}
      >
        {t("Save template")}
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
        className="mt-1 w-full rounded border p-2"
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
