import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/app/lib/supabase/server";
import { getLocale } from "@/app/i18n/server";
import { ExerciseManager } from "@/app/features/exercises/ui/exercise-manager";

export default async function ExercisesPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/workouts/exercises");
  const locale = await getLocale();
  const [{ data, error }, { data: categories, error: categoriesError }] =
    await Promise.all([
      supabase
        .from("exercises")
        .select(
          "id,user_id,name,name_en,name_th,tracking_mode,category,equipment",
        )
        .is("archived_at", null)
        .order("system_key")
        .order("name"),
      supabase
        .from("exercise_categories")
        .select("key,name_en,name_th")
        .is("archived_at", null)
        .order("sort_order")
        .order("key"),
    ]);
  if (error || categoriesError)
    throw new Error("Workout exercises could not be loaded.");
  return (
    <ExerciseManager
      categories={(categories ?? []).map((category) => ({
        key: category.key,
        name: locale === "th" ? category.name_th : category.name_en,
      }))}
      exercises={(data ?? []).map((exercise) => ({
        id: exercise.id,
        name:
          exercise.name ??
          (locale === "th" ? exercise.name_th : exercise.name_en) ??
          "",
        trackingMode: exercise.tracking_mode,
        category: exercise.category,
        equipment: exercise.equipment,
        custom: exercise.user_id !== null,
      }))}
    />
  );
}
