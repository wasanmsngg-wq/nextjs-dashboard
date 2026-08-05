export const PERFORMANCE_FORMULA_VERSION = 1 as const;

export type PerformanceSet = {
  completed: boolean;
  reps: number | null;
  loadGrams: number | null;
  durationSeconds: number | null;
  distanceMeters: number | null;
};

export type PerformanceCandidate = PerformanceSet & {
  setId: string;
  sessionId: string;
  achievedAt: string;
};

export const personalBestKinds = [
  "load",
  "estimatedOneRepMax",
  "reps",
  "duration",
  "distance",
  "pace",
] as const;
export type PersonalBestKind = (typeof personalBestKinds)[number];
export type PersonalBest = {
  kind: PersonalBestKind;
  value: number;
  candidate: PerformanceCandidate;
  version: typeof PERFORMANCE_FORMULA_VERSION;
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

export function selectPersonalBests(
  candidates: readonly PerformanceCandidate[],
): Partial<Record<PersonalBestKind, PersonalBest>> {
  const bests: Partial<Record<PersonalBestKind, PersonalBest>> = {};
  const consider = (
    kind: PersonalBestKind,
    value: number | null,
    candidate: PerformanceCandidate,
    lowerIsBetter = false,
  ) => {
    if (value === null || !Number.isFinite(value) || value <= 0) return;
    const current = bests[kind];
    const isBetter =
      !current ||
      (lowerIsBetter ? value < current.value : value > current.value) ||
      (value === current.value &&
        Date.parse(candidate.achievedAt) <
          Date.parse(current.candidate.achievedAt));
    if (isBetter)
      bests[kind] = {
        kind,
        value,
        candidate,
        version: PERFORMANCE_FORMULA_VERSION,
      };
  };

  for (const candidate of candidates) {
    if (!candidate.completed) continue;
    consider(
      "load",
      candidate.reps !== null && candidate.reps > 0
        ? candidate.loadGrams
        : null,
      candidate,
    );
    consider(
      "estimatedOneRepMax",
      estimateEpleyOneRepMax(candidate.loadGrams, candidate.reps),
      candidate,
    );
    consider("reps", candidate.reps, candidate);
    consider("duration", candidate.durationSeconds, candidate);
    consider("distance", candidate.distanceMeters, candidate);
    consider(
      "pace",
      candidate.durationSeconds !== null &&
        candidate.durationSeconds > 0 &&
        candidate.distanceMeters !== null &&
        candidate.distanceMeters > 0
        ? candidate.durationSeconds / candidate.distanceMeters
        : null,
      candidate,
      true,
    );
  }
  return bests;
}
