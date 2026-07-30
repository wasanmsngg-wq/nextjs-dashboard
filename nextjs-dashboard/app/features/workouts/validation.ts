import { z } from "zod";
import { exerciseCategories, trackingModes } from "@/app/domain";

export const uuidSchema = z.string().uuid();
export const workoutNameSchema = z.string().trim().min(1).max(80);
export const workoutNotesSchema = z.string().trim().max(2_000);
export const trackingModeSchema = z.enum(trackingModes);

export const exerciseInputSchema = z.object({
  name: workoutNameSchema,
  trackingMode: trackingModeSchema,
  category: z.enum(exerciseCategories).default("other"),
  equipment: z.string().trim().max(80).default(""),
});

export const templateSetSchema = z.object({
  id: uuidSchema,
  position: z.number().int().min(0).max(19),
  targetReps: z.number().int().min(1).max(1_000).nullable(),
  targetLoadGrams: z.number().int().min(0).max(2_000_000).nullable(),
  targetDurationSeconds: z.number().int().min(1).max(604_800).nullable(),
  targetDistanceMeters: z.number().int().min(1).max(1_000_000).nullable(),
  targetRpe: z
    .number()
    .min(1)
    .max(10)
    .refine((value) => Number.isInteger(value * 2))
    .nullable(),
});

export const templateExerciseSchema = z.object({
  id: uuidSchema,
  exerciseId: uuidSchema,
  position: z.number().int().min(0).max(99),
  sets: z.array(templateSetSchema).min(1).max(20),
});

export const templateInputSchema = z.object({
  id: uuidSchema,
  name: workoutNameSchema,
  notes: workoutNotesSchema,
  exercises: z.array(templateExerciseSchema).max(100),
});

export const workoutSetSchema = z.object({
  id: uuidSchema,
  position: z.number().int().min(0).max(999),
  completed: z.boolean(),
  reps: z.number().int().min(0).max(1_000).nullable(),
  loadGrams: z.number().int().min(0).max(2_000_000).nullable(),
  durationSeconds: z.number().int().min(0).max(604_800).nullable(),
  distanceMeters: z.number().int().min(0).max(1_000_000).nullable(),
  elapsedSeconds: z.number().int().min(0).max(604_800).default(0),
  rpe: z
    .number()
    .min(1)
    .max(10)
    .refine((value) => Number.isInteger(value * 2))
    .nullable(),
  notes: workoutNotesSchema,
});
