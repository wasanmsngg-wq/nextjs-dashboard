export const massUnits = ["grams", "kilograms", "pounds"] as const;
export type MassUnit = (typeof massUnits)[number];

export const distanceUnits = ["meters", "kilometers", "miles"] as const;
export type DistanceUnit = (typeof distanceUnits)[number];

const gramsPerUnit: Record<MassUnit, number> = {
  grams: 1,
  kilograms: 1_000,
  pounds: 453.59237,
};

const metersPerUnit: Record<DistanceUnit, number> = {
  meters: 1,
  kilometers: 1_000,
  miles: 1_609.344,
};

const DEFAULT_DECIMAL_PLACES = 12;
const MAX_DECIMAL_PLACES = 12;

function assertMeasurement(value: number): void {
  if (!Number.isFinite(value) || value < 0) {
    throw new RangeError("Measurement must be a finite, non-negative number.");
  }
}

/**
 * Rounds decimal ties away from zero. Limiting precision keeps the operation
 * within the range where JavaScript numbers can be rounded predictably.
 */
export function roundMeasurement(
  value: number,
  decimalPlaces: number = DEFAULT_DECIMAL_PLACES,
): number {
  if (!Number.isFinite(value)) {
    throw new RangeError("Value must be finite.");
  }
  if (
    !Number.isInteger(decimalPlaces) ||
    decimalPlaces < 0 ||
    decimalPlaces > MAX_DECIMAL_PLACES
  ) {
    throw new RangeError(
      `Decimal places must be an integer from 0 to ${MAX_DECIMAL_PLACES}.`,
    );
  }

  const shiftDecimal = (number: number, places: number): number => {
    const [coefficient, exponent = "0"] = number.toString().split("e");
    return Number(`${coefficient}e${Number(exponent) + places}`);
  };
  const scaled = shiftDecimal(value, decimalPlaces);
  const roundedMagnitude = Math.floor(Math.abs(scaled) + 0.5);

  return shiftDecimal(Math.sign(value) * roundedMagnitude, -decimalPlaces);
}

export function convertMass(
  value: number,
  from: MassUnit,
  to: MassUnit,
  decimalPlaces: number = DEFAULT_DECIMAL_PLACES,
): number {
  assertMeasurement(value);
  return roundMeasurement(
    (value * gramsPerUnit[from]) / gramsPerUnit[to],
    decimalPlaces,
  );
}

export function convertDistance(
  value: number,
  from: DistanceUnit,
  to: DistanceUnit,
  decimalPlaces: number = DEFAULT_DECIMAL_PLACES,
): number {
  assertMeasurement(value);
  return roundMeasurement(
    (value * metersPerUnit[from]) / metersPerUnit[to],
    decimalPlaces,
  );
}
