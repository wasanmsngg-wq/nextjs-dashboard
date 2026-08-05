import { describe, expect, it } from "vitest";
import {
  PERFORMANCE_FORMULA_VERSION,
  calculateSessionDurationSeconds,
  calculateVolume,
  estimateEpleyOneRepMax,
  selectPersonalBests,
} from "../../app/domain";
import { localDateBoundaryUtc } from "../../app/features/performance/date-boundaries";
import {
  historyFiltersSchema,
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

  it("calculates non-negative completed session duration", () => {
    expect(
      calculateSessionDurationSeconds(
        "2026-08-05T01:00:00.000Z",
        "2026-08-05T02:02:03.900Z",
      ),
    ).toBe(3723);
    expect(
      calculateSessionDurationSeconds(
        "2026-08-05T02:00:00.000Z",
        "2026-08-05T01:00:00.000Z",
      ),
    ).toBe(0);
    expect(calculateSessionDurationSeconds("invalid", null)).toBeNull();
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
});
