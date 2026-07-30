import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import test from "node:test";

const databaseContainer = "supabase_db_exercise-tracker";

function runSql(sql) {
  return execFileSync(
    "docker",
    [
      "exec",
      "-i",
      databaseContainer,
      "psql",
      "-v",
      "ON_ERROR_STOP=1",
      "-U",
      "postgres",
    ],
    { encoding: "utf8", input: sql, stdio: ["pipe", "pipe", "pipe"] },
  );
}

test("workout RLS, transactions, idempotency, and immutability hold", () => {
  const output = runSql(String.raw`
begin;
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at
) values
  ('00000000-0000-0000-0000-000000000000',
   '50000000-0000-4000-8000-000000000001',
   'authenticated','authenticated','workout-one@example.test','',now(),'{}','{}',now(),now()),
  ('00000000-0000-0000-0000-000000000000',
   '50000000-0000-4000-8000-000000000002',
   'authenticated','authenticated','workout-two@example.test','',now(),'{}','{}',now(),now());

set local role authenticated;
set local request.jwt.claim.sub = '50000000-0000-4000-8000-000000000001';

insert into public.exercises(id,user_id,name,tracking_mode)
values (
  '51000000-0000-4000-8000-000000000001',
  '50000000-0000-4000-8000-000000000001',
  'My lift','reps_load'
);

do $$
begin
  begin
    insert into public.exercises(user_id,name,tracking_mode,category)
    values (
      '50000000-0000-4000-8000-000000000001',
      'Invalid category',
      'reps',
      'mystery'
    );
    raise exception 'invalid exercise category unexpectedly accepted';
  exception when check_violation then
    null;
  end;
end $$;

select public.save_workout_template(
  '52000000-0000-4000-8000-000000000001',
  'Strength A',
  '',
  '[{"id":"53000000-0000-4000-8000-000000000001","exerciseId":"51000000-0000-4000-8000-000000000001","position":0,"sets":[{"id":"54000000-0000-4000-8000-000000000001","position":0,"targetReps":8,"targetLoadGrams":20000,"targetDurationSeconds":null,"targetDistanceMeters":null,"targetRpe":7.5}]}]'::jsonb
);
select public.start_workout(
  '55000000-0000-4000-8000-000000000001',
  '52000000-0000-4000-8000-000000000001'
);

do $$
declare
  set_id uuid;
  session_exercise_id uuid;
  first_version integer;
  retry_version integer;
begin
  assert (select count(*) from public.workout_sessions where status='in_progress') = 1;
  assert (
    select target_reps = 8 and target_load_grams = 20000
      and reps is null and load_grams is null
    from public.workout_sets ws
    join public.workout_session_exercises se on se.id=ws.session_exercise_id
    where se.session_id='55000000-0000-4000-8000-000000000001'
  ), 'template targets must be separate from blank actual results';
  begin
    perform public.start_workout(
      '55000000-0000-4000-8000-000000000002', null
    );
  exception when unique_violation then
    raise exception 'start_workout should resume rather than violate uniqueness';
  end;
  select ws.id, se.id into set_id, session_exercise_id
    from public.workout_sets ws
    join public.workout_session_exercises se on se.id=ws.session_exercise_id
    where se.session_id='55000000-0000-4000-8000-000000000001';
  begin
    perform public.remove_workout_exercise(
      '55000000-0000-4000-8000-000000000001',
      session_exercise_id,
      1
    );
    raise exception 'planned exercise unexpectedly removed';
  exception when raise_exception then
    if sqlerrm = 'planned exercise unexpectedly removed' then raise; end if;
  end;
  first_version := public.save_workout_set(
    '56000000-0000-4000-8000-000000000001',
    '55000000-0000-4000-8000-000000000001',
    1,set_id,true,10,22500,null,null,8,'felt good',65
  );
  retry_version := public.save_workout_set(
    '56000000-0000-4000-8000-000000000001',
    '55000000-0000-4000-8000-000000000001',
    1,set_id,true,10,22500,null,null,8,'felt good',65
  );
  assert first_version = 2 and retry_version = 2,
    'a duplicate mutation must return the original resulting version';
  assert (
    select elapsed_seconds = 65 from public.workout_sets where id=set_id
  ), 'set elapsed time must persist independently from workout measurements';
  assert public.complete_workout(
    '55000000-0000-4000-8000-000000000001',
    '56000000-0000-4000-8000-000000000002'
  );
  assert public.complete_workout(
    '55000000-0000-4000-8000-000000000001',
    '56000000-0000-4000-8000-000000000002'
  );
  perform public.start_workout(
    '55000000-0000-4000-8000-000000000003', null
  );
  perform public.add_workout_exercise(
    '55000000-0000-4000-8000-000000000003',
    '53000000-0000-4000-8000-000000000003',
    '51000000-0000-4000-8000-000000000001',
    array[
      '54000000-0000-4000-8000-000000000003'::uuid,
      '54000000-0000-4000-8000-000000000004'::uuid
    ]
  );
  assert (
    select reps is null and load_grams is null
      and target_reps is null and target_load_grams is null
    from public.workout_sets
    where id='54000000-0000-4000-8000-000000000003'
  ), 'an ad-hoc exercise must start without planned or actual values';
  assert public.remove_workout_exercise(
    '55000000-0000-4000-8000-000000000003',
    '53000000-0000-4000-8000-000000000003',
    2
  ) = 3, 'an untouched exercise must be removable';
  assert not exists (
    select 1 from public.workout_session_exercises
    where id='53000000-0000-4000-8000-000000000003'
  ), 'removal must delete the exercise and its sets';
  perform public.add_workout_exercise(
    '55000000-0000-4000-8000-000000000003',
    '53000000-0000-4000-8000-000000000004',
    '51000000-0000-4000-8000-000000000001',
    array['54000000-0000-4000-8000-000000000005'::uuid]
  );
  assert public.save_workout_set(
    '56000000-0000-4000-8000-000000000003',
    '55000000-0000-4000-8000-000000000003',
    4,
    '54000000-0000-4000-8000-000000000005',
    true,8,20000,null,null,7,'recorded before cancellation',42
  ) = 5;
  begin
    perform public.remove_workout_exercise(
      '55000000-0000-4000-8000-000000000003',
      '53000000-0000-4000-8000-000000000004',
      5
    );
    raise exception 'recorded exercise unexpectedly removed';
  exception when raise_exception then
    if sqlerrm = 'recorded exercise unexpectedly removed' then raise; end if;
  end;
  assert public.cancel_workout_exercise(
    '55000000-0000-4000-8000-000000000003',
    '53000000-0000-4000-8000-000000000004',
    5,
    'Equipment became unavailable'
  ) = 6;
  assert (
    select status = 'canceled'
      and cancellation_reason = 'Equipment became unavailable'
      and canceled_at is not null
    from public.workout_session_exercises
    where id='53000000-0000-4000-8000-000000000004'
  ), 'cancellation must retain the exercise and normalized reason';
  begin
    perform public.save_workout_set(
      '56000000-0000-4000-8000-000000000004',
      '55000000-0000-4000-8000-000000000003',
      6,
      '54000000-0000-4000-8000-000000000005',
      true,9,21000,null,null,7,'should be rejected',50
    );
    raise exception 'canceled exercise unexpectedly accepted a set update';
  exception when raise_exception then
    if sqlerrm = 'canceled exercise unexpectedly accepted a set update' then
      raise;
    end if;
  end;
  assert public.discard_workout(
    '55000000-0000-4000-8000-000000000003'
  ), 'an empty-start workout with newly added exercises must be discardable';
  begin
    update public.workout_sessions set notes='changed'
      where id='55000000-0000-4000-8000-000000000001';
    raise exception 'completed session unexpectedly changed';
  exception when raise_exception then
    if sqlerrm = 'completed session unexpectedly changed' then raise; end if;
  end;
end $$;

reset role;
set local role authenticated;
set local request.jwt.claim.sub = '50000000-0000-4000-8000-000000000002';
do $$
begin
  assert (select count(*) from public.workout_templates) = 0,
    'another user must not see templates';
  assert (select count(*) from public.workout_sessions) = 0,
    'another user must not see sessions';
  assert (select count(*) from public.exercises where user_id is not null) = 0,
    'another user must not see custom exercises';
end $$;

reset role;
delete from auth.users where id = '50000000-0000-4000-8000-000000000001';
do $$
begin
  assert (select count(*) from public.workout_sessions
    where user_id='50000000-0000-4000-8000-000000000001') = 0,
    'account deletion must cascade through completed workout history';
end $$;

rollback;
select 'workouts-ok';
`);
  assert.match(output, /workouts-ok/);
});
