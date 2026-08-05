import { describe, expect, it } from "vitest";
import {
  PERFORMANCE_FORMULA_VERSION,
  calculateActiveTimeSeconds,
  calculateVolume,
  estimateEpleyOneRepMax,
  fillWeeklyPerformanceGaps,
  selectPersonalBests,
  summarizePerformanceTrend,
} from "../../app/domain";
import {
  localCalendarDate,
  localDateBoundaryUtc,
  startOfIsoWeek,
} from "../../app/features/performance/date-boundaries";
import {
  historyFiltersSchema,
  progressFiltersSchema,
  validateHistoryDateRange,
} from "../../app/features/performance/validation";

describe("performance calculation contract v1", () => {
  it("counts only completed sets with repetitions and external load", () => {
    expect(
      calculateVolume([
        {
          completed: true,
          reps: 8,
          loadGrams: 20_000,
          durationSeconds: null,
          distanceMeters: null,
        },
        {
          completed: false,
          reps: 10,
          loadGrams: 30_000,
          durationSeconds: null,
          distanceMeters: null,
        },
        {
          completed: true,
          reps: 12,
          loadGrams: null,
          durationSeconds: null,
          distanceMeters: null,
        },
      ]),
    ).toEqual({
      version: PERFORMANCE_FORMULA_VERSION,
      volumeGrams: 160_000,
      contributingSets: 1,
    });
  });

  it("uses the bounded Epley v1 estimate", () => {
    expect(estimateEpleyOneRepMax(100_000, 1)).toBe(100_000);
    expect(estimateEpleyOneRepMax(100_000, 5)).toBe(116_667);
    expect(estimateEpleyOneRepMax(100_000, 11)).toBeNull();
    expect(estimateEpleyOneRepMax(null, 5)).toBeNull();
  });

  it("sums only positive elapsed time from completed sets", () => {
    expect(
      calculateActiveTimeSeconds([
        { completed: true, elapsedSeconds: 9 },
        { completed: true, elapsedSeconds: 7 },
        { completed: false, elapsedSeconds: 999 },
        { completed: true, elapsedSeconds: 8 },
        { completed: true, elapsedSeconds: 0 },
        { completed: true, elapsedSeconds: -1 },
        { completed: true, elapsedSeconds: 1.5 },
      ]),
    ).toBe(24);
    expect(calculateActiveTimeSeconds([])).toBe(0);
  });

  it("selects deterministic personal bests and keeps the earliest tie", () => {
    const later = {
      setId: "later",
      sessionId: "session-later",
      achievedAt: "2026-08-02T00:00:00.000Z",
      completed: true,
      reps: 5,
      loadGrams: 100_000,
      durationSeconds: 300,
      distanceMeters: 1_000,
    };
    const earlier = {
      ...later,
      setId: "earlier",
      sessionId: "session-earlier",
      achievedAt: "2026-08-01T00:00:00.000Z",
    };
    const faster = {
      ...later,
      setId: "faster",
      reps: 3,
      loadGrams: 90_000,
      durationSeconds: 240,
    };
    const bests = selectPersonalBests([later, earlier, faster]);
    expect(bests.load?.candidate.setId).toBe("earlier");
    expect(bests.estimatedOneRepMax?.value).toBe(116_667);
    expect(bests.reps?.candidate.setId).toBe("earlier");
    expect(bests.duration?.candidate.setId).toBe("earlier");
    expect(bests.distance?.candidate.setId).toBe("earlier");
    expect(bests.pace?.candidate.setId).toBe("faster");
  });

  it("allows a bodyweight repetition best without inventing load", () => {
    const bests = selectPersonalBests([
      {
        setId: "bodyweight",
        sessionId: "session",
        achievedAt: "2026-08-01T00:00:00.000Z",
        completed: true,
        reps: 20,
        loadGrams: null,
        durationSeconds: null,
        distanceMeters: null,
      },
    ]);
    expect(bests.reps?.value).toBe(20);
    expect(bests.load).toBeUndefined();
    expect(bests.estimatedOneRepMax).toBeUndefined();
  });

  it("ignores incomplete candidates and missing values", () => {
    expect(
      selectPersonalBests([
        {
          setId: "incomplete",
          sessionId: "session",
          achievedAt: "2026-08-01T00:00:00.000Z",
          completed: false,
          reps: 100,
          loadGrams: 100_000,
          durationSeconds: null,
          distanceMeters: null,
        },
      ]),
    ).toEqual({});
  });

  it("summarizes hand-calculated weekly aggregates without inventing values", () => {
    expect(
      summarizePerformanceTrend([
        {
          weekStart: "2026-07-27",
          sessionCount: 2,
          activeDays: 1,
          volumeGrams: 480_000,
          peakEstimatedOneRepMaxGrams: 116_667,
          durationSeconds: 5_400,
          completedSets: 4,
          bodyweightReps: 20,
        },
        {
          weekStart: "2026-08-03",
          sessionCount: 1,
          activeDays: 1,
          volumeGrams: 120_000,
          peakEstimatedOneRepMaxGrams: null,
          durationSeconds: 1_800,
          completedSets: 2,
          bodyweightReps: 12,
        },
      ]),
    ).toEqual({
      version: PERFORMANCE_FORMULA_VERSION,
      sessionCount: 3,
      activeDays: 2,
      volumeGrams: 600_000,
      peakEstimatedOneRepMaxGrams: 116_667,
      durationSeconds: 7_200,
      completedSets: 6,
      bodyweightReps: 32,
    });
  });

  it("fills a bounded large history with explicit empty weeks", () => {
    const weeks = fillWeeklyPerformanceGaps("2026-02-09", 26, [
      {
        weekStart: "2026-08-03",
        sessionCount: 1,
        activeDays: 1,
        volumeGrams: 100_000,
        peakEstimatedOneRepMaxGrams: 50_000,
        durationSeconds: 1_800,
        completedSets: 1,
        bodyweightReps: 0,
      },
    ]);
    expect(weeks).toHaveLength(26);
    expect(weeks[0]).toMatchObject({
      weekStart: "2026-02-09",
      sessionCount: 0,
      peakEstimatedOneRepMaxGrams: null,
    });
    expect(weeks.at(-1)).toMatchObject({
      weekStart: "2026-08-03",
      volumeGrams: 100_000,
    });
  });
});

describe("history filters", () => {
  it("normalizes malformed external values safely", () => {
    expect(
      historyFiltersSchema.parse({
        from: "2026-02-30",
        to: "x",
        exercise: "not-a-uuid",
        page: "-2",
      }),
    ).toEqual({
      from: undefined,
      to: undefined,
      exerciseId: undefined,
      page: 1,
    });
  });

  it("rejects reversed and excessive date ranges", () => {
    expect(
      validateHistoryDateRange(
        historyFiltersSchema.parse({ from: "2026-08-05", to: "2026-08-04" }),
      ),
    ).toBe("The start date must be before the end date.");
    expect(
      validateHistoryDateRange(
        historyFiltersSchema.parse({ from: "2024-01-01", to: "2026-01-02" }),
      ),
    ).toBe("Choose a date range of one year or less.");
  });

  it("converts saved-timezone day boundaries across DST", () => {
    expect(localDateBoundaryUtc("2026-08-05", "Asia/Bangkok")).toBe(
      "2026-08-04T17:00:00.000Z",
    );
    expect(localDateBoundaryUtc("2026-03-08", "America/New_York")).toBe(
      "2026-03-08T05:00:00.000Z",
    );
    expect(localDateBoundaryUtc("2026-03-08", "America/New_York", true)).toBe(
      "2026-03-09T04:00:00.000Z",
    );
  });

  it("derives local dates and ISO week starts deterministically", () => {
    expect(
      localCalendarDate(Date.parse("2026-08-02T18:00:00Z"), "Asia/Bangkok"),
    ).toBe("2026-08-03");
    expect(startOfIsoWeek("2026-08-09")).toBe("2026-08-03");
  });

  it("bounds progress ranges and normalizes external exercise filters", () => {
    expect(
      progressFiltersSchema.parse({ weeks: "26", exercise: "bad" }),
    ).toEqual({ weeks: 26, exerciseId: undefined });
    expect(progressFiltersSchema.parse({ weeks: "52" })).toEqual({
      weeks: 12,
      exerciseId: undefined,
    });
  });
});
