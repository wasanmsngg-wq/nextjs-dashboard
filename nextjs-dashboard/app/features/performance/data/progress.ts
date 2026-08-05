import "server-only";

import { redirect } from "next/navigation";
import {
  fillWeeklyPerformanceGaps,
  summarizePerformanceTrend,
  type Locale,
  type WeeklyPerformance,
} from "@/app/domain";
import { createSupabaseServerClient } from "@/app/lib/supabase/server";
import {
  addCalendarDays,
  localCalendarDate,
  startOfIsoWeek,
} from "../date-boundaries";
import type { ProgressFilters } from "../validation";

export async function loadPerformanceProgress(
  filters: ProgressFilters,
  locale: Locale,
) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/workouts/progress");

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
    throw new Error("Performance progress could not be loaded.");

  const exercises = (library ?? [])
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
  const exerciseId = exercises.some(
    (exercise) => exercise.id === filters.exerciseId,
  )
    ? filters.exerciseId
    : undefined;
  const timezone = profile?.timezone ?? "UTC";
  const endDate = localCalendarDate(Date.now(), timezone);
  const firstWeekStart = addCalendarDays(
    startOfIsoWeek(endDate),
    -(filters.weeks - 1) * 7,
  );
  const { data, error } = await supabase.rpc("performance_weekly_summary", {
    requested_start_date: firstWeekStart,
    requested_end_date: endDate,
    requested_exercise_id: exerciseId ?? null,
  });
  if (error) throw new Error("Performance progress could not be loaded.");

  const reportedWeeks: WeeklyPerformance[] = (data ?? []).map((week) => ({
    weekStart: week.week_start,
    sessionCount: Number(week.session_count),
    activeDays: Number(week.active_days),
    volumeGrams: Number(week.volume_grams),
    peakEstimatedOneRepMaxGrams:
      week.peak_estimated_one_rep_max_grams === null
        ? null
        : Number(week.peak_estimated_one_rep_max_grams),
    durationSeconds: Number(week.duration_seconds),
    completedSets: Number(week.completed_sets),
    bodyweightReps: Number(week.bodyweight_reps),
  }));
  const weeks = fillWeeklyPerformanceGaps(
    firstWeekStart,
    filters.weeks,
    reportedWeeks,
  );
  return {
    weeks,
    summary: summarizePerformanceTrend(weeks),
    exercises,
    exerciseId,
    timezone,
    unitSystem: profile?.unit_system ?? "metric",
    startDate: firstWeekStart,
    endDate,
  };
}
