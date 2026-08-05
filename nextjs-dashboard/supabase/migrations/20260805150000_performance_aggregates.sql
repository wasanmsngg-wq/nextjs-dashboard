-- Weekly performance aggregates use the user's saved timezone and canonical
-- units. The function is read-only and runs as the caller so underlying RLS
-- remains authoritative.
-- Roll-forward recovery: replace this function in a corrective migration;
-- completed workout rows remain immutable and require no data rewrite.

create or replace function public.performance_weekly_summary(
  requested_start_date date,
  requested_end_date date,
  requested_exercise_id uuid default null
)
returns table (
  week_start date,
  session_count bigint,
  active_days bigint,
  volume_grams bigint,
  peak_estimated_one_rep_max_grams bigint,
  duration_seconds bigint,
  completed_sets bigint,
  bodyweight_reps bigint
)
language sql
stable
security invoker
set search_path = ''
as $$
  with profile as (
    select coalesce(
      (
        select timezone
        from public.user_profiles
        where user_id = auth.uid()
      ),
      'UTC'
    ) as timezone
  ),
  filtered_sessions as (
    select
      s.id,
      (s.started_at at time zone p.timezone)::date as local_date,
      date_trunc('week', s.started_at at time zone p.timezone)::date as local_week,
      greatest(
        0,
        floor(extract(epoch from (s.completed_at - s.started_at)))
      )::bigint as session_duration_seconds
    from public.workout_sessions s
    cross join profile p
    where s.user_id = auth.uid()
      and s.status = 'completed'
      and s.completed_at is not null
      and requested_start_date <= requested_end_date
      and requested_end_date - requested_start_date <= 366
      and (s.started_at at time zone p.timezone)::date
        between requested_start_date and requested_end_date
      and (
        requested_exercise_id is null
        or exists (
          select 1
          from public.workout_session_exercises included_exercise
          where included_exercise.session_id = s.id
            and included_exercise.exercise_id = requested_exercise_id
            and included_exercise.status <> 'canceled'
        )
      )
  ),
  session_measurements as (
    select
      fs.id,
      fs.local_date,
      fs.local_week,
      fs.session_duration_seconds,
      coalesce(sum(
        case
          when ws.reps > 0 and ws.load_grams > 0
            then ws.reps::bigint * ws.load_grams::bigint
          else 0
        end
      ), 0)::bigint as volume_grams,
      max(
        case
          when ws.load_grams > 0 and ws.reps = 1 then ws.load_grams::bigint
          when ws.load_grams > 0 and ws.reps between 2 and 10
            then round(ws.load_grams * (1 + ws.reps / 30.0))::bigint
          else null
        end
      ) as peak_estimated_one_rep_max_grams,
      count(ws.id)::bigint as completed_sets,
      coalesce(sum(
        case
          when se.tracking_mode = 'reps'
            and ws.reps > 0
            and coalesce(ws.load_grams, 0) <= 0
            then ws.reps::bigint
          else 0
        end
      ), 0)::bigint as bodyweight_reps
    from filtered_sessions fs
    left join public.workout_session_exercises se
      on se.session_id = fs.id
      and se.status <> 'canceled'
      and (
        requested_exercise_id is null
        or se.exercise_id = requested_exercise_id
      )
    left join public.workout_sets ws
      on ws.session_exercise_id = se.id
      and ws.completed
    group by
      fs.id,
      fs.local_date,
      fs.local_week,
      fs.session_duration_seconds
  )
  select
    local_week as week_start,
    count(*)::bigint as session_count,
    count(distinct local_date)::bigint as active_days,
    sum(volume_grams)::bigint as volume_grams,
    max(peak_estimated_one_rep_max_grams)::bigint
      as peak_estimated_one_rep_max_grams,
    sum(session_duration_seconds)::bigint as duration_seconds,
    sum(completed_sets)::bigint as completed_sets,
    sum(bodyweight_reps)::bigint as bodyweight_reps
  from session_measurements
  group by local_week
  order by local_week;
$$;

revoke all on function public.performance_weekly_summary(date, date, uuid)
  from public, anon;
grant execute on function public.performance_weekly_summary(date, date, uuid)
  to authenticated;
