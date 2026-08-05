export const PERFORMANCE_FORMULA_VERSION = 1 as const;

export type PerformanceSet = {
  completed: boolean;
  reps: number | null;
  loadGrams: number | null;
  durationSeconds: number | null;
  distanceMeters: number | null;
};

export function calculateVolume(sets: readonly PerformanceSet[]) {
  const qualifying = sets.filter(
    (set) =>
      set.completed &&
      set.reps !== null &&
      set.reps > 0 &&
      set.loadGrams !== null &&
      set.loadGrams > 0,
  );
  return {
    version: PERFORMANCE_FORMULA_VERSION,
    volumeGrams: qualifying.reduce(
      (total, set) => total + set.reps! * set.loadGrams!,
      0,
    ),
    contributingSets: qualifying.length,
  };
}

export function estimateEpleyOneRepMax(
  loadGrams: number | null,
  reps: number | null,
): number | null {
  if (
    loadGrams === null ||
    reps === null ||
    !Number.isInteger(loadGrams) ||
    !Number.isInteger(reps) ||
    loadGrams <= 0 ||
    reps < 1 ||
    reps > 10
  )
    return null;
  return reps === 1 ? loadGrams : Math.round(loadGrams * (1 + reps / 30));
}

export function calculateSessionDurationSeconds(
  startedAt: string,
  completedAt: string | null,
): number | null {
  if (!completedAt) return null;
  const difference = Date.parse(completedAt) - Date.parse(startedAt);
  if (!Number.isFinite(difference)) return null;
  return Math.max(0, Math.floor(difference / 1000));
}
