import { describe, expect, it } from "vitest";
import {
  convertDistance,
  convertMass,
  roundMeasurement,
} from "@/app/domain/units";

describe("mass conversions", () => {
  it("uses grams as the canonical metric mass", () => {
    expect(convertMass(1_000, "grams", "kilograms")).toBe(1);
    expect(convertMass(1, "kilograms", "grams")).toBe(1_000);
  });

  it("uses the international avoirdupois pound", () => {
    expect(convertMass(1, "pounds", "grams")).toBe(453.59237);
    expect(convertMass(1, "kilograms", "pounds")).toBe(2.204622621849);
    expect(convertMass(2.204622621849, "pounds", "kilograms", 6)).toBe(1);
  });
});

describe("distance conversions", () => {
  it("uses meters as the canonical metric distance", () => {
    expect(convertDistance(1_000, "meters", "kilometers")).toBe(1);
    expect(convertDistance(1, "kilometers", "meters")).toBe(1_000);
  });

  it("uses the international mile", () => {
    expect(convertDistance(1, "miles", "meters")).toBe(1_609.344);
    expect(convertDistance(5, "kilometers", "miles")).toBe(3.106855961187);
    expect(convertDistance(3.106855961187, "miles", "kilometers", 6)).toBe(5);
  });
});

describe("measurement rounding and validation", () => {
  it("rounds decimal ties away from zero deterministically", () => {
    expect(roundMeasurement(1.005, 2)).toBe(1.01);
    expect(roundMeasurement(-1.005, 2)).toBe(-1.01);
    expect(roundMeasurement(12.3454, 3)).toBe(12.345);
    expect(roundMeasurement(12.3455, 3)).toBe(12.346);
  });

  it("accepts zero and rejects invalid physical measurements", () => {
    expect(convertMass(0, "grams", "pounds")).toBe(0);
    expect(convertDistance(0, "meters", "miles")).toBe(0);

    for (const invalid of [-1, Number.NaN, Infinity, -Infinity]) {
      expect(() => convertMass(invalid, "grams", "pounds")).toThrow(RangeError);
      expect(() => convertDistance(invalid, "meters", "miles")).toThrow(
        RangeError,
      );
    }
  });

  it("rejects invalid rounding inputs and precision", () => {
    expect(() => roundMeasurement(Number.NaN, 2)).toThrow(RangeError);
    expect(() => roundMeasurement(1, -1)).toThrow(RangeError);
    expect(() => roundMeasurement(1, 1.5)).toThrow(RangeError);
    expect(() => roundMeasurement(1, 13)).toThrow(RangeError);
  });
});
