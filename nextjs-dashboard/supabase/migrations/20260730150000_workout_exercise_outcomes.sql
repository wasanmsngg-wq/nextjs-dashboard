-- Let an in-progress workout distinguish exercises that remain active from
-- exercises intentionally canceled with an audit-friendly reason.

create type public.workout_session_exercise_status as enum (
  'active',
  'canceled'
);

alter table public.workout_session_exercises
  add column status public.workout_session_exercise_status
    not null default 'active',
  add column cancellation_reason text,
  add column canceled_at timestamptz,
  add constraint workout_session_exercise_cancellation_shape check (
    (
      status = 'active'
      and cancellation_reason is null
      and canceled_at is null
    )
    or (
      status = 'canceled'
      and length(trim(cancellation_reason)) between 3 and 500
      and canceled_at is not null
    )
  );

create index workout_session_exercises_active_idx
  on public.workout_session_exercises(session_id, position)
  where status = 'active';

create or replace function public.add_workout_exercise(
  requested_session_id uuid,
  requested_session_exercise_id uuid,
  requested_exercise_id uuid,
  requested_set_ids uuid[]
) returns boolean
language plpgsql security invoker set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  selected_exercise public.exercises;
  next_position integer;
  set_id uuid;
  set_position integer := 0;
begin
  if current_user_id is null then raise exception 'authentication required'; end if;
  if array_length(requested_set_ids, 1) not between 1 and 20 then
    raise exception 'invalid set count';
  end if;
  perform 1 from public.workout_sessions where id = requested_session_id
    and user_id = current_user_id and status = 'in_progress' for update;
  if not found then raise exception 'workout not found'; end if;
  select * into selected_exercise from public.exercises where
    id = requested_exercise_id and archived_at is null
    and (user_id is null or user_id = current_user_id);
  if not found then raise exception 'exercise not found'; end if;
  select coalesce(max(position) + 1, 0) into next_position
    from public.workout_session_exercises where session_id = requested_session_id;
  if next_position > 99 then raise exception 'exercise limit reached'; end if;
  insert into public.workout_session_exercises(
    id, session_id, exercise_id, exercise_name_snapshot, tracking_mode, position
  ) values (
    requested_session_exercise_id, requested_session_id, selected_exercise.id,
    coalesce(selected_exercise.name, selected_exercise.name_en),
    selected_exercise.tracking_mode, next_position
  );
  foreach set_id in array requested_set_ids loop
    insert into public.workout_sets(id, session_exercise_id, position)
    values (set_id, requested_session_exercise_id, set_position);
    set_position := set_position + 1;
  end loop;
  update public.workout_sessions set version = version + 1
    where id = requested_session_id;
  return true;
end $$;

create function public.remove_workout_exercise(
  requested_session_id uuid,
  requested_session_exercise_id uuid,
  requested_expected_version integer
) returns integer
language plpgsql security invoker set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  current_version integer;
begin
  select version into current_version
    from public.workout_sessions
    where id = requested_session_id
      and user_id = current_user_id
      and status = 'in_progress'
    for update;
  if current_version is null then raise exception 'workout not found'; end if;
  if current_version <> requested_expected_version then
    raise exception 'workout version conflict' using errcode = '40001';
  end if;
  if not exists (
    select 1 from public.workout_session_exercises
    where id = requested_session_exercise_id
      and session_id = requested_session_id
      and status = 'active'
  ) then raise exception 'exercise not found'; end if;
  if exists (
    select 1 from public.workout_sets
    where session_exercise_id = requested_session_exercise_id
      and (
        target_reps is not null
        or target_load_grams is not null
        or target_duration_seconds is not null
        or target_distance_meters is not null
        or target_rpe is not null
      )
  ) then raise exception 'planned exercise cannot be removed'; end if;
  if exists (
    select 1 from public.workout_sets
    where session_exercise_id = requested_session_exercise_id
      and (
        completed
        or reps is not null
        or load_grams is not null
        or duration_seconds is not null
        or distance_meters is not null
        or rpe is not null
        or length(trim(notes)) > 0
      )
  ) then raise exception 'recorded exercise cannot be removed'; end if;
  delete from public.workout_session_exercises
    where id = requested_session_exercise_id
      and session_id = requested_session_id;
  update public.workout_sessions set version = version + 1
    where id = requested_session_id returning version into current_version;
  return current_version;
end $$;

create function public.cancel_workout_exercise(
  requested_session_id uuid,
  requested_session_exercise_id uuid,
  requested_expected_version integer,
  requested_reason text
) returns integer
language plpgsql security invoker set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  current_version integer;
  normalized_reason text := trim(coalesce(requested_reason, ''));
begin
  if length(normalized_reason) not between 3 and 500 then
    raise exception 'invalid cancellation reason';
  end if;
  select version into current_version
    from public.workout_sessions
    where id = requested_session_id
      and user_id = current_user_id
      and status = 'in_progress'
    for update;
  if current_version is null then raise exception 'workout not found'; end if;
  if current_version <> requested_expected_version then
    raise exception 'workout version conflict' using errcode = '40001';
  end if;
  update public.workout_session_exercises set
    status = 'canceled',
    cancellation_reason = normalized_reason,
    canceled_at = now(),
    completed = false
  where id = requested_session_exercise_id
    and session_id = requested_session_id
    and status = 'active';
  if not found then raise exception 'exercise not found'; end if;
  update public.workout_sessions set version = version + 1
    where id = requested_session_id returning version into current_version;
  return current_version;
end $$;

create or replace function public.save_workout_set(
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
  requested_notes text
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
    notes = coalesce(requested_notes, '')
  where id = requested_set_id;
  update public.workout_sessions set version = version + 1
    where id = requested_session_id returning version into current_version;
  insert into public.workout_mutations
    (user_id, mutation_id, session_id, resulting_version)
  values (current_user_id, requested_mutation_id, requested_session_id, current_version);
  return current_version;
end $$;

grant execute on function public.remove_workout_exercise(uuid, uuid, integer)
  to authenticated;
grant execute on function public.cancel_workout_exercise(uuid, uuid, integer, text)
  to authenticated;
