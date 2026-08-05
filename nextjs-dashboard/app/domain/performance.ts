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

export type WeeklyPerformance = {
  weekStart: string;
  sessionCount: number;
  activeDays: number;
  volumeGrams: number;
  peakEstimatedOneRepMaxGrams: number | null;
  durationSeconds: number;
  completedSets: number;
  bodyweightReps: number;
};

export type PerformanceTrendSummary = Omit<WeeklyPerformance, "weekStart"> & {
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

export function summarizePerformanceTrend(
  weeks: readonly WeeklyPerformance[],
): PerformanceTrendSummary {
  return weeks.reduce<PerformanceTrendSummary>(
    (summary, week) => ({
      version: PERFORMANCE_FORMULA_VERSION,
      sessionCount: summary.sessionCount + week.sessionCount,
      activeDays: summary.activeDays + week.activeDays,
      volumeGrams: summary.volumeGrams + week.volumeGrams,
      peakEstimatedOneRepMaxGrams:
        week.peakEstimatedOneRepMaxGrams === null
          ? summary.peakEstimatedOneRepMaxGrams
          : Math.max(
              summary.peakEstimatedOneRepMaxGrams ?? 0,
              week.peakEstimatedOneRepMaxGrams,
            ),
      durationSeconds: summary.durationSeconds + week.durationSeconds,
      completedSets: summary.completedSets + week.completedSets,
      bodyweightReps: summary.bodyweightReps + week.bodyweightReps,
    }),
    {
      version: PERFORMANCE_FORMULA_VERSION,
      sessionCount: 0,
      activeDays: 0,
      volumeGrams: 0,
      peakEstimatedOneRepMaxGrams: null,
      durationSeconds: 0,
      completedSets: 0,
      bodyweightReps: 0,
    },
  );
}

export function fillWeeklyPerformanceGaps(
  startDate: string,
  weekCount: number,
  rows: readonly WeeklyPerformance[],
) {
  const byWeek = new Map(rows.map((row) => [row.weekStart, row]));
  const start = Date.parse(`${startDate}T00:00:00Z`);
  return Array.from({ length: weekCount }, (_, index) => {
    const weekStart = new Date(start + index * 7 * 86_400_000)
      .toISOString()
      .slice(0, 10);
    return (
      byWeek.get(weekStart) ?? {
        weekStart,
        sessionCount: 0,
        activeDays: 0,
        volumeGrams: 0,
        peakEstimatedOneRepMaxGrams: null,
        durationSeconds: 0,
        completedSets: 0,
        bodyweightReps: 0,
      }
    );
  });
}
