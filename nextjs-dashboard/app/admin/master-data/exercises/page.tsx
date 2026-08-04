import { requireAdministrator } from "@/app/features/admin/data";
import { SystemExerciseManager } from "@/app/features/admin/ui/system-exercise-manager";
import { getTranslations } from "@/app/i18n/server";
import { BackNavigation } from "@/app/ui/molecules/back-navigation";
import { PageHeading } from "@/app/ui/molecules/page-heading";

export default async function AdminSystemExercisesPage() {
  const [{ supabase }, { locale, t }] = await Promise.all([
    requireAdministrator(),
    getTranslations(),
  ]);
  const [
    { data: exercises, error },
    { data: categories, error: categoryError },
  ] = await Promise.all([
    supabase
      .from("exercises")
      .select(
        "id,system_key,name_en,name_th,tracking_mode,category,equipment,archived_at",
      )
      .is("user_id", null)
      .order("system_key"),
    supabase
      .from("exercise_categories")
      .select("key,name_en,name_th,archived_at")
      .order("sort_order")
      .order("key"),
  ]);
  if (error || categoryError)
    throw new Error("System exercises are temporarily unavailable.");
  return (
    <main className="mx-auto max-w-7xl space-y-6">
      <BackNavigation href="/admin">
        {t("Back to administration")}
      </BackNavigation>
      <PageHeading
        eyebrow={t("Master data")}
        title={t("System exercises")}
        description={t(
          "Maintain bilingual exercises shared by every registered user. Archived items remain in existing plans and history.",
        )}
      />
      <SystemExerciseManager
        categories={(categories ?? []).map((category) => ({
          key: category.key,
          name: locale === "th" ? category.name_th : category.name_en,
          archived: Boolean(category.archived_at),
        }))}
        exercises={(exercises ?? []).map((exercise) => ({
          id: exercise.id,
          systemKey: exercise.system_key ?? "",
          nameEn: exercise.name_en ?? "",
          nameTh: exercise.name_th ?? "",
          trackingMode: exercise.tracking_mode,
          category: exercise.category,
          equipment: exercise.equipment,
          archived: Boolean(exercise.archived_at),
        }))}
      />
    </main>
  );
}
