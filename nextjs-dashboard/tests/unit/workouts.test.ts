import { describe, expect, it } from "vitest";
import {
  equipmentSuggestions,
  exerciseCategories,
  fieldsForTrackingMode,
  validateRpe,
  validateSetForMode,
  type WorkoutSetInput,
} from "../../app/domain";
import { workoutSetSchema } from "../../app/features/workouts/validation";

const base: WorkoutSetInput = {
  id: "30000000-0000-4000-8000-000000000001",
  position: 0,
  completed: false,
  reps: 8,
  loadGrams: 20_000,
  durationSeconds: null,
  distanceMeters: null,
  elapsedSeconds: 0,
  rpe: 7.5,
  notes: "",
};

describe("workout tracking contracts", () => {
  it("provides guided categories and equipment suggestions", () => {
    expect(exerciseCategories).toEqual([
      "strength",
      "cardio",
      "mobility",
      "balance",
      "sport",
      "other",
    ]);
    expect(equipmentSuggestions).toContain("dumbbell");
    expect(equipmentSuggestions).toContain("machine");
  });

  it("exposes only measurements applicable to each tracking mode", () => {
    expect(fieldsForTrackingMode("reps_load")).toEqual({
      reps: true,
      load: true,
      duration: false,
      distance: false,
    });
    expect(fieldsForTrackingMode("distance_duration")).toEqual({
      reps: false,
      load: false,
      duration: true,
      distance: true,
    });
  });

  it("accepts RPE half steps from one through ten", () => {
    expect(validateRpe(null)).toBe(true);
    expect(validateRpe(1)).toBe(true);
    expect(validateRpe(7.5)).toBe(true);
    expect(validateRpe(10)).toBe(true);
    expect(validateRpe(0)).toBe(false);
    expect(validateRpe(7.25)).toBe(false);
  });

  it("rejects measurements unrelated to the selected mode", () => {
    expect(validateSetForMode("reps_load", base)).toBe(true);
    expect(validateSetForMode("reps", { ...base, loadGrams: null })).toBe(true);
    expect(validateSetForMode("reps", base)).toBe(false);
    expect(
      validateSetForMode("duration", {
        ...base,
        reps: null,
        loadGrams: null,
        durationSeconds: 60,
      }),
    ).toBe(true);
  });

  it("enforces practical set boundaries", () => {
    expect(validateSetForMode("reps_load", { ...base, reps: 1_001 })).toBe(
      false,
    );
    expect(
      validateSetForMode("reps_load", { ...base, notes: "x".repeat(2_001) }),
    ).toBe(false);
    expect(
      validateSetForMode("reps_load", {
        ...base,
        elapsedSeconds: 604_801,
      }),
    ).toBe(false);
  });

  it("allows a planned set to remain blank until it is completed", () => {
    const blank = { ...base, completed: false, reps: null, loadGrams: null };
    expect(validateSetForMode("reps_load", blank)).toBe(true);
    expect(validateSetForMode("reps_load", { ...blank, completed: true })).toBe(
      false,
    );
  });

  it("keeps queued pre-timer mutations compatible", () => {
    const legacySet: Partial<WorkoutSetInput> = { ...base };
    delete legacySet.elapsedSeconds;
    expect(workoutSetSchema.parse(legacySet).elapsedSeconds).toBe(0);
  });
});
