import "server-only";

import { notFound } from "next/navigation";
import { getAuthorization } from "@/app/lib/authorization";
import { adminSearchSchema } from "./validation";

export async function requireAdministrator() {
  const authorization = await getAuthorization();
  if (!authorization.user || !authorization.isAdmin) notFound();
  return {
    supabase: authorization.supabase,
    user: authorization.user,
  };
}

export async function loadAdminUsers(query: string) {
  const { supabase } = await requireAdministrator();
  const search = adminSearchSchema.parse(query);
  const { data, error } = await supabase.rpc("admin_list_users", {
    search_text: search,
    result_limit: 100,
    result_offset: 0,
  });
  if (error) throw new Error("The user directory is temporarily unavailable.");
  return data ?? [];
}

export async function loadExerciseRecords(query: string) {
  const { supabase } = await requireAdministrator();
  const search = adminSearchSchema.parse(query).toLocaleLowerCase();
  const [{ data: sessions, error: sessionsError }, users] = await Promise.all([
    supabase
      .from("workout_sessions")
      .select(
        "id,user_id,status,template_name_snapshot,started_at,completed_at",
      )
      .order("started_at", { ascending: false })
      .limit(100),
    loadAdminUsers(""),
  ]);
  if (sessionsError)
    throw new Error("Exercise records are temporarily unavailable.");
  const sessionIds = (sessions ?? []).map((session) => session.id);
  if (!sessionIds.length) return [];

  const { data: exercises, error: exercisesError } = await supabase
    .from("workout_session_exercises")
    .select(
      "id,session_id,exercise_name_snapshot,tracking_mode,status,completed,cancellation_reason",
    )
    .in("session_id", sessionIds)
    .order("position");
  if (exercisesError)
    throw new Error("Exercise records are temporarily unavailable.");
  const exerciseIds = (exercises ?? []).map((exercise) => exercise.id);
  const { data: sets, error: setsError } = exerciseIds.length
    ? await supabase
        .from("workout_sets")
        .select(
          "session_exercise_id,completed,reps,load_grams,duration_seconds,distance_meters,elapsed_seconds,rpe",
        )
        .in("session_exercise_id", exerciseIds)
        .order("position")
    : { data: [], error: null };
  if (setsError)
    throw new Error("Exercise records are temporarily unavailable.");

  const sessionById = new Map((sessions ?? []).map((item) => [item.id, item]));
  const userById = new Map(users.map((item) => [item.user_id, item]));
  type SelectedSet = NonNullable<typeof sets>[number];
  const setsByExercise = new Map<string, SelectedSet[]>();
  for (const set of sets ?? []) {
    const group = setsByExercise.get(set.session_exercise_id) ?? [];
    group.push(set);
    setsByExercise.set(set.session_exercise_id, group);
  }

  return (exercises ?? [])
    .map((exercise) => {
      const session = sessionById.get(exercise.session_id)!;
      const user = userById.get(session.user_id);
      return {
        ...exercise,
        session,
        user: {
          email: user?.email ?? "",
          displayName: user?.display_name ?? "",
        },
        sets: setsByExercise.get(exercise.id) ?? [],
      };
    })
    .filter((record) => {
      if (!search) return true;
      return [
        record.exercise_name_snapshot,
        record.session.template_name_snapshot ?? "",
        record.user.email,
        record.user.displayName,
      ].some((value) => value.toLocaleLowerCase().includes(search));
    });
}
