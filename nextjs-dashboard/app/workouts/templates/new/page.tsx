import { redirect } from "next/navigation";
import { TemplateEditor } from "@/app/features/workouts/ui/template-editor";
import { createSupabaseServerClient } from "@/app/lib/supabase/server";
import { getLocale } from "@/app/i18n/server";

export default async function NewTemplatePage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/workouts/templates/new");
  const locale = await getLocale();
  const [{ data: exercises }, { data: profile }] = await Promise.all([
    supabase
      .from("exercises")
      .select("id,name,name_en,name_th,tracking_mode")
      .is("archived_at", null),
    supabase
      .from("user_profiles")
      .select("unit_system")
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);
  return (
    <TemplateEditor
      initial={{
        id: crypto.randomUUID(),
        name: "",
        notes: "",
        exercises: [],
      }}
      exerciseOptions={(exercises ?? []).map((exercise) => ({
        id: exercise.id,
        name:
          exercise.name ??
          (locale === "th" ? exercise.name_th : exercise.name_en) ??
          "",
        trackingMode: exercise.tracking_mode,
      }))}
      unitSystem={profile?.unit_system ?? "metric"}
    />
  );
}
