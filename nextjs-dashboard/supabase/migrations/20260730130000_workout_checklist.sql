-- Preserve template targets separately from recorded workout results so the
-- session UI can remain a true planned-versus-actual checklist.

alter table public.workout_sets
  add column target_reps integer
    check (target_reps between 1 and 1000),
  add column target_load_grams integer
    check (target_load_grams between 0 and 2000000),
  add column target_duration_seconds integer
    check (target_duration_seconds between 1 and 604800),
  add column target_distance_meters integer
    check (target_distance_meters between 1 and 1000000),
  add column target_rpe numeric
    check (target_rpe between 1 and 10 and target_rpe * 2 = trunc(target_rpe * 2));

update public.workout_sets ws
set
  target_reps = ws.reps,
  target_load_grams = ws.load_grams,
  target_duration_seconds = ws.duration_seconds,
  target_distance_meters = ws.distance_meters,
  target_rpe = ws.rpe
from public.workout_session_exercises se
join public.workout_sessions s on s.id = se.session_id
where ws.session_exercise_id = se.id
  and s.template_id is not null;

create or replace function public.reject_completed_session_mutation()
returns trigger
language plpgsql security definer set search_path = ''
as $$
declare session_status public.workout_session_status;
begin
  if tg_table_name = 'workout_sessions' then
    if tg_op = 'DELETE' and not exists (
      select 1 from auth.users where id = old.user_id
    ) then
      return old;
    end if;
    if old.status = 'completed' then
      raise exception 'completed workout sessions are immutable';
    end if;
    return coalesce(new, old);
  end if;
  if tg_table_name = 'workout_session_exercises' then
    select status into session_status from public.workout_sessions
      where id = coalesce(new.session_id, old.session_id);
  else
    select s.status into session_status
      from public.workout_sessions s
      join public.workout_session_exercises e on e.session_id = s.id
      where e.id = coalesce(new.session_exercise_id, old.session_exercise_id);
  end if;
  if session_status = 'completed' then
    raise exception 'completed workout sessions are immutable';
  end if;
  return coalesce(new, old);
end $$;

create or replace function public.start_workout(
  requested_session_id uuid,
  requested_template_id uuid default null
) returns uuid
language plpgsql security invoker set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  active_id uuid;
  source_template public.workout_templates;
begin
  if current_user_id is null then raise exception 'authentication required'; end if;
  select id into active_id from public.workout_sessions
    where user_id = current_user_id and status = 'in_progress';
  if active_id is not null then return active_id; end if;
  if requested_template_id is not null then
    select * into source_template from public.workout_templates
      where id = requested_template_id and user_id = current_user_id
        and archived_at is null;
    if not found then raise exception 'template not found'; end if;
  end if;
  insert into public.workout_sessions
    (id, user_id, template_id, template_name_snapshot)
  values
    (requested_session_id, current_user_id, requested_template_id, source_template.name);
  if requested_template_id is not null then
    insert into public.workout_session_exercises
      (id, session_id, exercise_id, exercise_name_snapshot, tracking_mode, position)
    select gen_random_uuid(), requested_session_id, e.id,
      coalesce(e.name, e.name_en), e.tracking_mode, te.position
    from public.workout_template_exercises te
    join public.exercises e on e.id = te.exercise_id
    where te.template_id = requested_template_id order by te.position;

    insert into public.workout_sets
      (id, session_exercise_id, position,
       target_reps, target_load_grams, target_duration_seconds,
       target_distance_meters, target_rpe)
    select gen_random_uuid(), se.id, ts.position,
      ts.target_reps, ts.target_load_grams, ts.target_duration_seconds,
      ts.target_distance_meters, ts.target_rpe
    from public.workout_template_exercises te
    join public.workout_template_sets ts on ts.template_exercise_id = te.id
    join public.workout_session_exercises se
      on se.session_id = requested_session_id and se.position = te.position
    where te.template_id = requested_template_id;
  end if;
  return requested_session_id;
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
