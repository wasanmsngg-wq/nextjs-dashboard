import { notFound, redirect } from "next/navigation";
import { TemplateEditor } from "@/app/features/workouts/ui/template-editor";
import { createSupabaseServerClient } from "@/app/lib/supabase/server";
import { getLocale } from "@/app/i18n/server";

export default async function EditTemplatePage({
  params,
}: {
  params: Promise<{ templateId: string }>;
}) {
  const { templateId } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/workouts/templates/${templateId}`);
  const locale = await getLocale();
  const [
    { data: template, error: templateError },
    { data: options, error: optionsError },
    { data: profile, error: profileError },
  ] = await Promise.all([
    supabase
      .from("workout_templates")
      .select("id,name,notes")
      .eq("id", templateId)
      .is("archived_at", null)
      .maybeSingle(),
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
  if (templateError || optionsError || profileError)
    throw new Error("Workout template could not be loaded.");
  if (!template) notFound();
  const { data: templateExercises, error: exercisesError } = await supabase
    .from("workout_template_exercises")
    .select("id,exercise_id,position")
    .eq("template_id", templateId)
    .order("position");
  const ids = (templateExercises ?? []).map((item) => item.id);
  const { data: sets, error: setsError } = ids.length
    ? await supabase
        .from("workout_template_sets")
        .select(
          "id,template_exercise_id,position,target_reps,target_load_grams,target_duration_seconds,target_distance_meters,target_rpe",
        )
        .in("template_exercise_id", ids)
        .order("position")
    : { data: [], error: null };
  if (exercisesError || setsError)
    throw new Error("Workout template details could not be loaded.");
  return (
    <TemplateEditor
      initial={{
        id: template.id,
        name: template.name,
        notes: template.notes,
        exercises: (templateExercises ?? []).map((item) => ({
          id: item.id,
          exerciseId: item.exercise_id,
          sets: (sets ?? [])
            .filter((set) => set.template_exercise_id === item.id)
            .map((set) => ({
              id: set.id,
              targetReps: set.target_reps,
              targetLoadGrams: set.target_load_grams,
              targetDurationSeconds: set.target_duration_seconds,
              targetDistanceMeters: set.target_distance_meters,
              targetRpe: set.target_rpe,
            })),
        })),
      }}
      exerciseOptions={(options ?? []).map((exercise) => ({
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
