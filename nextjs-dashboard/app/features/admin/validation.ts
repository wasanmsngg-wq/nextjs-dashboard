import { z } from "zod";
import { trackingModes } from "@/app/domain";

export const adminSearchSchema = z.string().trim().max(80).catch("");

export const categoryInputSchema = z.object({
  key: z
    .string()
    .trim()
    .min(1)
    .max(40)
    .regex(/^[a-z][a-z0-9-]*$/),
  nameEn: z.string().trim().min(1).max(80),
  nameTh: z.string().trim().min(1).max(80),
  sortOrder: z.coerce.number().int().min(0).max(999),
});

export const systemExerciseInputSchema = z.object({
  id: z.string().uuid().optional(),
  systemKey: z
    .string()
    .trim()
    .min(1)
    .max(80)
    .regex(/^[a-z][a-z0-9-]*$/),
  nameEn: z.string().trim().min(1).max(80),
  nameTh: z.string().trim().min(1).max(80),
  trackingMode: z.enum(trackingModes),
  category: z.string().trim().min(1).max(40),
  equipment: z.string().trim().max(80),
});
