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
  cancelWorkoutExercise,
  completeWorkout,
  discardWorkout,
  removeWorkoutExercise,
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
import { Button } from "@/app/ui/atoms/button";
import { Surface } from "@/app/ui/atoms/surface";
import { Dialog } from "@/app/ui/molecules/dialog";
import { Toast, type ToastNotice } from "@/app/ui/molecules/toast";

type SessionSet = WorkoutSetInput & {
  targetReps: number | null;
  targetLoadGrams: number | null;
  targetDurationSeconds: number | null;
  targetDistanceMeters: number | null;
  targetRpe: number | null;
};

type SessionExercise = {
  id: string;
  name: string;
  trackingMode: TrackingMode;
  status: "active" | "canceled";
  cancellationReason: string | null;
  canceledAt: string | null;
  sets: SessionSet[];
};
type ExerciseOption = {
  id: string;
  name: string;
  trackingMode: TrackingMode;
};

type SessionDialog =
  | { kind: "remove" | "cancel"; exerciseId: string }
  | { kind: "complete" | "discard" | "replace" }
  | null;

type ActiveSetTimer = {
  exerciseId: string;
  setId: string;
  startedAt: number;
  baseSeconds: number;
};

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
  const [notice, setNotice] = useState<ToastNotice | null>(null);
  const [selectedExercise, setSelectedExercise] = useState(
    exerciseOptions[0]?.id ?? "",
  );
  const [setCount, setSetCount] = useState(3);
  const [dialog, setDialog] = useState<SessionDialog>(null);
  const [cancellationReason, setCancellationReason] = useState("");
  const [completionReasons, setCompletionReasons] = useState<
    Record<string, string>
  >({});
  const [dialogPending, setDialogPending] = useState(false);
  const [activeTimer, setActiveTimer] = useState<ActiveSetTimer | null>(null);
  const [timerNow, setTimerNow] = useState(() => Date.now());
  const version = useRef(initialVersion);
  const syncPromise = useRef<Promise<void> | null>(null);
  const pendingSetWrites = useRef(new Set<Promise<void>>());
  const editable = sessionStatus === "in_progress";

  const notify = useCallback((type: ToastNotice["type"], message: string) => {
    setNotice({ id: Date.now(), type, message });
  }, []);

  const updateAutosave = useCallback(
    (next: WorkoutAutosaveState) => {
      setAutosave(next);
      if (next === "saved") notify("success", t("Changes saved."));
      if (next === "offline")
        notify("warning", t("Offline — changes will retry when connected."));
      if (next === "conflict")
        notify(
          "warning",
          t("This workout changed elsewhere. Reload the server copy."),
        );
      if (next === "error")
        notify("error", t("Save failed. Your changes remain on this device."));
    },
    [notify, t],
  );

  useEffect(() => {
    if (!activeTimer) return;
    const interval = window.setInterval(() => setTimerNow(Date.now()), 1_000);
    return () => window.clearInterval(interval);
  }, [activeTimer]);

  const syncQueue = useCallback(async () => {
    if (syncPromise.current) return syncPromise.current;
    if (!navigator.onLine) return;
    const operation = (async () => {
      try {
        while (true) {
          const queued = await listWorkoutMutations(userId, sessionId);
          if (!queued.length) break;
          for (const mutation of queued) {
            updateAutosave("saving");
            const result = await saveWorkoutSet({
              ...mutation,
              expectedVersion: version.current,
            });
            if (!result.ok) {
              updateAutosave(result.conflict ? "conflict" : "error");
              return;
            }
            version.current = result.version ?? version.current;
            await removeWorkoutMutation(mutation.mutationId);
          }
        }
        updateAutosave("saved");
      } catch {
        updateAutosave(navigator.onLine ? "error" : "offline");
      }
    })();
    syncPromise.current = operation;
    try {
      await operation;
    } finally {
      if (syncPromise.current === operation) syncPromise.current = null;
    }
  }, [sessionId, updateAutosave, userId]);

  useEffect(() => {
    if (!editable) return;
    const online = () => void syncQueue();
    const offline = () => updateAutosave("offline");
    window.addEventListener("online", online);
    window.addEventListener("offline", offline);
    return () => {
      window.removeEventListener("online", online);
      window.removeEventListener("offline", offline);
    };
  }, [editable, syncQueue, updateAutosave]);

  function queueSet(set: WorkoutSetInput) {
    const operation = (async () => {
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
        if (!navigator.onLine) {
          updateAutosave("offline");
          return;
        }
        await syncQueue();
      } catch {
        updateAutosave("error");
      }
    })();
    pendingSetWrites.current.add(operation);
    void operation.finally(() => pendingSetWrites.current.delete(operation));
    return operation;
  }

  async function flushPendingSetWrites() {
    await Promise.all([...pendingSetWrites.current]);
    await syncQueue();
  }

  async function replaceWithDeviceCopy() {
    updateAutosave("saving");
    try {
      const queued = await listWorkoutMutations(userId, sessionId);
      for (const mutation of queued) {
        const result = await replaceWorkoutSet(mutation);
        if (!result.ok) {
          updateAutosave("error");
          return;
        }
        version.current = result.version ?? version.current;
        await removeWorkoutMutation(mutation.mutationId);
      }
      updateAutosave("saved");
      router.refresh();
    } catch {
      updateAutosave("error");
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

  async function addExercise() {
    const selected = exerciseOptions.find(
      (exercise) => exercise.id === selectedExercise,
    );
    if (!selected) return;
    const result = await addWorkoutExercise(
      sessionId,
      selectedExercise,
      setCount,
    );
    notify(
      result.ok ? "success" : "error",
      t(result.ok ? "Exercise added." : result.error),
    );
    if (!result.ok) return;
    version.current = result.version;
    setExercises((current) => [
      ...current,
      {
        id: result.sessionExerciseId,
        name: selected.name,
        trackingMode: selected.trackingMode,
        status: "active",
        cancellationReason: null,
        canceledAt: null,
        sets: result.setIds.map((id, position) => ({
          id,
          position,
          completed: false,
          reps: null,
          loadGrams: null,
          durationSeconds: null,
          distanceMeters: null,
          elapsedSeconds: 0,
          rpe: null,
          notes: "",
          targetReps: null,
          targetLoadGrams: null,
          targetDurationSeconds: null,
          targetDistanceMeters: null,
          targetRpe: null,
        })),
      },
    ]);
  }

  async function clearQueuedExerciseSets(exercise: SessionExercise) {
    const setIds = new Set(exercise.sets.map((set) => set.id));
    const queued = await listWorkoutMutations(userId, sessionId);
    await Promise.all(
      queued
        .filter((mutation) => setIds.has(mutation.set.id))
        .map((mutation) => removeWorkoutMutation(mutation.mutationId)),
    );
  }

  async function removeExercise(exercise: SessionExercise) {
    setDialogPending(true);
    await flushPendingSetWrites();
    const result = await removeWorkoutExercise(
      sessionId,
      exercise.id,
      version.current,
    );
    setDialogPending(false);
    if (!result.ok) {
      notify("error", t(result.error));
      return;
    }
    version.current = result.version;
    await clearQueuedExerciseSets(exercise);
    setExercises((current) =>
      current.filter((candidate) => candidate.id !== exercise.id),
    );
    setDialog(null);
    notify("success", t("Exercise removed."));
  }

  async function cancelExercise(exercise: SessionExercise) {
    setDialogPending(true);
    await flushPendingSetWrites();
    const result = await cancelWorkoutExercise(
      sessionId,
      exercise.id,
      version.current,
      cancellationReason,
    );
    setDialogPending(false);
    if (!result.ok) {
      notify("error", t(result.error));
      return;
    }
    const normalizedReason = cancellationReason.trim();
    version.current = result.version;
    await clearQueuedExerciseSets(exercise);
    setExercises((current) =>
      current.map((candidate) =>
        candidate.id === exercise.id
          ? {
              ...candidate,
              status: "canceled",
              cancellationReason: normalizedReason,
              canceledAt: new Date().toISOString(),
            }
          : candidate,
      ),
    );
    setDialog(null);
    setCancellationReason("");
    notify("success", t("Exercise canceled and kept in the workout record."));
  }

  function displayedElapsedSeconds(exerciseId: string, set: WorkoutSetInput) {
    if (activeTimer?.exerciseId !== exerciseId || activeTimer.setId !== set.id)
      return set.elapsedSeconds;
    return Math.min(
      604_800,
      activeTimer.baseSeconds +
        Math.floor((timerNow - activeTimer.startedAt) / 1_000),
    );
  }

  function startSetTimer(exerciseId: string, set: WorkoutSetInput) {
    if (activeTimer) return;
    setTimerNow(Date.now());
    setActiveTimer({
      exerciseId,
      setId: set.id,
      startedAt: Date.now(),
      baseSeconds: set.elapsedSeconds,
    });
  }

  function stopSetTimer(exerciseId: string, set: WorkoutSetInput) {
    if (activeTimer?.exerciseId !== exerciseId || activeTimer.setId !== set.id)
      return;
    const elapsedSeconds = displayedElapsedSeconds(exerciseId, set);
    setActiveTimer(null);
    updateSet(exerciseId, set.id, { elapsedSeconds }, true);
    notify("success", t("Set timer saved."));
  }

  function resetSetTimer(exerciseId: string, set: WorkoutSetInput) {
    if (activeTimer?.setId === set.id) setActiveTimer(null);
    updateSet(exerciseId, set.id, { elapsedSeconds: 0 }, true);
    notify("info", t("Set timer reset."));
  }

  const dialogExercise =
    dialog && "exerciseId" in dialog
      ? (exercises.find((exercise) => exercise.id === dialog.exerciseId) ??
        null)
      : null;
  const unfinishedExercises = exercises.filter(
    (exercise) =>
      exercise.status === "active" &&
      exercise.sets.some((set) => !set.completed),
  );
  const completionReasonsValid = unfinishedExercises.every((exercise) => {
    const length = completionReasons[exercise.id]?.trim().length ?? 0;
    return length >= 3 && length <= 500;
  });

  async function confirmWorkoutCompletion() {
    if (activeTimer) return;
    setDialogPending(true);
    await flushPendingSetWrites();
    const cancellations = unfinishedExercises.map((exercise) => ({
      exerciseId: exercise.id,
      reason: completionReasons[exercise.id]?.trim() ?? "",
    }));
    const result = await completeWorkout(
      sessionId,
      crypto.randomUUID(),
      cancellations,
    );
    setDialogPending(false);
    notify(
      result.ok ? "success" : "error",
      t(result.ok ? "Workout completed." : result.error),
    );
    if (!result.ok) return;
    setDialog(null);
    setExercises((current) =>
      current.map((exercise) => {
        const cancellation = cancellations.find(
          (item) => item.exerciseId === exercise.id,
        );
        return cancellation
          ? {
              ...exercise,
              status: "canceled",
              cancellationReason: cancellation.reason,
              canceledAt: new Date().toISOString(),
            }
          : exercise;
      }),
    );
    setCompletionReasons({});
    setSessionStatus("completed");
    await purgeWorkoutMutations(userId, sessionId);
    router.refresh();
  }

  async function confirmWorkoutDiscard() {
    setDialogPending(true);
    const result = await discardWorkout(sessionId);
    setDialogPending(false);
    if (!result.ok) {
      notify("error", t(result.error));
      return;
    }
    setDialog(null);
    setActiveTimer(null);
    await purgeWorkoutMutations(userId, sessionId);
    router.push("/workouts");
  }

  async function confirmDeviceCopyReplacement() {
    setDialogPending(true);
    await replaceWithDeviceCopy();
    setDialogPending(false);
    setDialog(null);
  }

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
        <Surface as="section">
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
            <Button disabled={!selectedExercise} onClick={addExercise}>
              {t("Add")}
            </Button>
          </div>
        </Surface>
      ) : null}
      <ol className="space-y-5">
        {exercises.map((exercise) => {
          const fields = fieldsForTrackingMode(exercise.trackingMode);
          const exerciseEditable = editable && exercise.status === "active";
          const plannedExercise = exercise.sets.some(hasPlannedTarget);
          return (
            <Surface
              as="li"
              className="overflow-hidden"
              padding="none"
              key={exercise.id}
            >
              <div className="flex flex-wrap items-start justify-between gap-3 border-b bg-gray-50 px-5 py-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-bold text-gray-950">
                      {exercise.name}
                    </h2>
                    {exercise.status === "canceled" ? (
                      <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-amber-900">
                        {t("Canceled")}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-sm font-medium text-gray-600">
                    {t("{completed} of {total} sets complete", {
                      completed: exercise.sets.filter((set) => set.completed)
                        .length,
                      total: exercise.sets.length,
                    })}
                    <span aria-hidden="true"> · </span>
                    {t("Exercise time: {time}", {
                      time: formatElapsedTime(
                        exercise.sets.reduce(
                          (total, set) =>
                            total + displayedElapsedSeconds(exercise.id, set),
                          0,
                        ),
                      ),
                    })}
                  </p>
                </div>
                {exerciseEditable ? (
                  <div className="flex flex-wrap gap-1">
                    {!plannedExercise ? (
                      <Button
                        size="small"
                        variant="quiet"
                        onClick={() => {
                          setDialog({
                            exerciseId: exercise.id,
                            kind: "remove",
                          });
                          setCancellationReason("");
                        }}
                      >
                        {t("Remove")}
                      </Button>
                    ) : null}
                    <Button
                      size="small"
                      variant="quiet"
                      onClick={() => {
                        setDialog({
                          exerciseId: exercise.id,
                          kind: "cancel",
                        });
                        setCancellationReason("");
                      }}
                    >
                      {t("Cancel exercise")}
                    </Button>
                  </div>
                ) : null}
              </div>
              {exercise.status === "canceled" ? (
                <div className="border-b border-amber-200 bg-amber-50 px-5 py-3">
                  <p className="text-sm font-semibold text-amber-950">
                    {t("Cancellation reason")}
                  </p>
                  <p className="mt-1 text-sm text-amber-900">
                    {exercise.cancellationReason}
                  </p>
                </div>
              ) : null}
              <ol className="mt-3 space-y-3">
                {exercise.sets.map((set, index) => {
                  const setTimerActive =
                    activeTimer?.exerciseId === exercise.id &&
                    activeTimer.setId === set.id;
                  const elapsedSeconds = displayedElapsedSeconds(
                    exercise.id,
                    set,
                  );
                  return (
                    <li
                      className="mx-4 rounded-xl border border-gray-200 bg-gray-50 p-4"
                      key={set.id}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <label className="flex min-h-11 items-center gap-2 font-semibold">
                          <input
                            type="checkbox"
                            className="h-5 w-5"
                            checked={set.completed}
                            disabled={
                              !exerciseEditable ||
                              setTimerActive ||
                              (!set.completed &&
                                !hasRequiredActual(exercise.trackingMode, set))
                            }
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
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className="min-w-20 font-mono text-sm font-bold text-slate-700"
                            aria-label={t("Set time: {time}", {
                              time: formatElapsedTime(elapsedSeconds),
                            })}
                          >
                            {formatElapsedTime(elapsedSeconds)}
                          </span>
                          {exerciseEditable ? (
                            setTimerActive ? (
                              <Button
                                size="small"
                                variant="secondary"
                                onClick={() => stopSetTimer(exercise.id, set)}
                              >
                                {t("Stop timer")}
                              </Button>
                            ) : (
                              <Button
                                size="small"
                                variant="secondary"
                                disabled={activeTimer !== null}
                                onClick={() => startSetTimer(exercise.id, set)}
                              >
                                {t("Start timer")}
                              </Button>
                            )
                          ) : null}
                          {exerciseEditable && elapsedSeconds > 0 ? (
                            <Button
                              size="small"
                              variant="quiet"
                              disabled={activeTimer !== null && !setTimerActive}
                              onClick={() => resetSetTimer(exercise.id, set)}
                            >
                              {t("Reset")}
                            </Button>
                          ) : null}
                        </div>
                      </div>
                      <div className="mt-2">
                        <PlannedTarget
                          set={set}
                          unitSystem={unitSystem}
                          translate={t}
                        />
                        <div>
                          {hasPlannedTarget(set) ? (
                            <h3 className="mt-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                              {t("Actual result")}
                            </h3>
                          ) : null}
                          <div className="mt-2 grid items-end gap-3 sm:grid-cols-2 lg:grid-cols-4">
                            {fields.reps ? (
                              <SetNumber
                                label={t("Reps")}
                                value={set.reps}
                                disabled={!exerciseEditable}
                                onChange={(next) =>
                                  updateSet(exercise.id, set.id, { reps: next })
                                }
                                onSave={() =>
                                  saveCurrentSet(exercise.id, set.id)
                                }
                              />
                            ) : null}
                            {fields.load ? (
                              <SetNumber
                                label={`${t("Load")} (${loadUnit})`}
                                step={0.5}
                                disabled={!exerciseEditable}
                                value={
                                  set.loadGrams === null
                                    ? null
                                    : convertMass(
                                        set.loadGrams,
                                        "grams",
                                        unitSystem === "us"
                                          ? "pounds"
                                          : "kilograms",
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
                                onSave={() =>
                                  saveCurrentSet(exercise.id, set.id)
                                }
                              />
                            ) : null}
                            {fields.duration ? (
                              <SetNumber
                                label={`${t("Duration")} (${t("seconds")})`}
                                value={set.durationSeconds}
                                disabled={!exerciseEditable}
                                onChange={(next) =>
                                  updateSet(exercise.id, set.id, {
                                    durationSeconds: next,
                                  })
                                }
                                onSave={() =>
                                  saveCurrentSet(exercise.id, set.id)
                                }
                              />
                            ) : null}
                            {fields.distance ? (
                              <SetNumber
                                label={`${t("Distance")} (${distanceUnit})`}
                                step={0.1}
                                disabled={!exerciseEditable}
                                value={
                                  set.distanceMeters === null
                                    ? null
                                    : convertDistance(
                                        set.distanceMeters,
                                        "meters",
                                        unitSystem === "us"
                                          ? "miles"
                                          : "kilometers",
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
                                onSave={() =>
                                  saveCurrentSet(exercise.id, set.id)
                                }
                              />
                            ) : null}
                            <SetNumber
                              label="RPE"
                              min={1}
                              max={10}
                              step={0.5}
                              value={set.rpe}
                              disabled={!exerciseEditable}
                              optional
                              onChange={(next) =>
                                updateSet(exercise.id, set.id, { rpe: next })
                              }
                              onSave={() => saveCurrentSet(exercise.id, set.id)}
                            />
                            <label className="text-sm sm:col-span-2 lg:col-span-4">
                              {t("Set notes")}
                              <input
                                className="input mt-1"
                                maxLength={2_000}
                                value={set.notes}
                                disabled={!exerciseEditable}
                                onChange={(event) =>
                                  updateSet(exercise.id, set.id, {
                                    notes: event.target.value,
                                  })
                                }
                                onBlur={() =>
                                  saveCurrentSet(exercise.id, set.id)
                                }
                              />
                            </label>
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ol>
              <div className="h-4" />
            </Surface>
          );
        })}
      </ol>
      {!exercises.length ? (
        <div className="space-y-1 text-slate-600">
          <p>{t("Add an exercise to begin.")}</p>
          <p className="text-sm">
            {t("Add at least one exercise before completing this workout.")}
          </p>
        </div>
      ) : null}
      {editable ? (
        <div className="fixed inset-x-0 bottom-0 z-30 flex flex-wrap justify-center gap-3 border-t bg-white/95 p-3 shadow-[0_-8px_30px_rgba(15,23,42,0.12)] backdrop-blur sm:sticky sm:rounded-2xl sm:border">
          <Button
            disabled={!exercises.length}
            onClick={() => {
              setCompletionReasons(
                Object.fromEntries(
                  unfinishedExercises.map((exercise) => [exercise.id, ""]),
                ),
              );
              setDialog({ kind: "complete" });
            }}
          >
            {t("Complete workout")}
          </Button>
          <Button
            onClick={() => setDialog({ kind: "discard" })}
            variant="danger"
          >
            {t("Discard workout")}
          </Button>
          {autosave === "error" || autosave === "conflict" ? (
            <Button onClick={syncQueue} variant="secondary">
              {t("Retry save")}
            </Button>
          ) : null}
          {autosave === "conflict" ? (
            <>
              <Button
                onClick={async () => {
                  await purgeWorkoutMutations(userId, sessionId);
                  router.refresh();
                }}
                variant="secondary"
              >
                {t("Reload server copy")}
              </Button>
              <Button
                onClick={() => setDialog({ kind: "replace" })}
                variant="secondary"
              >
                {t("Keep this device copy")}
              </Button>
            </>
          ) : null}
        </div>
      ) : null}
      <Toast notice={notice} />
      <Dialog
        open={dialog?.kind === "remove"}
        title={t("Remove this exercise?")}
        confirmLabel={t("Remove exercise")}
        cancelLabel={t("Keep exercise")}
        confirmVariant="danger"
        loading={dialogPending}
        onCancel={() => setDialog(null)}
        onConfirm={() => {
          if (dialogExercise) void removeExercise(dialogExercise);
        }}
      >
        <p className="text-slate-600">
          {t(
            "Only an exercise without recorded results can be removed. Use cancel to preserve recorded work.",
          )}
        </p>
      </Dialog>
      <Dialog
        open={dialog?.kind === "cancel"}
        title={t("Cancel exercise")}
        confirmLabel={t("Cancel exercise")}
        cancelLabel={t("Keep exercise")}
        confirmVariant="danger"
        confirmDisabled={cancellationReason.trim().length < 3}
        loading={dialogPending}
        onCancel={() => {
          setDialog(null);
          setCancellationReason("");
        }}
        onConfirm={() => {
          if (dialogExercise) void cancelExercise(dialogExercise);
        }}
      >
        <label className="text-sm font-semibold text-slate-800">
          {t("Why are you canceling this exercise?")}
          <textarea
            className="input mt-2 min-h-28"
            minLength={3}
            maxLength={500}
            required
            value={cancellationReason}
            onChange={(event) => setCancellationReason(event.target.value)}
          />
        </label>
        <p className="mt-2 text-sm text-slate-500">
          {t(
            "The reason is saved with this workout and cannot be removed from its history.",
          )}
        </p>
      </Dialog>
      <Dialog
        open={dialog?.kind === "complete"}
        title={t(
          unfinishedExercises.length
            ? "Cancel unfinished exercises?"
            : "Complete this workout?",
        )}
        confirmLabel={t("Complete workout")}
        cancelLabel={t("Continue workout")}
        confirmDisabled={activeTimer !== null || !completionReasonsValid}
        loading={dialogPending}
        onCancel={() => {
          setDialog(null);
          setCompletionReasons({});
        }}
        onConfirm={() => void confirmWorkoutCompletion()}
      >
        {activeTimer ? (
          <p className="text-slate-600">
            {t("Stop the active set timer before completing this workout.")}
          </p>
        ) : unfinishedExercises.length ? (
          <>
            <p className="text-slate-600">
              {t(
                "Unfinished exercises will be canceled and kept in workout history. Enter a reason for each one.",
              )}
            </p>
            <div className="mt-4 max-h-[50vh] space-y-4 overflow-y-auto pr-1">
              {unfinishedExercises.map((exercise) => (
                <label
                  className="block text-sm font-semibold text-slate-800"
                  key={exercise.id}
                >
                  {t("Reason for {exercise}", { exercise: exercise.name })}
                  <textarea
                    className="input mt-2 min-h-24"
                    minLength={3}
                    maxLength={500}
                    required
                    value={completionReasons[exercise.id] ?? ""}
                    onChange={(event) =>
                      setCompletionReasons((current) => ({
                        ...current,
                        [exercise.id]: event.target.value,
                      }))
                    }
                  />
                </label>
              ))}
            </div>
          </>
        ) : (
          <p className="text-slate-600">
            {t("The completed workout becomes read-only.")}
          </p>
        )}
      </Dialog>
      <Dialog
        open={dialog?.kind === "discard"}
        title={t("Discard this workout?")}
        confirmLabel={t("Discard workout")}
        cancelLabel={t("Continue workout")}
        confirmVariant="danger"
        loading={dialogPending}
        onCancel={() => setDialog(null)}
        onConfirm={() => void confirmWorkoutDiscard()}
      >
        <p className="text-slate-600">{t("This cannot be undone.")}</p>
      </Dialog>
      <Dialog
        open={dialog?.kind === "replace"}
        title={t("Replace the server workout?")}
        confirmLabel={t("Keep this device copy")}
        cancelLabel={t("Cancel")}
        loading={dialogPending}
        onCancel={() => setDialog(null)}
        onConfirm={() => void confirmDeviceCopyReplacement()}
      >
        <p className="text-slate-600">
          {t("The server workout will be replaced with this device copy.")}
        </p>
      </Dialog>
    </main>
  );
}

function formatElapsedTime(totalSeconds: number) {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safeSeconds / 3_600);
  const minutes = Math.floor((safeSeconds % 3_600) / 60);
  const seconds = safeSeconds % 60;
  return hours > 0
    ? [hours, minutes, seconds]
        .map((part) => String(part).padStart(2, "0"))
        .join(":")
    : [minutes, seconds].map((part) => String(part).padStart(2, "0")).join(":");
}

function hasRequiredActual(mode: TrackingMode, set: WorkoutSetInput) {
  const fields = fieldsForTrackingMode(mode);
  return (
    (!fields.reps || set.reps !== null) &&
    (!fields.load || set.loadGrams !== null) &&
    (!fields.duration || set.durationSeconds !== null) &&
    (!fields.distance || set.distanceMeters !== null)
  );
}

function hasPlannedTarget(set: SessionSet) {
  return (
    set.targetReps !== null ||
    set.targetLoadGrams !== null ||
    set.targetDurationSeconds !== null ||
    set.targetDistanceMeters !== null ||
    set.targetRpe !== null
  );
}

function PlannedTarget({
  set,
  unitSystem,
  translate,
}: {
  set: SessionSet;
  unitSystem: UnitSystem;
  translate: (key: string, values?: Record<string, string | number>) => string;
}) {
  const values: string[] = [];
  if (set.targetReps !== null)
    values.push(`${set.targetReps} ${translate("Reps").toLocaleLowerCase()}`);
  if (set.targetLoadGrams !== null) {
    const unit = unitSystem === "us" ? "lb" : "kg";
    values.push(
      `${convertMass(
        set.targetLoadGrams,
        "grams",
        unitSystem === "us" ? "pounds" : "kilograms",
        2,
      )} ${unit}`,
    );
  }
  if (set.targetDurationSeconds !== null)
    values.push(
      `${set.targetDurationSeconds} ${translate("seconds").toLocaleLowerCase()}`,
    );
  if (set.targetDistanceMeters !== null) {
    const unit = unitSystem === "us" ? "mi" : "km";
    values.push(
      `${convertDistance(
        set.targetDistanceMeters,
        "meters",
        unitSystem === "us" ? "miles" : "kilometers",
        2,
      )} ${unit}`,
    );
  }
  if (set.targetRpe !== null) values.push(`RPE ${set.targetRpe}`);
  if (!values.length) return null;
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
        {translate("Planned target")}
      </span>
      {values.map((value) => (
        <span
          className="rounded-full bg-blue-50 px-2.5 py-1 text-sm font-semibold text-blue-900"
          key={value}
        >
          {value}
        </span>
      ))}
    </div>
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
