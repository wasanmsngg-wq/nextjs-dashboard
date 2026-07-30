export const trackingModes = [
  "reps_load",
  "reps",
  "duration",
  "distance_duration",
] as const;

export type TrackingMode = (typeof trackingModes)[number];
export const exerciseCategories = [
  "strength",
  "cardio",
  "mobility",
  "balance",
  "sport",
  "other",
] as const;
export type ExerciseCategory = (typeof exerciseCategories)[number];

export const equipmentSuggestions = [
  "bodyweight",
  "barbell",
  "dumbbell",
  "kettlebell",
  "machine",
  "cable",
  "resistance band",
  "bench",
  "pull-up bar",
  "cardio machine",
  "bicycle",
] as const;
export type WorkoutSessionStatus = "in_progress" | "completed";
export type WorkoutAutosaveState =
  "idle" | "saving" | "saved" | "offline" | "error" | "conflict";

export type WorkoutSetInput = {
  id: string;
  position: number;
  completed: boolean;
  reps: number | null;
  loadGrams: number | null;
  durationSeconds: number | null;
  distanceMeters: number | null;
  rpe: number | null;
  notes: string;
};

export type WorkoutMutation = {
  schemaVersion: 1;
  mutationId: string;
  userId: string;
  sessionId: string;
  expectedVersion: number;
  set: WorkoutSetInput;
};

export const WORKOUT_QUEUE_DATABASE = "exercise-tracker-workout-queue-v1";
export const WORKOUT_QUEUE_STORE = "mutations";

export function fieldsForTrackingMode(mode: TrackingMode) {
  return {
    reps: mode === "reps_load" || mode === "reps",
    load: mode === "reps_load",
    duration: mode === "duration" || mode === "distance_duration",
    distance: mode === "distance_duration",
  };
}

export function validateRpe(value: number | null): boolean {
  return (
    value === null ||
    (Number.isFinite(value) &&
      value >= 1 &&
      value <= 10 &&
      Number.isInteger(value * 2))
  );
}

export function validateSetForMode(
  mode: TrackingMode,
  set: WorkoutSetInput,
): boolean {
  const fields = fieldsForTrackingMode(mode);
  if (!Number.isInteger(set.position) || set.position < 0 || set.position > 999)
    return false;
  if (set.notes.length > 2_000 || !validateRpe(set.rpe)) return false;
  if (
    (fields.reps
      ? set.reps === null ||
        !Number.isInteger(set.reps) ||
        set.reps < 0 ||
        set.reps > 1_000
      : set.reps !== null) ||
    (fields.load
      ? set.loadGrams === null ||
        !Number.isInteger(set.loadGrams) ||
        set.loadGrams < 0 ||
        set.loadGrams > 2_000_000
      : set.loadGrams !== null) ||
    (fields.duration
      ? set.durationSeconds === null ||
        !Number.isInteger(set.durationSeconds) ||
        set.durationSeconds < 0 ||
        set.durationSeconds > 604_800
      : set.durationSeconds !== null) ||
    (fields.distance
      ? set.distanceMeters === null ||
        !Number.isInteger(set.distanceMeters) ||
        set.distanceMeters < 0 ||
        set.distanceMeters > 1_000_000
      : set.distanceMeters !== null)
  )
    return false;
  return true;
}
