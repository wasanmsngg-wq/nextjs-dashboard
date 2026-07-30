-- v0.2.0 workout planning and checklist.
-- Roll forward recovery: restore the staging backup, correct this migration in a
-- new timestamped file, then re-run `supabase db reset`. Never reverse this
-- migration against production; v0.2.0 is staging-only.

create type public.exercise_tracking_mode as enum
  ('reps_load', 'reps', 'duration', 'distance_duration');
create type public.workout_session_status as enum ('in_progress', 'completed');

create table public.exercises (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  system_key text unique,
  name text,
  name_en text,
  name_th text,
  tracking_mode public.exercise_tracking_mode not null,
  category text not null default 'other',
  equipment text not null default '',
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint exercise_owner_shape check (
    (user_id is null and system_key is not null and name is null
      and length(trim(name_en)) between 1 and 80
      and length(trim(name_th)) between 1 and 80)
    or
    (user_id is not null and system_key is null
      and length(trim(name)) between 1 and 80
      and name_en is null and name_th is null)
  ),
  constraint exercise_category_length check (length(category) between 1 and 40),
  constraint exercise_equipment_length check (length(equipment) <= 80)
);

create table public.workout_templates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (length(trim(name)) between 1 and 80),
  notes text not null default '' check (length(notes) <= 2000),
  archived_at timestamptz,
  version integer not null default 1 check (version > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.workout_template_exercises (
  id uuid primary key,
  template_id uuid not null references public.workout_templates(id) on delete cascade,
  exercise_id uuid not null references public.exercises(id) on delete cascade,
  position integer not null check (position between 0 and 99),
  created_at timestamptz not null default now(),
  unique (template_id, position)
);

create table public.workout_template_sets (
  id uuid primary key,
  template_exercise_id uuid not null
    references public.workout_template_exercises(id) on delete cascade,
  position integer not null check (position between 0 and 19),
  target_reps integer check (target_reps between 1 and 1000),
  target_load_grams integer check (target_load_grams between 0 and 2000000),
  target_duration_seconds integer check (target_duration_seconds between 1 and 604800),
  target_distance_meters integer check (target_distance_meters between 1 and 1000000),
  target_rpe numeric(3,1) check (
    target_rpe between 1 and 10 and mod(target_rpe * 2, 1) = 0
  ),
  created_at timestamptz not null default now(),
  unique (template_exercise_id, position)
);

create table public.workout_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  template_id uuid references public.workout_templates(id) on delete set null,
  template_name_snapshot text,
  status public.workout_session_status not null default 'in_progress',
  notes text not null default '' check (length(notes) <= 2000),
  version integer not null default 1 check (version > 0),
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  constraint workout_completion_shape check (
    (status = 'in_progress' and completed_at is null)
    or (status = 'completed' and completed_at is not null)
  )
);

create unique index one_active_workout_per_user
  on public.workout_sessions(user_id) where status = 'in_progress';

create table public.workout_session_exercises (
  id uuid primary key,
  session_id uuid not null references public.workout_sessions(id) on delete cascade,
  exercise_id uuid references public.exercises(id) on delete set null,
  exercise_name_snapshot text not null check (
    length(trim(exercise_name_snapshot)) between 1 and 80
  ),
  tracking_mode public.exercise_tracking_mode not null,
  position integer not null check (position between 0 and 99),
  completed boolean not null default false,
  created_at timestamptz not null default now(),
  unique (session_id, position)
);

create table public.workout_sets (
  id uuid primary key,
  session_exercise_id uuid not null
    references public.workout_session_exercises(id) on delete cascade,
  position integer not null check (position between 0 and 999),
  completed boolean not null default false,
  reps integer check (reps between 0 and 1000),
  load_grams integer check (load_grams between 0 and 2000000),
  duration_seconds integer check (duration_seconds between 0 and 604800),
  distance_meters integer check (distance_meters between 0 and 1000000),
  rpe numeric(3,1) check (rpe between 1 and 10 and mod(rpe * 2, 1) = 0),
  notes text not null default '' check (length(notes) <= 2000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (session_exercise_id, position)
);

create table public.workout_mutations (
  user_id uuid not null references auth.users(id) on delete cascade,
  mutation_id uuid not null,
  session_id uuid references public.workout_sessions(id) on delete cascade,
  resulting_version integer not null check (resulting_version > 0),
  applied_at timestamptz not null default now(),
  primary key (user_id, mutation_id)
);

create index exercises_owner_active_idx on public.exercises(user_id, archived_at);
create index workout_templates_owner_idx on public.workout_templates(user_id, archived_at);
create index workout_sessions_owner_status_idx
  on public.workout_sessions(user_id, status, started_at desc);
create index workout_session_exercises_session_idx
  on public.workout_session_exercises(session_id, position);
create index workout_sets_exercise_idx on public.workout_sets(session_exercise_id, position);

create trigger exercises_updated_at
before update on public.exercises
for each row execute function public.set_updated_at();
create trigger workout_templates_updated_at
before update on public.workout_templates
for each row execute function public.set_updated_at();
create trigger workout_sessions_updated_at
before update on public.workout_sessions
for each row execute function public.set_updated_at();
create trigger workout_sets_updated_at
before update on public.workout_sets
for each row execute function public.set_updated_at();

create function public.reject_completed_session_mutation()
returns trigger language plpgsql set search_path = '' as $$
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

create trigger immutable_completed_session
before update or delete on public.workout_sessions
for each row execute function public.reject_completed_session_mutation();
create trigger immutable_completed_session_exercises
before update or delete on public.workout_session_exercises
for each row execute function public.reject_completed_session_mutation();
create trigger immutable_completed_sets
before update or delete on public.workout_sets
for each row execute function public.reject_completed_session_mutation();

alter table public.exercises enable row level security;
alter table public.workout_templates enable row level security;
alter table public.workout_template_exercises enable row level security;
alter table public.workout_template_sets enable row level security;
alter table public.workout_sessions enable row level security;
alter table public.workout_session_exercises enable row level security;
alter table public.workout_sets enable row level security;
alter table public.workout_mutations enable row level security;

create policy exercises_select on public.exercises for select to authenticated
using (user_id is null or user_id = (select auth.uid()));
create policy exercises_insert on public.exercises for insert to authenticated
with check (user_id = (select auth.uid()) and system_key is null);
create policy exercises_update on public.exercises for update to authenticated
using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy exercises_delete on public.exercises for delete to authenticated
using (user_id = (select auth.uid()));

create policy templates_owner on public.workout_templates for all to authenticated
using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy template_exercises_owner on public.workout_template_exercises
for all to authenticated using (exists (
  select 1 from public.workout_templates t
  where t.id = template_id and t.user_id = (select auth.uid())
)) with check (exists (
  select 1 from public.workout_templates t
  where t.id = template_id and t.user_id = (select auth.uid())
));
create policy template_sets_owner on public.workout_template_sets
for all to authenticated using (exists (
  select 1 from public.workout_template_exercises te
  join public.workout_templates t on t.id = te.template_id
  where te.id = template_exercise_id and t.user_id = (select auth.uid())
)) with check (exists (
  select 1 from public.workout_template_exercises te
  join public.workout_templates t on t.id = te.template_id
  where te.id = template_exercise_id and t.user_id = (select auth.uid())
));
create policy sessions_owner on public.workout_sessions for all to authenticated
using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy session_exercises_owner on public.workout_session_exercises
for all to authenticated using (exists (
  select 1 from public.workout_sessions s
  where s.id = session_id and s.user_id = (select auth.uid())
)) with check (exists (
  select 1 from public.workout_sessions s
  where s.id = session_id and s.user_id = (select auth.uid())
));
create policy sets_owner on public.workout_sets for all to authenticated
using (exists (
  select 1 from public.workout_session_exercises se
  join public.workout_sessions s on s.id = se.session_id
  where se.id = session_exercise_id and s.user_id = (select auth.uid())
)) with check (exists (
  select 1 from public.workout_session_exercises se
  join public.workout_sessions s on s.id = se.session_id
  where se.id = session_exercise_id and s.user_id = (select auth.uid())
));
create policy mutations_owner on public.workout_mutations for select to authenticated
using (user_id = (select auth.uid()));
create policy mutations_insert_own on public.workout_mutations for insert to authenticated
with check (user_id = (select auth.uid()));

grant select, insert, update, delete on public.exercises to authenticated;
grant select, insert, update, delete on public.workout_templates to authenticated;
grant select, insert, update, delete on public.workout_template_exercises to authenticated;
grant select, insert, update, delete on public.workout_template_sets to authenticated;
grant select, insert, update, delete on public.workout_sessions to authenticated;
grant select, insert, update, delete on public.workout_session_exercises to authenticated;
grant select, insert, update, delete on public.workout_sets to authenticated;
grant select, insert on public.workout_mutations to authenticated;

create function public.save_workout_template(
  requested_template_id uuid,
  requested_name text,
  requested_notes text,
  requested_exercises jsonb
) returns uuid
language plpgsql security invoker set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  exercise_item jsonb;
  set_item jsonb;
  selected_exercise public.exercises;
  template_exercise_id uuid;
begin
  if current_user_id is null then raise exception 'authentication required'; end if;
  if length(trim(requested_name)) not between 1 and 80
    or length(coalesce(requested_notes, '')) > 2000
    or jsonb_typeof(requested_exercises) <> 'array'
    or jsonb_array_length(requested_exercises) > 100
  then raise exception 'invalid template'; end if;
  insert into public.workout_templates(id, user_id, name, notes)
  values (requested_template_id, current_user_id, trim(requested_name), coalesce(requested_notes, ''))
  on conflict (id) do update set
    name = excluded.name, notes = excluded.notes,
    version = public.workout_templates.version + 1
  where public.workout_templates.user_id = current_user_id
    and public.workout_templates.archived_at is null;
  if not found then raise exception 'template not found'; end if;
  delete from public.workout_template_exercises
    where template_id = requested_template_id;
  for exercise_item in select value from jsonb_array_elements(requested_exercises)
  loop
    if jsonb_array_length(exercise_item->'sets') not between 1 and 20 then
      raise exception 'invalid template sets';
    end if;
    select * into selected_exercise from public.exercises
      where id = (exercise_item->>'exerciseId')::uuid
        and archived_at is null
        and (user_id is null or user_id = current_user_id);
    if not found then raise exception 'exercise not found'; end if;
    template_exercise_id := (exercise_item->>'id')::uuid;
    insert into public.workout_template_exercises
      (id, template_id, exercise_id, position)
    values (template_exercise_id, requested_template_id, selected_exercise.id,
      (exercise_item->>'position')::integer);
    for set_item in select value from jsonb_array_elements(exercise_item->'sets')
    loop
      if
        (selected_exercise.tracking_mode in ('reps_load','reps')
          and nullif(set_item->>'targetReps','') is null)
        or (selected_exercise.tracking_mode not in ('reps_load','reps')
          and nullif(set_item->>'targetReps','') is not null)
        or (selected_exercise.tracking_mode = 'reps_load'
          and nullif(set_item->>'targetLoadGrams','') is null)
        or (selected_exercise.tracking_mode <> 'reps_load'
          and nullif(set_item->>'targetLoadGrams','') is not null)
        or (selected_exercise.tracking_mode in ('duration','distance_duration')
          and nullif(set_item->>'targetDurationSeconds','') is null)
        or (selected_exercise.tracking_mode not in ('duration','distance_duration')
          and nullif(set_item->>'targetDurationSeconds','') is not null)
        or (selected_exercise.tracking_mode = 'distance_duration'
          and nullif(set_item->>'targetDistanceMeters','') is null)
        or (selected_exercise.tracking_mode <> 'distance_duration'
          and nullif(set_item->>'targetDistanceMeters','') is not null)
      then raise exception 'template targets do not match tracking mode'; end if;
      insert into public.workout_template_sets
        (id, template_exercise_id, position, target_reps, target_load_grams,
         target_duration_seconds, target_distance_meters, target_rpe)
      values (
        (set_item->>'id')::uuid, template_exercise_id,
        (set_item->>'position')::integer,
        nullif(set_item->>'targetReps','')::integer,
        nullif(set_item->>'targetLoadGrams','')::integer,
        nullif(set_item->>'targetDurationSeconds','')::integer,
        nullif(set_item->>'targetDistanceMeters','')::integer,
        nullif(set_item->>'targetRpe','')::numeric
      );
    end loop;
  end loop;
  return requested_template_id;
end $$;

create function public.duplicate_workout_template(
  source_template_id uuid,
  requested_template_id uuid,
  requested_name text
) returns uuid
language plpgsql security invoker set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
begin
  insert into public.workout_templates(id, user_id, name, notes)
  select requested_template_id, current_user_id, requested_name, notes
  from public.workout_templates where id = source_template_id
    and user_id = current_user_id and archived_at is null;
  if not found then raise exception 'template not found'; end if;
  insert into public.workout_template_exercises(id, template_id, exercise_id, position)
  select gen_random_uuid(), requested_template_id, exercise_id, position
  from public.workout_template_exercises where template_id = source_template_id;
  insert into public.workout_template_sets(
    id, template_exercise_id, position, target_reps, target_load_grams,
    target_duration_seconds, target_distance_meters, target_rpe
  )
  select gen_random_uuid(), destination.id, source_set.position,
    source_set.target_reps, source_set.target_load_grams,
    source_set.target_duration_seconds, source_set.target_distance_meters,
    source_set.target_rpe
  from public.workout_template_exercises source_exercise
  join public.workout_template_sets source_set
    on source_set.template_exercise_id = source_exercise.id
  join public.workout_template_exercises destination
    on destination.template_id = requested_template_id
    and destination.position = source_exercise.position
  where source_exercise.template_id = source_template_id;
  return requested_template_id;
end $$;

create function public.start_workout(
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
      (id, session_exercise_id, position, reps, load_grams,
       duration_seconds, distance_meters, rpe)
    select gen_random_uuid(), se.id, ts.position, ts.target_reps,
      ts.target_load_grams, ts.target_duration_seconds,
      ts.target_distance_meters, ts.target_rpe
    from public.workout_template_exercises te
    join public.workout_template_sets ts on ts.template_exercise_id = te.id
    join public.workout_session_exercises se
      on se.session_id = requested_session_id and se.position = te.position
    where te.template_id = requested_template_id;
  end if;
  return requested_session_id;
end $$;

create function public.add_workout_exercise(
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
    insert into public.workout_sets(
      id, session_exercise_id, position, reps, load_grams,
      duration_seconds, distance_meters
    ) values (
      set_id, requested_session_exercise_id, set_position,
      case when selected_exercise.tracking_mode in ('reps_load','reps') then 0 end,
      case when selected_exercise.tracking_mode = 'reps_load' then 0 end,
      case when selected_exercise.tracking_mode in ('duration','distance_duration') then 0 end,
      case when selected_exercise.tracking_mode = 'distance_duration' then 0 end
    );
    set_position := set_position + 1;
  end loop;
  update public.workout_sessions set version = version + 1
    where id = requested_session_id;
  return true;
end $$;

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
    (mode in ('reps_load', 'reps') and requested_reps is null)
    or (mode not in ('reps_load', 'reps') and requested_reps is not null)
    or (mode = 'reps_load' and requested_load_grams is null)
    or (mode <> 'reps_load' and requested_load_grams is not null)
    or (mode in ('duration', 'distance_duration') and requested_duration_seconds is null)
    or (mode not in ('duration', 'distance_duration') and requested_duration_seconds is not null)
    or (mode = 'distance_duration' and requested_distance_meters is null)
    or (mode <> 'distance_duration' and requested_distance_meters is not null)
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

create function public.complete_workout(
  requested_session_id uuid,
  requested_mutation_id uuid
) returns boolean
language plpgsql security invoker set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  prior_version integer;
  new_version integer;
begin
  select resulting_version into prior_version from public.workout_mutations
    where user_id = current_user_id and mutation_id = requested_mutation_id;
  if prior_version is not null then return true; end if;
  update public.workout_sessions set status = 'completed',
    completed_at = now(), version = version + 1
  where id = requested_session_id and user_id = current_user_id
    and status = 'in_progress'
  returning version into new_version;
  if new_version is null then
    return exists (select 1 from public.workout_sessions where
      id = requested_session_id and user_id = current_user_id and status = 'completed');
  end if;
  insert into public.workout_mutations
    (user_id, mutation_id, session_id, resulting_version)
  values (current_user_id, requested_mutation_id, requested_session_id, new_version);
  return true;
end $$;

create function public.discard_workout(requested_session_id uuid)
returns boolean language plpgsql security invoker set search_path = '' as $$
begin
  delete from public.workout_sessions where id = requested_session_id
    and user_id = auth.uid() and status = 'in_progress';
  return true;
end $$;

grant execute on function public.start_workout(uuid, uuid) to authenticated;
grant execute on function public.save_workout_template(uuid, text, text, jsonb)
  to authenticated;
grant execute on function public.duplicate_workout_template(uuid, uuid, text)
  to authenticated;
grant execute on function public.add_workout_exercise(uuid, uuid, uuid, uuid[])
  to authenticated;
grant execute on function public.save_workout_set(
  uuid, uuid, integer, uuid, boolean, integer, integer, integer, integer, numeric, text
) to authenticated;
grant execute on function public.complete_workout(uuid, uuid) to authenticated;
grant execute on function public.discard_workout(uuid) to authenticated;

insert into public.exercises
  (id, system_key, name_en, name_th, tracking_mode, category, equipment)
values
  ('20000000-0000-4000-8000-000000000001','squat','Squat','สควอต','reps_load','strength','barbell'),
  ('20000000-0000-4000-8000-000000000002','bench-press','Bench Press','เบนช์เพรส','reps_load','strength','barbell'),
  ('20000000-0000-4000-8000-000000000003','deadlift','Deadlift','เดดลิฟต์','reps_load','strength','barbell'),
  ('20000000-0000-4000-8000-000000000004','overhead-press','Overhead Press','โอเวอร์เฮดเพรส','reps_load','strength','barbell'),
  ('20000000-0000-4000-8000-000000000005','barbell-row','Barbell Row','บาร์เบลโรว์','reps_load','strength','barbell'),
  ('20000000-0000-4000-8000-000000000006','pull-up','Pull-Up','ดึงข้อ','reps','strength','bodyweight'),
  ('20000000-0000-4000-8000-000000000007','push-up','Push-Up','วิดพื้น','reps','strength','bodyweight'),
  ('20000000-0000-4000-8000-000000000008','lunge','Lunge','ลันจ์','reps_load','strength','bodyweight'),
  ('20000000-0000-4000-8000-000000000009','plank','Plank','แพลงก์','duration','strength','bodyweight'),
  ('20000000-0000-4000-8000-000000000010','running','Running','วิ่ง','distance_duration','cardio',''),
  ('20000000-0000-4000-8000-000000000011','cycling','Cycling','ปั่นจักรยาน','distance_duration','cardio','bicycle'),
  ('20000000-0000-4000-8000-000000000012','walking','Walking','เดิน','distance_duration','cardio','')
on conflict (id) do nothing;
