"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/app/lib/supabase/server";
import {
  exerciseInputSchema,
  templateInputSchema,
  uuidSchema,
  workoutSetSchema,
} from "./validation";
import { getOperationalServices } from "@/app/lib/operations/factory";
import { runGuardedOperation } from "@/app/lib/operations/guard";
import { getRequestId } from "@/app/lib/operations/request";
import type { Json } from "@/app/lib/database.types";

type ActionResult<T> =
  { ok: true; data: T } | { ok: false; error: string; conflict?: boolean };

async function authenticatedOperation<T>(
  operation: string,
  execute: (
    supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
    userId: string,
  ) => Promise<T>,
): Promise<ActionResult<T>> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Log in to manage workouts." };
  const { rateLimiter, errorReporter } = getOperationalServices();
  const result = await runGuardedOperation({
    key: user.id,
    policy: "workoutWrite",
    operation,
    rateLimiter,
    errorReporter,
    requestId: await getRequestId(),
    execute: () => execute(supabase, user.id),
  });
  if (!result.ok)
    return {
      ok: false,
      error:
        result.error === "rate_limited"
          ? "Too many workout updates. Wait and try again."
          : "The workout update could not be saved.",
    };
  return { ok: true, data: result.value };
}

export async function saveExercise(formData: FormData) {
  const parsed = exerciseInputSchema.safeParse(Object.fromEntries(formData));
  const id = uuidSchema.safeParse(formData.get("id"));
  if (!parsed.success)
    return { ok: false as const, error: "Check the exercise fields." };
  const result = await authenticatedOperation(
    "exercise.save",
    async (db, userId) => {
      const payload = {
        user_id: userId,
        name: parsed.data.name,
        tracking_mode: parsed.data.trackingMode,
        category: parsed.data.category,
        equipment: parsed.data.equipment,
      };
      return id.success
        ? await db
            .from("exercises")
            .update(payload)
            .eq("id", id.data)
            .eq("user_id", userId)
            .select("id")
            .single()
        : await db.from("exercises").insert(payload).select("id").single();
    },
  );
  if (!result.ok || result.data.error)
    return { ok: false as const, error: "The exercise could not be saved." };
  revalidatePath("/workouts/exercises");
  return { ok: true as const, id: result.data.data.id };
}

export async function archiveExercise(id: string) {
  if (!uuidSchema.safeParse(id).success)
    return { ok: false as const, error: "The exercise could not be archived." };
  const result = await authenticatedOperation(
    "exercise.archive",
    async (db, userId) =>
      db
        .from("exercises")
        .update({ archived_at: new Date().toISOString() })
        .eq("id", id)
        .eq("user_id", userId),
  );
  if (!result.ok || result.data.error)
    return { ok: false as const, error: "The exercise could not be archived." };
  revalidatePath("/workouts/exercises");
  return { ok: true as const };
}

export async function saveTemplate(input: unknown) {
  const parsed = templateInputSchema.safeParse(input);
  if (!parsed.success)
    return { ok: false as const, error: "Check the template fields." };
  const result = await authenticatedOperation("template.save", async (db) =>
    db.rpc("save_workout_template", {
      requested_template_id: parsed.data.id,
      requested_name: parsed.data.name,
      requested_notes: parsed.data.notes,
      requested_exercises: parsed.data.exercises as unknown as Json,
    }),
  );
  if (!result.ok || result.data.error)
    return { ok: false as const, error: "The template could not be saved." };
  revalidatePath("/workouts");
  revalidatePath(`/workouts/templates/${parsed.data.id}`);
  return { ok: true as const, id: parsed.data.id };
}

export async function archiveTemplate(id: string) {
  if (!uuidSchema.safeParse(id).success)
    return { ok: false as const, error: "The template could not be archived." };
  const result = await authenticatedOperation(
    "template.archive",
    async (db, userId) =>
      db
        .from("workout_templates")
        .update({ archived_at: new Date().toISOString() })
        .eq("id", id)
        .eq("user_id", userId),
  );
  if (!result.ok || result.data.error)
    return { ok: false as const, error: "The template could not be archived." };
  revalidatePath("/workouts");
  return { ok: true as const };
}

export async function duplicateTemplate(id: string, name: string) {
  const source = uuidSchema.safeParse(id);
  const parsedName = templateInputSchema.shape.name.safeParse(name);
  if (!source.success || !parsedName.success)
    return {
      ok: false as const,
      error: "The template could not be duplicated.",
    };
  const newId = crypto.randomUUID();
  const result = await authenticatedOperation(
    "template.duplicate",
    async (db) =>
      db.rpc("duplicate_workout_template", {
        source_template_id: source.data,
        requested_template_id: newId,
        requested_name: parsedName.data,
      }),
  );
  if (!result.ok || result.data.error)
    return {
      ok: false as const,
      error: "The template could not be duplicated.",
    };
  revalidatePath("/workouts");
  return { ok: true as const, id: newId };
}

export async function startWorkout(templateId?: string) {
  if (templateId && !uuidSchema.safeParse(templateId).success)
    return { ok: false as const, error: "The workout could not be started." };
  const sessionId = crypto.randomUUID();
  const result = await authenticatedOperation("workout.start", async (db) =>
    db.rpc("start_workout", {
      requested_session_id: sessionId,
      requested_template_id: templateId ?? null,
    }),
  );
  if (!result.ok || result.data.error)
    return { ok: false as const, error: "The workout could not be started." };
  revalidatePath("/workouts");
  return { ok: true as const, id: result.data.data };
}

export async function addWorkoutExercise(
  sessionId: string,
  exerciseId: string,
  setCount: number,
) {
  if (
    !uuidSchema.safeParse(sessionId).success ||
    !uuidSchema.safeParse(exerciseId).success ||
    !Number.isInteger(setCount) ||
    setCount < 1 ||
    setCount > 20
  )
    return { ok: false as const, error: "Check the exercise and set count." };
  const result = await authenticatedOperation(
    "workout.addExercise",
    async (db) =>
      db.rpc("add_workout_exercise", {
        requested_session_id: sessionId,
        requested_session_exercise_id: crypto.randomUUID(),
        requested_exercise_id: exerciseId,
        requested_set_ids: Array.from({ length: setCount }, () =>
          crypto.randomUUID(),
        ),
      }),
  );
  if (!result.ok || result.data.error)
    return { ok: false as const, error: "The exercise could not be added." };
  revalidatePath(`/workouts/sessions/${sessionId}`);
  return { ok: true as const };
}

export async function saveWorkoutSet(input: {
  mutationId: string;
  sessionId: string;
  expectedVersion: number;
  set: unknown;
}) {
  const mutation = uuidSchema.safeParse(input.mutationId);
  const session = uuidSchema.safeParse(input.sessionId);
  const set = workoutSetSchema.safeParse(input.set);
  if (
    !mutation.success ||
    !session.success ||
    !Number.isInteger(input.expectedVersion) ||
    input.expectedVersion < 1 ||
    !set.success
  )
    return { ok: false as const, error: "Check the workout set values." };
  const result = await authenticatedOperation("workout.saveSet", async (db) =>
    db.rpc("save_workout_set", {
      requested_mutation_id: mutation.data,
      requested_session_id: session.data,
      requested_expected_version: input.expectedVersion,
      requested_set_id: set.data.id,
      requested_completed: set.data.completed,
      requested_reps: set.data.reps,
      requested_load_grams: set.data.loadGrams,
      requested_duration_seconds: set.data.durationSeconds,
      requested_distance_meters: set.data.distanceMeters,
      requested_rpe: set.data.rpe,
      requested_notes: set.data.notes,
    }),
  );
  if (!result.ok) return { ok: false as const, error: result.error };
  if (result.data.error)
    return {
      ok: false as const,
      error:
        result.data.error.code === "40001"
          ? "This workout changed on another device."
          : "The workout set could not be saved.",
      conflict: result.data.error.code === "40001",
    };
  return { ok: true as const, version: result.data.data };
}

export async function replaceWorkoutSet(input: {
  mutationId: string;
  sessionId: string;
  set: unknown;
}) {
  const session = uuidSchema.safeParse(input.sessionId);
  if (!session.success)
    return { ok: false as const, error: "The workout set could not be saved." };
  const supabase = await createSupabaseServerClient();
  const { data: current } = await supabase
    .from("workout_sessions")
    .select("version")
    .eq("id", session.data)
    .eq("status", "in_progress")
    .maybeSingle();
  if (!current)
    return { ok: false as const, error: "The workout set could not be saved." };
  return saveWorkoutSet({ ...input, expectedVersion: current.version });
}

export async function completeWorkout(sessionId: string, mutationId: string) {
  if (
    !uuidSchema.safeParse(sessionId).success ||
    !uuidSchema.safeParse(mutationId).success
  )
    return { ok: false as const, error: "The workout could not be completed." };
  const result = await authenticatedOperation("workout.complete", async (db) =>
    db.rpc("complete_workout", {
      requested_session_id: sessionId,
      requested_mutation_id: mutationId,
    }),
  );
  if (!result.ok || result.data.error)
    return { ok: false as const, error: "The workout could not be completed." };
  revalidatePath("/workouts");
  revalidatePath(`/workouts/sessions/${sessionId}`);
  return { ok: true as const };
}

export async function discardWorkout(sessionId: string) {
  if (!uuidSchema.safeParse(sessionId).success)
    return { ok: false as const, error: "The workout could not be discarded." };
  const result = await authenticatedOperation("workout.discard", async (db) =>
    db.rpc("discard_workout", { requested_session_id: sessionId }),
  );
  if (!result.ok || result.data.error)
    return { ok: false as const, error: "The workout could not be discarded." };
  revalidatePath("/workouts");
  return { ok: true as const };
}
