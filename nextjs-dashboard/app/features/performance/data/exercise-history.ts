import "server-only";

import { notFound, redirect } from "next/navigation";
import {
  selectPersonalBests,
  type Locale,
  type PerformanceCandidate,
} from "@/app/domain";
import { createSupabaseServerClient } from "@/app/lib/supabase/server";
import type { Database } from "@/app/lib/database.types";

export const EXERCISE_HISTORY_PAGE_SIZE = 20;

const candidateColumns =
  "set_id,session_id,achieved_at,reps,load_grams,duration_seconds,distance_meters";

export async function loadPerformanceExerciseDirectory(locale: Locale) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/workouts/history/exercises");

  const { data: exercises, error } = await supabase
    .from("exercises")
    .select("id,name,name_en,name_th,archived_at")
    .order("name");
  if (error) throw new Error("Exercise history could not be loaded.");

  return (exercises ?? [])
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

export async function loadExerciseHistory(
  exerciseId: string,
  page: number,
  locale: Locale,
) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/workouts/history/exercises/${exerciseId}`);

  const offset = (page - 1) * EXERCISE_HISTORY_PAGE_SIZE;
  const [
    { data: profile, error: profileError },
    { data: catalogExercise, error: catalogError },
    { data: history, error: historyError, count },
  ] = await Promise.all([
    supabase
      .from("user_profiles")
      .select("timezone,unit_system")
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("exercises")
      .select("id,name,name_en,name_th,archived_at")
      .eq("id", exerciseId)
      .maybeSingle(),
    supabase
      .from("performance_exercise_history")
      .select("*", { count: "exact" })
      .eq("exercise_id", exerciseId)
      .order("started_at", { ascending: false })
      .range(offset, offset + EXERCISE_HISTORY_PAGE_SIZE - 1),
  ]);
  if (profileError || catalogError || historyError)
    throw new Error("Exercise history could not be loaded.");
  if (!catalogExercise && !history?.length) notFound();

  const sessionExerciseIds = (history ?? []).map(
    (entry) => entry.session_exercise_id,
  );
  const { data: sets, error: setsError } = sessionExerciseIds.length
    ? await supabase
        .from("workout_sets")
        .select(
          "id,session_exercise_id,position,completed,reps,load_grams,duration_seconds,distance_meters,elapsed_seconds,rpe,notes",
        )
        .in("session_exercise_id", sessionExerciseIds)
        .order("position")
    : { data: [], error: null };
  if (setsError) throw new Error("Exercise history could not be loaded.");

  const candidateQueries = await Promise.all([
    supabase
      .from("performance_exercise_sets")
      .select(candidateColumns)
      .eq("exercise_id", exerciseId)
      .gt("load_grams", 0)
      .gt("reps", 0)
      .order("load_grams", { ascending: false })
      .order("achieved_at", { ascending: true })
      .limit(1),
    supabase
      .from("performance_exercise_sets")
      .select(candidateColumns)
      .eq("exercise_id", exerciseId)
      .not("estimated_one_rep_max_grams", "is", null)
      .order("estimated_one_rep_max_grams", { ascending: false })
      .order("achieved_at", { ascending: true })
      .limit(1),
    supabase
      .from("performance_exercise_sets")
      .select(candidateColumns)
      .eq("exercise_id", exerciseId)
      .gt("reps", 0)
      .order("reps", { ascending: false })
      .order("achieved_at", { ascending: true })
      .limit(1),
    supabase
      .from("performance_exercise_sets")
      .select(candidateColumns)
      .eq("exercise_id", exerciseId)
      .gt("duration_seconds", 0)
      .order("duration_seconds", { ascending: false })
      .order("achieved_at", { ascending: true })
      .limit(1),
    supabase
      .from("performance_exercise_sets")
      .select(candidateColumns)
      .eq("exercise_id", exerciseId)
      .gt("distance_meters", 0)
      .order("distance_meters", { ascending: false })
      .order("achieved_at", { ascending: true })
      .limit(1),
    supabase
      .from("performance_exercise_sets")
      .select(candidateColumns)
      .eq("exercise_id", exerciseId)
      .not("pace_seconds_per_meter", "is", null)
      .order("pace_seconds_per_meter", { ascending: true })
      .order("achieved_at", { ascending: true })
      .limit(1),
  ]);
  if (candidateQueries.some((query) => query.error))
    throw new Error("Exercise personal bests could not be loaded.");

  const candidates = new Map<string, PerformanceCandidate>();
  for (const row of candidateQueries.flatMap((query) => query.data ?? [])) {
    candidates.set(row.set_id, {
      setId: row.set_id,
      sessionId: row.session_id,
      achievedAt: row.achieved_at,
      completed: true,
      reps: row.reps,
      loadGrams: row.load_grams,
      durationSeconds: row.duration_seconds,
      distanceMeters: row.distance_meters,
    });
  }

  type SelectedSet = Pick<
    Database["public"]["Tables"]["workout_sets"]["Row"],
    | "id"
    | "session_exercise_id"
    | "position"
    | "completed"
    | "reps"
    | "load_grams"
    | "duration_seconds"
    | "distance_meters"
    | "elapsed_seconds"
    | "rpe"
    | "notes"
  >;
  const setsByExercise = new Map<string, SelectedSet[]>();
  for (const set of sets ?? []) {
    const group = setsByExercise.get(set.session_exercise_id) ?? [];
    group.push(set);
    setsByExercise.set(set.session_exercise_id, group);
  }
  const snapshotName = history?.[0]?.exercise_name_snapshot;
  const catalogName =
    catalogExercise?.name ??
    (locale === "th" ? catalogExercise?.name_th : catalogExercise?.name_en) ??
    "";
  return {
    exerciseId,
    name: snapshotName || catalogName,
    archived: Boolean(catalogExercise?.archived_at),
    timezone: profile?.timezone ?? "UTC",
    unitSystem: profile?.unit_system ?? "metric",
    personalBests: selectPersonalBests([...candidates.values()]),
    entries: (history ?? []).map((entry) => ({
      ...entry,
      sets: setsByExercise.get(entry.session_exercise_id) ?? [],
    })),
    page,
    total: count ?? 0,
    pageCount: Math.max(
      1,
      Math.ceil((count ?? 0) / EXERCISE_HISTORY_PAGE_SIZE),
    ),
  };
}
