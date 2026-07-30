import { notFound, redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/app/lib/supabase/server";
import { WorkoutSession } from "@/app/features/workouts/ui/workout-session";
import { getLocale, getTranslations } from "@/app/i18n/server";

export default async function WorkoutSessionPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/workouts/sessions/${sessionId}`);
  const [
    { data: session, error: sessionError },
    { data: profile, error: profileError },
    { data: library, error: libraryError },
  ] = await Promise.all([
    supabase
      .from("workout_sessions")
      .select("id,template_name_snapshot,status,version,started_at")
      .eq("id", sessionId)
      .maybeSingle(),
    supabase
      .from("user_profiles")
      .select("unit_system")
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("exercises")
      .select("id,name,name_en,name_th,tracking_mode")
      .is("archived_at", null),
  ]);
  if (sessionError || profileError || libraryError)
    throw new Error("Workout session could not be loaded.");
  if (!session) notFound();
  const locale = await getLocale();
  const { t } = await getTranslations();
  const { data: sessionExercises, error: exercisesError } = await supabase
    .from("workout_session_exercises")
    .select("id,exercise_name_snapshot,tracking_mode,position")
    .eq("session_id", sessionId)
    .order("position");
  const ids = (sessionExercises ?? []).map((exercise) => exercise.id);
  const { data: sets, error: setsError } = ids.length
    ? await supabase
        .from("workout_sets")
        .select(
          "id,session_exercise_id,position,completed,reps,load_grams,duration_seconds,distance_meters,rpe,notes,target_reps,target_load_grams,target_duration_seconds,target_distance_meters,target_rpe",
        )
        .in("session_exercise_id", ids)
        .order("position")
    : { data: [], error: null };
  if (exercisesError || setsError)
    throw new Error("Workout session details could not be loaded.");
  return (
    <WorkoutSession
      sessionId={session.id}
      userId={user.id}
      title={session.template_name_snapshot ?? t("Workout")}
      initialVersion={session.version}
      status={session.status}
      unitSystem={profile?.unit_system ?? "metric"}
      exerciseOptions={(library ?? []).map((exercise) => ({
        id: exercise.id,
        trackingMode: exercise.tracking_mode,
        name:
          exercise.name ??
          (locale === "th" ? exercise.name_th : exercise.name_en) ??
          "",
      }))}
      exercises={(sessionExercises ?? []).map((exercise) => ({
        id: exercise.id,
        name: exercise.exercise_name_snapshot,
        trackingMode: exercise.tracking_mode,
        sets: (sets ?? [])
          .filter((set) => set.session_exercise_id === exercise.id)
          .map((set) => ({
            id: set.id,
            position: set.position,
            completed: set.completed,
            reps: set.reps,
            loadGrams: set.load_grams,
            durationSeconds: set.duration_seconds,
            distanceMeters: set.distance_meters,
            rpe: set.rpe,
            notes: set.notes,
            targetReps: set.target_reps,
            targetLoadGrams: set.target_load_grams,
            targetDurationSeconds: set.target_duration_seconds,
            targetDistanceMeters: set.target_distance_meters,
            targetRpe: set.target_rpe,
          })),
      }))}
    />
  );
}
