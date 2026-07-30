import Link from "next/link";
import { createSupabaseServerClient } from "@/app/lib/supabase/server";
import { WorkoutHome } from "@/app/features/workouts/ui/workout-home";
import { getTranslations } from "@/app/i18n/server";

export default async function WorkoutsPage() {
  const supabase = await createSupabaseServerClient();
  const { t } = await getTranslations();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return (
      <main className="p-8">
        <h1 className="text-2xl font-semibold">{t("Workouts")}</h1>
        <p className="my-4">{t("Log in to plan and track workouts.")}</p>
        <Link className="text-blue-700 underline" href="/login?next=/workouts">
          {t("Log in")}
        </Link>
      </main>
    );
  const [
    { data: templates, error: templatesError },
    { data: active, error: activeError },
  ] = await Promise.all([
    supabase
      .from("workout_templates")
      .select("id,name,notes")
      .is("archived_at", null)
      .order("updated_at", { ascending: false }),
    supabase
      .from("workout_sessions")
      .select("id")
      .eq("status", "in_progress")
      .maybeSingle(),
  ]);
  if (templatesError || activeError)
    throw new Error("Workout overview could not be loaded.");
  return (
    <WorkoutHome templates={templates ?? []} activeSessionId={active?.id} />
  );
}
