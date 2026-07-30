-- Record active elapsed time independently from an exercise's measurement
-- mode. Exercise duration is derived as the sum of its retained set times.

alter table public.workout_sets
  add column elapsed_seconds integer not null default 0
    check (elapsed_seconds between 0 and 604800);

drop function public.save_workout_set(
  uuid, uuid, integer, uuid, boolean, integer, integer, integer, integer,
  numeric, text
);

create function public.save_workout_set(
  requested_mutation_id uuid,
  requested_session_id uuid,
  requested_expected_version integer,
  requested_set_id uuid,
  requested_completed boolean,
  requested_reps integer,
  requested_load_grams integer,
  requested_duration_seconds integer,
  requested_distance_meters integer,
  requested_rpe numeric,
  requested_notes text,
  requested_elapsed_seconds integer
) returns integer
language plpgsql security invoker set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  current_version integer;
  prior_version integer;
  mode public.exercise_tracking_mode;
begin
  select resulting_version into prior_version from public.workout_mutations
    where user_id = current_user_id and mutation_id = requested_mutation_id;
  if prior_version is not null then return prior_version; end if;
  select s.version, se.tracking_mode into current_version, mode
    from public.workout_sets ws
    join public.workout_session_exercises se on se.id = ws.session_exercise_id
    join public.workout_sessions s on s.id = se.session_id
    where ws.id = requested_set_id and s.id = requested_session_id
      and s.user_id = current_user_id and s.status = 'in_progress'
      and se.status = 'active'
    for update of s;
  if current_version is null then raise exception 'workout not found'; end if;
  if current_version <> requested_expected_version then
    raise exception 'workout version conflict' using errcode = '40001';
  end if;
  if requested_elapsed_seconds not between 0 and 604800 then
    raise exception 'invalid elapsed time';
  end if;
  if
    (mode not in ('reps_load', 'reps') and requested_reps is not null)
    or (mode <> 'reps_load' and requested_load_grams is not null)
    or (mode not in ('duration', 'distance_duration') and requested_duration_seconds is not null)
    or (mode <> 'distance_duration' and requested_distance_meters is not null)
    or (
      requested_completed and (
        (mode in ('reps_load', 'reps') and requested_reps is null)
        or (mode = 'reps_load' and requested_load_grams is null)
        or (mode in ('duration', 'distance_duration') and requested_duration_seconds is null)
        or (mode = 'distance_duration' and requested_distance_meters is null)
      )
    )
  then raise exception 'measurements do not match tracking mode'; end if;
  update public.workout_sets set
    completed = requested_completed, reps = requested_reps,
    load_grams = requested_load_grams, duration_seconds = requested_duration_seconds,
    distance_meters = requested_distance_meters, rpe = requested_rpe,
    notes = coalesce(requested_notes, ''),
    elapsed_seconds = requested_elapsed_seconds
  where id = requested_set_id;
  update public.workout_sessions set version = version + 1
    where id = requested_session_id returning version into current_version;
  insert into public.workout_mutations
    (user_id, mutation_id, session_id, resulting_version)
  values (current_user_id, requested_mutation_id, requested_session_id, current_version);
  return current_version;
end $$;

grant execute on function public.save_workout_set(
  uuid, uuid, integer, uuid, boolean, integer, integer, integer, integer,
  numeric, text, integer
) to authenticated;
