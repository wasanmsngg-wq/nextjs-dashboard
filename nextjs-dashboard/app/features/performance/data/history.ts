import "server-only";

import { redirect } from "next/navigation";
import { calculateActiveTimeSeconds } from "@/app/domain";
import { createSupabaseServerClient } from "@/app/lib/supabase/server";
import type { Locale } from "@/app/domain";
import type { Database } from "@/app/lib/database.types";
import { localDateBoundaryUtc } from "../date-boundaries";
import type { HistoryFilters } from "../validation";

export const HISTORY_PAGE_SIZE = 20;

export async function loadWorkoutHistory(
  filters: HistoryFilters,
  locale: Locale,
) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/workouts/history");

  const [
    { data: profile, error: profileError },
    { data: library, error: libraryError },
  ] = await Promise.all([
    supabase
      .from("user_profiles")
      .select("timezone,unit_system")
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("exercises")
      .select("id,name,name_en,name_th,archived_at")
      .order("name"),
  ]);
  if (profileError || libraryError)
    throw new Error("Workout history could not be loaded.");

  const timezone = profile?.timezone ?? "UTC";
  let matchingSessionIds: string[] | undefined;
  if (filters.exerciseId) {
    const { data: matches, error } = await supabase
      .from("workout_session_exercises")
      .select("session_id")
      .eq("exercise_id", filters.exerciseId)
      .limit(10_000);
    if (error) throw new Error("Workout history could not be loaded.");
    matchingSessionIds = [
      ...new Set((matches ?? []).map((item) => item.session_id)),
    ];
    if (!matchingSessionIds.length)
      return emptyResult(
        filters.page,
        timezone,
        profile?.unit_system ?? "metric",
        library ?? [],
        locale,
      );
  }

  let sessionsQuery = supabase
    .from("workout_sessions")
    .select("id,template_name_snapshot,notes,started_at,completed_at", {
      count: "exact",
    })
    .eq("status", "completed")
    .order("started_at", { ascending: false });
  if (filters.from)
    sessionsQuery = sessionsQuery.gte(
      "started_at",
      localDateBoundaryUtc(filters.from, timezone),
    );
  if (filters.to)
    sessionsQuery = sessionsQuery.lt(
      "started_at",
      localDateBoundaryUtc(filters.to, timezone, true),
    );
  if (matchingSessionIds)
    sessionsQuery = sessionsQuery.in("id", matchingSessionIds);

  const offset = (filters.page - 1) * HISTORY_PAGE_SIZE;
  const {
    data: sessions,
    error: sessionsError,
    count,
  } = await sessionsQuery.range(offset, offset + HISTORY_PAGE_SIZE - 1);
  if (sessionsError) throw new Error("Workout history could not be loaded.");

  const sessionIds = (sessions ?? []).map((session) => session.id);
  const { data: exercises, error: exercisesError } = sessionIds.length
    ? await supabase
        .from("workout_session_exercises")
        .select(
          "id,session_id,exercise_id,exercise_name_snapshot,status,completed,position",
        )
        .in("session_id", sessionIds)
        .order("position")
    : { data: [], error: null };
  if (exercisesError) throw new Error("Workout history could not be loaded.");

  const exerciseIds = (exercises ?? []).map((exercise) => exercise.id);
  const { data: sets, error: setsError } = exerciseIds.length
    ? await supabase
        .from("workout_sets")
        .select("session_exercise_id,completed,elapsed_seconds")
        .in("session_exercise_id", exerciseIds)
    : { data: [], error: null };
  if (setsError) throw new Error("Workout history could not be loaded.");

  type SelectedExercise = Pick<
    Database["public"]["Tables"]["workout_session_exercises"]["Row"],
    | "id"
    | "session_id"
    | "exercise_id"
    | "exercise_name_snapshot"
    | "status"
    | "completed"
    | "position"
  >;
  type SelectedSet = Pick<
    Database["public"]["Tables"]["workout_sets"]["Row"],
    "session_exercise_id" | "completed" | "elapsed_seconds"
  >;
  const exercisesBySession = new Map<string, SelectedExercise[]>();
  for (const exercise of exercises ?? []) {
    const group = exercisesBySession.get(exercise.session_id) ?? [];
    group.push(exercise);
    exercisesBySession.set(exercise.session_id, group);
  }
  const setsByExercise = new Map<string, SelectedSet[]>();
  for (const set of sets ?? []) {
    const group = setsByExercise.get(set.session_exercise_id) ?? [];
    group.push(set);
    setsByExercise.set(set.session_exercise_id, group);
  }

  return {
    sessions: (sessions ?? []).map((session) => {
      const sessionExercises = exercisesBySession.get(session.id) ?? [];
      const sessionSets = sessionExercises
        .filter((exercise) => exercise.status !== "canceled")
        .flatMap((exercise) => setsByExercise.get(exercise.id) ?? []);
      return {
        ...session,
        durationSeconds: calculateActiveTimeSeconds(
          sessionSets.map((set) => ({
            completed: set.completed,
            elapsedSeconds: set.elapsed_seconds,
          })),
        ),
        exercises: sessionExercises.map((exercise) => ({
          ...exercise,
          completedSets: (setsByExercise.get(exercise.id) ?? []).filter(
            (set) => set.completed,
          ).length,
          totalSets: (setsByExercise.get(exercise.id) ?? []).length,
        })),
        completedSets: sessionSets.filter((set) => set.completed).length,
        totalSets: sessionSets.length,
      };
    }),
    exercises: exerciseOptions(library ?? [], locale),
    timezone,
    unitSystem: profile?.unit_system ?? "metric",
    page: filters.page,
    total: count ?? 0,
    pageCount: Math.max(1, Math.ceil((count ?? 0) / HISTORY_PAGE_SIZE)),
  };
}

function exerciseOptions(
  library: Array<{
    id: string;
    name: string | null;
    name_en: string | null;
    name_th: string | null;
    archived_at: string | null;
  }>,
  locale: Locale,
) {
  return library
    .map((exercise) => ({
      id: exercise.id,
      name:
        exercise.name ??
        (locale === "th" ? exercise.name_th : exercise.name_en) ??
        "",
      archived: Boolean(exercise.archived_at),
    }))
    .filter((exercise) => exercise.name)
    .sort((left, right) => left.name.localeCompare(right.name, locale));
}

function emptyResult(
  page: number,
  timezone: string,
  unitSystem: "metric" | "us",
  library: Parameters<typeof exerciseOptions>[0],
  locale: Locale,
) {
  return {
    sessions: [],
    exercises: exerciseOptions(library, locale),
    timezone,
    unitSystem,
    page,
    total: 0,
    pageCount: 1,
  };
}
