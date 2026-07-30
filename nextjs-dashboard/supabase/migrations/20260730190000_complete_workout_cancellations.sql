-- Completing a workout must account for every active exercise. Exercises with
-- unfinished sets are retained as canceled and require a reason.

drop function public.complete_workout(uuid, uuid);

create function public.complete_workout(
  requested_session_id uuid,
  requested_mutation_id uuid,
  requested_cancellations jsonb
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

  perform 1 from public.workout_sessions
    where id = requested_session_id
      and user_id = current_user_id
      and status = 'in_progress'
    for update;
  if not found then
    return exists (
      select 1 from public.workout_sessions
      where id = requested_session_id
        and user_id = current_user_id
        and status = 'completed'
    );
  end if;

  if not exists (
    select 1 from public.workout_session_exercises
    where session_id = requested_session_id
  ) then raise exception 'workout requires at least one exercise'; end if;

  if requested_cancellations is null
    or jsonb_typeof(requested_cancellations) <> 'array'
    or jsonb_array_length(requested_cancellations) > 100
  then raise exception 'invalid workout cancellations'; end if;

  if exists (
    select 1
    from jsonb_array_elements(requested_cancellations) item
    where jsonb_typeof(item) <> 'object'
      or item->>'exerciseId' is null
      or length(trim(coalesce(item->>'reason', ''))) not between 3 and 500
  ) then raise exception 'invalid workout cancellation'; end if;

  if exists (
    select item->>'exerciseId'
    from jsonb_array_elements(requested_cancellations) item
    group by item->>'exerciseId'
    having count(*) > 1
  ) then raise exception 'duplicate workout cancellation'; end if;

  if exists (
    select 1
    from jsonb_array_elements(requested_cancellations) item
    where not exists (
      select 1
      from public.workout_session_exercises se
      where se.id::text = item->>'exerciseId'
        and se.session_id = requested_session_id
        and se.status = 'active'
        and exists (
          select 1 from public.workout_sets ws
          where ws.session_exercise_id = se.id and not ws.completed
        )
    )
  ) then raise exception 'cancellation does not match unfinished exercise'; end if;

  if exists (
    select 1
    from public.workout_session_exercises se
    where se.session_id = requested_session_id
      and se.status = 'active'
      and exists (
        select 1 from public.workout_sets ws
        where ws.session_exercise_id = se.id and not ws.completed
      )
      and not exists (
        select 1
        from jsonb_array_elements(requested_cancellations) item
        where item->>'exerciseId' = se.id::text
      )
  ) then raise exception 'unfinished exercise requires cancellation'; end if;

  update public.workout_session_exercises se set
    status = 'canceled',
    cancellation_reason = trim(item->>'reason'),
    canceled_at = now(),
    completed = false
  from jsonb_array_elements(requested_cancellations) item
  where se.id::text = item->>'exerciseId'
    and se.session_id = requested_session_id
    and se.status = 'active';

  update public.workout_sessions set
    status = 'completed',
    completed_at = now(),
    version = version + 1
  where id = requested_session_id
    and user_id = current_user_id
    and status = 'in_progress'
  returning version into new_version;

  insert into public.workout_mutations
    (user_id, mutation_id, session_id, resulting_version)
  values (current_user_id, requested_mutation_id, requested_session_id, new_version);
  return true;
end $$;

grant execute on function public.complete_workout(uuid, uuid, jsonb)
  to authenticated;
