import { z } from "zod";

const datePattern = /^\d{4}-\d{2}-\d{2}$/;

function isCalendarDate(value: string) {
  if (!datePattern.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

const optionalDate = z
  .string()
  .trim()
  .max(10)
  .refine((value) => value === "" || isCalendarDate(value));

const optionalExerciseId = z.union([z.literal(""), z.string().uuid()]);

export const historyFiltersSchema = z
  .object({
    from: optionalDate.catch(""),
    to: optionalDate.catch(""),
    exercise: optionalExerciseId.catch(""),
    page: z.coerce.number().int().min(1).max(10_000).catch(1),
  })
  .transform((filters) => ({
    from: filters.from || undefined,
    to: filters.to || undefined,
    exerciseId: filters.exercise || undefined,
    page: filters.page,
  }));

export type HistoryFilters = z.infer<typeof historyFiltersSchema>;

export function validateHistoryDateRange(filters: HistoryFilters) {
  if (filters.from && filters.to && filters.from > filters.to)
    return "The start date must be before the end date." as const;
  if (filters.from && filters.to) {
    const days =
      (Date.parse(`${filters.to}T00:00:00Z`) -
        Date.parse(`${filters.from}T00:00:00Z`)) /
      86_400_000;
    if (days > 366) return "Choose a date range of one year or less." as const;
  }
  return null;
}
