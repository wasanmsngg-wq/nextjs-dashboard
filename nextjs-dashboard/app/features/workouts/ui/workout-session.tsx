"use client";

import {
  ArrowLeftIcon,
  CheckCircleIcon,
  CloudIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  convertDistance,
  convertMass,
  fieldsForTrackingMode,
  type TrackingMode,
  type UnitSystem,
  type WorkoutAutosaveState,
  type WorkoutMutation,
  type WorkoutSetInput,
} from "@/app/domain";
import {
  addWorkoutExercise,
  completeWorkout,
  discardWorkout,
  replaceWorkoutSet,
  saveWorkoutSet,
} from "../actions";
import {
  enqueueWorkoutMutation,
  listWorkoutMutations,
  purgeWorkoutMutations,
  removeWorkoutMutation,
} from "../data/workout-queue";
import { useI18n } from "@/app/i18n/provider";

type SessionExercise = {
  id: string;
  name: string;
  trackingMode: TrackingMode;
  sets: WorkoutSetInput[];
};
type ExerciseOption = { id: string; name: string };

export function WorkoutSession({
  sessionId,
  userId,
  title,
  initialVersion,
  status,
  exercises: initialExercises,
  exerciseOptions,
  unitSystem,
}: {
  sessionId: string;
  userId: string;
  title: string;
  initialVersion: number;
  status: "in_progress" | "completed";
  exercises: SessionExercise[];
  exerciseOptions: ExerciseOption[];
  unitSystem: UnitSystem;
}) {
  const { t } = useI18n();
  const router = useRouter();
  const [exercises, setExercises] = useState(initialExercises);
  const [sessionStatus, setSessionStatus] = useState(status);
  const [autosave, setAutosave] = useState<WorkoutAutosaveState>("idle");
  const [message, setMessage] = useState("");
  const [selectedExercise, setSelectedExercise] = useState(
    exerciseOptions[0]?.id ?? "",
  );
  const [setCount, setSetCount] = useState(3);
  const version = useRef(initialVersion);
  const syncing = useRef(false);
  const editable = sessionStatus === "in_progress";

  const syncQueue = useCallback(async () => {
    if (syncing.current || !navigator.onLine) return;
    syncing.current = true;
    try {
      while (true) {
        const queued = await listWorkoutMutations(userId, sessionId);
        if (!queued.length) break;
        for (const mutation of queued) {
          setAutosave("saving");
          const result = await saveWorkoutSet({
            ...mutation,
            expectedVersion: version.current,
          });
          if (!result.ok) {
            setAutosave(result.conflict ? "conflict" : "error");
            return;
          }
          version.current = result.version ?? version.current;
          await removeWorkoutMutation(mutation.mutationId);
        }
      }
      setAutosave("saved");
    } catch {
      setAutosave(navigator.onLine ? "error" : "offline");
    } finally {
      syncing.current = false;
    }
  }, [sessionId, userId]);

  useEffect(() => {
    if (!editable) return;
    const online = () => void syncQueue();
    const offline = () => setAutosave("offline");
    window.addEventListener("online", online);
    window.addEventListener("offline", offline);
    return () => {
      window.removeEventListener("online", online);
      window.removeEventListener("offline", offline);
    };
  }, [editable, syncQueue]);

  async function queueSet(set: WorkoutSetInput) {
    const mutation: WorkoutMutation = {
      schemaVersion: 1,
      mutationId: crypto.randomUUID(),
      userId,
      sessionId,
      expectedVersion: version.current,
      set,
    };
    try {
      await enqueueWorkoutMutation(mutation);
      if (!navigator.onLine) return setAutosave("offline");
      await syncQueue();
    } catch {
      setAutosave("error");
    }
  }

  async function replaceWithDeviceCopy() {
    setAutosave("saving");
    try {
      const queued = await listWorkoutMutations(userId, sessionId);
      for (const mutation of queued) {
        const result = await replaceWorkoutSet(mutation);
        if (!result.ok) {
          setAutosave("error");
          return;
        }
        version.current = result.version ?? version.current;
        await removeWorkoutMutation(mutation.mutationId);
      }
      setAutosave("saved");
      router.refresh();
    } catch {
      setAutosave("error");
    }
  }

  function updateSet(
    exerciseId: string,
    setId: string,
    change: Partial<WorkoutSetInput>,
    save = false,
  ) {
    const current = exercises
      .find((exercise) => exercise.id === exerciseId)
      ?.sets.find((set) => set.id === setId);
    if (!current) return;
    const changed = { ...current, ...change };
    setExercises((current) =>
      current.map((exercise) =>
        exercise.id !== exerciseId
          ? exercise
          : {
              ...exercise,
              sets: exercise.sets.map((set) => {
                if (set.id !== setId) return set;
                return changed;
              }),
            },
      ),
    );
    if (save) void queueSet(changed);
  }

  function saveCurrentSet(exerciseId: string, setId: string) {
    const current = exercises
      .find((exercise) => exercise.id === exerciseId)
      ?.sets.find((set) => set.id === setId);
    if (current) void queueSet(current);
  }

  const loadUnit = unitSystem === "us" ? "lb" : "kg";
  const distanceUnit = unitSystem === "us" ? "mi" : "km";
  return (
    <main className="mx-auto max-w-6xl space-y-6 pb-24">
      <header className="rounded-3xl bg-gradient-to-br from-slate-900 to-blue-900 p-6 text-white shadow-lg sm:p-8">
        <Link
          className="inline-flex items-center gap-2 text-sm font-semibold text-blue-100 hover:text-white"
          href="/workouts"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          {t("Back to workouts")}
        </Link>
        <div className="mt-5 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-blue-200">
              {editable ? t("Workout in progress") : t("Workout summary")}
            </p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight">{title}</h1>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-sm font-semibold">
            {editable ? (
              <CloudIcon className="h-5 w-5" />
            ) : (
              <CheckCircleIcon className="h-5 w-5" />
            )}
            {editable
              ? t("Active workout")
              : t("Completed workout — read only")}
          </span>
        </div>
      </header>
      {editable ? (
        <section className="rounded-2xl border bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold">{t("Add another exercise")}</h2>
          <div className="mt-4 grid items-end gap-3 sm:grid-cols-[1fr_auto_auto]">
            <label className="font-semibold text-gray-800">
              {t("Add exercise")}
              <select
                className="input mt-1"
                value={selectedExercise}
                onChange={(event) => setSelectedExercise(event.target.value)}
              >
                {exerciseOptions.map((option) => (
                  <option value={option.id} key={option.id}>
                    {option.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="font-semibold text-gray-800">
              {t("Sets")}
              <input
                className="input mt-1 w-24"
                type="number"
                min={1}
                max={20}
                value={setCount}
                onChange={(event) => setSetCount(Number(event.target.value))}
              />
            </label>
            <button
              className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:bg-gray-300"
              disabled={!selectedExercise}
              onClick={async () => {
                const result = await addWorkoutExercise(
                  sessionId,
                  selectedExercise,
                  setCount,
                );
                setMessage(result.ok ? t("Exercise added.") : t(result.error));
                if (result.ok) router.refresh();
              }}
            >
              {t("Add")}
            </button>
          </div>
        </section>
      ) : null}
      <ol className="space-y-5">
        {exercises.map((exercise) => {
          const fields = fieldsForTrackingMode(exercise.trackingMode);
          return (
            <li
              className="overflow-hidden rounded-2xl border bg-white shadow-sm"
              key={exercise.id}
            >
              <div className="border-b bg-gray-50 px-5 py-4">
                <h2 className="text-lg font-bold text-gray-950">
                  {exercise.name}
                </h2>
              </div>
              <ol className="mt-3 space-y-3">
                {exercise.sets.map((set, index) => (
                  <li
                    className="mx-4 grid items-end gap-3 rounded-xl border border-gray-100 bg-gray-50 p-4 sm:grid-cols-3 lg:grid-cols-6"
                    key={set.id}
                  >
                    <label className="flex min-h-11 items-center gap-2 font-medium">
                      <input
                        type="checkbox"
                        className="h-5 w-5"
                        checked={set.completed}
                        disabled={!editable}
                        onChange={(event) =>
                          updateSet(
                            exercise.id,
                            set.id,
                            { completed: event.target.checked },
                            true,
                          )
                        }
                      />
                      {t("Set {number}", { number: index + 1 })}
                    </label>
                    {fields.reps ? (
                      <SetNumber
                        label={t("Reps")}
                        value={set.reps}
                        disabled={!editable}
                        onChange={(next) =>
                          updateSet(exercise.id, set.id, { reps: next })
                        }
                        onSave={() => saveCurrentSet(exercise.id, set.id)}
                      />
                    ) : null}
                    {fields.load ? (
                      <SetNumber
                        label={`${t("Load")} (${loadUnit})`}
                        step={0.5}
                        disabled={!editable}
                        value={
                          set.loadGrams === null
                            ? null
                            : convertMass(
                                set.loadGrams,
                                "grams",
                                unitSystem === "us" ? "pounds" : "kilograms",
                                2,
                              )
                        }
                        onChange={(next) =>
                          updateSet(exercise.id, set.id, {
                            loadGrams:
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
                                  ),
                          })
                        }
                        onSave={() => saveCurrentSet(exercise.id, set.id)}
                      />
                    ) : null}
                    {fields.duration ? (
                      <SetNumber
                        label={`${t("Duration")} (${t("seconds")})`}
                        value={set.durationSeconds}
                        disabled={!editable}
                        onChange={(next) =>
                          updateSet(exercise.id, set.id, {
                            durationSeconds: next,
                          })
                        }
                        onSave={() => saveCurrentSet(exercise.id, set.id)}
                      />
                    ) : null}
                    {fields.distance ? (
                      <SetNumber
                        label={`${t("Distance")} (${distanceUnit})`}
                        step={0.1}
                        disabled={!editable}
                        value={
                          set.distanceMeters === null
                            ? null
                            : convertDistance(
                                set.distanceMeters,
                                "meters",
                                unitSystem === "us" ? "miles" : "kilometers",
                                2,
                              )
                        }
                        onChange={(next) =>
                          updateSet(exercise.id, set.id, {
                            distanceMeters:
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
                                  ),
                          })
                        }
                        onSave={() => saveCurrentSet(exercise.id, set.id)}
                      />
                    ) : null}
                    <SetNumber
                      label="RPE"
                      min={1}
                      max={10}
                      step={0.5}
                      value={set.rpe}
                      disabled={!editable}
                      optional
                      onChange={(next) =>
                        updateSet(exercise.id, set.id, { rpe: next })
                      }
                      onSave={() => saveCurrentSet(exercise.id, set.id)}
                    />
                    <label className="text-sm sm:col-span-3 lg:col-span-6">
                      {t("Set notes")}
                      <input
                        className="input mt-1"
                        maxLength={2_000}
                        value={set.notes}
                        disabled={!editable}
                        onChange={(event) =>
                          updateSet(exercise.id, set.id, {
                            notes: event.target.value,
                          })
                        }
                        onBlur={() => saveCurrentSet(exercise.id, set.id)}
                      />
                    </label>
                  </li>
                ))}
              </ol>
              <div className="h-4" />
            </li>
          );
        })}
      </ol>
      {!exercises.length ? <p>{t("Add an exercise to begin.")}</p> : null}
      {editable ? (
        <div className="fixed inset-x-0 bottom-0 z-30 flex flex-wrap justify-center gap-3 border-t bg-white/95 p-3 shadow-[0_-8px_30px_rgba(15,23,42,0.12)] backdrop-blur sm:sticky sm:rounded-2xl sm:border">
          <button
            className="rounded-xl bg-green-700 px-5 py-3 font-semibold text-white hover:bg-green-800"
            onClick={async () => {
              if (!confirm(t("Complete this workout?"))) return;
              await syncQueue();
              const result = await completeWorkout(
                sessionId,
                crypto.randomUUID(),
              );
              setMessage(result.ok ? t("Workout completed.") : t(result.error));
              if (result.ok) {
                setSessionStatus("completed");
                await purgeWorkoutMutations(userId, sessionId);
                router.refresh();
              }
            }}
          >
            {t("Complete workout")}
          </button>
          <button
            className="rounded-xl border border-red-300 px-5 py-3 font-semibold text-red-700 hover:bg-red-50"
            onClick={async () => {
              if (!confirm(t("Discard this workout? This cannot be undone.")))
                return;
              const result = await discardWorkout(sessionId);
              if (result.ok) {
                await purgeWorkoutMutations(userId, sessionId);
                router.push("/workouts");
              } else setMessage(t(result.error));
            }}
          >
            {t("Discard workout")}
          </button>
          {autosave === "error" || autosave === "conflict" ? (
            <button className="rounded border px-4 py-2" onClick={syncQueue}>
              {t("Retry save")}
            </button>
          ) : null}
          {autosave === "conflict" ? (
            <>
              <button
                className="rounded border px-4 py-2"
                onClick={async () => {
                  await purgeWorkoutMutations(userId, sessionId);
                  router.refresh();
                }}
              >
                {t("Reload server copy")}
              </button>
              <button
                className="rounded border px-4 py-2"
                onClick={() => {
                  if (
                    confirm(
                      t("Replace the server workout with this device copy?"),
                    )
                  )
                    void replaceWithDeviceCopy();
                }}
              >
                {t("Keep this device copy")}
              </button>
            </>
          ) : null}
        </div>
      ) : null}
      <p aria-live="polite" className="font-medium">
        {autosave === "saving"
          ? t("Saving...")
          : autosave === "saved"
            ? t("Saved")
            : autosave === "offline"
              ? t("Offline — changes will retry when connected.")
              : autosave === "conflict"
                ? t("This workout changed elsewhere. Reload the server copy.")
                : autosave === "error"
                  ? t("Save failed. Your changes remain on this device.")
                  : ""}
      </p>
      <p aria-live="polite">{message}</p>
    </main>
  );
}

function SetNumber({
  label,
  value,
  onChange,
  onSave,
  disabled,
  min = 0,
  max,
  step = 1,
  optional = false,
}: {
  label: string;
  value: number | null;
  onChange: (value: number | null) => void;
  onSave: () => void;
  disabled: boolean;
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
        disabled={disabled}
        required={!optional}
        value={value ?? ""}
        onChange={(event) =>
          onChange(
            event.target.value === "" ? null : Number(event.target.value),
          )
        }
        onBlur={onSave}
      />
    </label>
  );
}
