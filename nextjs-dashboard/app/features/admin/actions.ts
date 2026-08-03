"use server";

import { revalidatePath } from "next/cache";
import { getAuthorization } from "@/app/lib/authorization";
import { getOperationalServices } from "@/app/lib/operations/factory";
import { runGuardedOperation } from "@/app/lib/operations/guard";
import { getRequestId } from "@/app/lib/operations/request";
import { categoryInputSchema, systemExerciseInputSchema } from "./validation";

type AdminActionResult = { ok: true } | { ok: false; error: string };

async function runAdminWrite(
  operation: string,
  execute: (
    db: Awaited<ReturnType<typeof getAuthorization>>["supabase"],
  ) => PromiseLike<{ error: { message: string } | null }>,
): Promise<AdminActionResult> {
  const { supabase, user, isAdmin } = await getAuthorization();
  if (!user || !isAdmin)
    return { ok: false, error: "Administrator access is required." };

  const { rateLimiter, errorReporter } = getOperationalServices();
  const guarded = await runGuardedOperation({
    key: user.id,
    policy: "adminWrite",
    operation,
    rateLimiter,
    errorReporter,
    requestId: await getRequestId(),
    execute: async () => await execute(supabase),
  });
  if (!guarded.ok)
    return {
      ok: false,
      error:
        guarded.error === "rate_limited"
          ? "Too many admin updates. Wait and try again."
          : "The admin update could not be saved.",
    };
  if (guarded.value.error)
    return { ok: false, error: "The admin update could not be saved." };
  return { ok: true };
}

export async function saveExerciseCategory(
  input: unknown,
): Promise<AdminActionResult> {
  const parsed = categoryInputSchema.safeParse(input);
  if (!parsed.success)
    return { ok: false, error: "Check the category fields." };

  const result = await runAdminWrite("admin.category.save", (db) =>
    db.from("exercise_categories").upsert(
      {
        key: parsed.data.key,
        name_en: parsed.data.nameEn,
        name_th: parsed.data.nameTh,
        sort_order: parsed.data.sortOrder,
        archived_at: null,
      },
      { onConflict: "key" },
    ),
  );
  if (result.ok) {
    revalidatePath("/admin");
    revalidatePath("/admin/master-data/categories");
  }
  return result;
}

export async function setExerciseCategoryArchived(
  key: string,
  archived: boolean,
): Promise<AdminActionResult> {
  const parsed = categoryInputSchema.shape.key.safeParse(key);
  if (!parsed.success || (archived && parsed.data === "other"))
    return { ok: false, error: "The category could not be updated." };
  const result = await runAdminWrite("admin.category.archive", (db) =>
    db
      .from("exercise_categories")
      .update({ archived_at: archived ? new Date().toISOString() : null })
      .eq("key", parsed.data),
  );
  if (result.ok) {
    revalidatePath("/admin");
    revalidatePath("/admin/master-data/categories");
  }
  return result;
}

export async function saveSystemExercise(
  input: unknown,
): Promise<AdminActionResult> {
  const parsed = systemExerciseInputSchema.safeParse(input);
  if (!parsed.success)
    return { ok: false, error: "Check the exercise fields." };

  const { supabase, user, isAdmin } = await getAuthorization();
  if (!user || !isAdmin)
    return { ok: false, error: "Administrator access is required." };
  const { data: activeCategory, error: categoryError } = await supabase
    .from("exercise_categories")
    .select("key")
    .eq("key", parsed.data.category)
    .is("archived_at", null)
    .maybeSingle();
  if (categoryError || !activeCategory)
    return { ok: false, error: "Choose an active exercise category." };

  const payload = {
    user_id: null,
    system_key: parsed.data.systemKey,
    name: null,
    name_en: parsed.data.nameEn,
    name_th: parsed.data.nameTh,
    tracking_mode: parsed.data.trackingMode,
    category: parsed.data.category,
    equipment: parsed.data.equipment,
    archived_at: null,
  } as const;
  const result = await runAdminWrite("admin.exercise.save", (db) =>
    parsed.data.id
      ? db
          .from("exercises")
          .update(payload)
          .eq("id", parsed.data.id)
          .is("user_id", null)
      : db.from("exercises").insert(payload),
  );
  if (result.ok) {
    revalidatePath("/admin");
    revalidatePath("/admin/master-data/exercises");
    revalidatePath("/workouts");
    revalidatePath("/workouts/exercises");
  }
  return result;
}

export async function setSystemExerciseArchived(
  id: string,
  archived: boolean,
): Promise<AdminActionResult> {
  const parsed = systemExerciseInputSchema.shape.id.safeParse(id);
  if (!parsed.success || !parsed.data)
    return { ok: false, error: "The exercise could not be updated." };
  const exerciseId = parsed.data;
  const result = await runAdminWrite("admin.exercise.archive", (db) =>
    db
      .from("exercises")
      .update({ archived_at: archived ? new Date().toISOString() : null })
      .eq("id", exerciseId)
      .is("user_id", null),
  );
  if (result.ok) {
    revalidatePath("/admin");
    revalidatePath("/admin/master-data/exercises");
    revalidatePath("/workouts");
    revalidatePath("/workouts/exercises");
  }
  return result;
}
