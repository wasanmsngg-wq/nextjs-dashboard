-- Exercise-detail history and personal-best candidates.
-- Both views invoke underlying RLS policies and expose completed history only.
-- Roll-forward recovery: replace either view in a corrective migration if a
-- formula contract changes; do not rewrite immutable workout rows.

create view public.performance_exercise_history
with (security_invoker = true)
as
select
  se.id as session_exercise_id,
  se.exercise_id,
  se.exercise_name_snapshot,
  se.tracking_mode,
  se.status as exercise_status,
  se.completed as exercise_completed,
  se.cancellation_reason,
  s.id as session_id,
  s.template_name_snapshot,
  s.started_at,
  s.completed_at
from public.workout_session_exercises se
join public.workout_sessions s on s.id = se.session_id
where s.status = 'completed' and se.exercise_id is not null;

create view public.performance_exercise_sets
with (security_invoker = true)
as
select
  se.exercise_id,
  se.id as session_exercise_id,
  s.id as session_id,
  ws.id as set_id,
  s.started_at as achieved_at,
  ws.position,
  ws.reps,
  ws.load_grams,
  ws.duration_seconds,
  ws.distance_meters,
  ws.elapsed_seconds,
  ws.rpe,
  case
    when ws.load_grams > 0 and ws.reps = 1 then ws.load_grams::bigint
    when ws.load_grams > 0 and ws.reps between 2 and 10
      then round(ws.load_grams * (1 + ws.reps / 30.0))::bigint
    else null
  end as estimated_one_rep_max_grams,
  case
    when ws.duration_seconds > 0 and ws.distance_meters > 0
      then ws.duration_seconds::numeric / ws.distance_meters
    else null
  end as pace_seconds_per_meter
from public.workout_sets ws
join public.workout_session_exercises se on se.id = ws.session_exercise_id
join public.workout_sessions s on s.id = se.session_id
where s.status = 'completed'
  and se.status <> 'canceled'
  and ws.completed
  and se.exercise_id is not null;

revoke all on public.performance_exercise_history from public, anon;
revoke all on public.performance_exercise_sets from public, anon;
grant select on public.performance_exercise_history to authenticated;
grant select on public.performance_exercise_sets to authenticated;
