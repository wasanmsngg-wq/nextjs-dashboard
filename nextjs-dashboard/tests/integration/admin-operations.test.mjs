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

test("admin account, record, and master-data boundaries hold", () => {
  const output = runSql(String.raw`
begin;
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at
) values
  ('00000000-0000-0000-0000-000000000000',
   '60000000-0000-4000-8000-000000000001',
   'authenticated','authenticated','admin-ops@example.test','',now(),'{}','{}',now(),now()),
  ('00000000-0000-0000-0000-000000000000',
   '60000000-0000-4000-8000-000000000002',
   'authenticated','authenticated','member-ops@example.test','',now(),'{}','{}',now(),now()),
  ('00000000-0000-0000-0000-000000000000',
   '60000000-0000-4000-8000-000000000003',
   'authenticated','authenticated','viewer-ops@example.test','',now(),'{}','{}',now(),now());

insert into public.admins(user_id)
values ('60000000-0000-4000-8000-000000000001');
insert into public.user_profiles(user_id,display_name)
values
  ('60000000-0000-4000-8000-000000000001','Admin Operator'),
  ('60000000-0000-4000-8000-000000000002','Workout Member');
insert into public.workout_sessions(id,user_id,notes)
values (
  '61000000-0000-4000-8000-000000000001',
  '60000000-0000-4000-8000-000000000002',
  'owner-only note'
);
insert into public.workout_session_exercises(
  id,session_id,exercise_id,exercise_name_snapshot,tracking_mode,position
) values (
  '62000000-0000-4000-8000-000000000001',
  '61000000-0000-4000-8000-000000000001',
  '20000000-0000-4000-8000-000000000001',
  'Squat','reps_load',0
);
insert into public.workout_sets(
  id,session_exercise_id,position,reps,load_grams,elapsed_seconds
) values (
  '63000000-0000-4000-8000-000000000001',
  '62000000-0000-4000-8000-000000000001',0,8,50000,45
);

set local role authenticated;
set local request.jwt.claim.sub = '60000000-0000-4000-8000-000000000001';
do $$
begin
  assert (select count(*) from public.admin_list_users('',100,0)) = 3,
    'administrator must see auth accounts through the protected directory RPC';
  assert exists (
    select 1 from public.admin_list_users('Workout Member',100,0)
    where email='member-ops@example.test' and workout_count=1
  ), 'directory search and activity totals must be accurate';
  assert (select count(*) from public.workout_sessions) = 1,
    'administrator must inspect user workout sessions';
  assert (select count(*) from public.workout_session_exercises) = 1,
    'administrator must inspect workout exercises';
  assert (select count(*) from public.workout_sets) = 1,
    'administrator must inspect workout set results';
end $$;

insert into public.exercise_categories(key,name_en,name_th,sort_order)
values ('power','Power','พลัง',15);
insert into public.exercises(
  id,system_key,name_en,name_th,tracking_mode,category,equipment
) values (
  '64000000-0000-4000-8000-000000000001',
  'power-clean','Power Clean','พาวเวอร์คลีน','reps_load','power','barbell'
);
update public.user_profiles set display_name='Changed by admin'
where user_id='60000000-0000-4000-8000-000000000002';
do $$
begin
  assert (select display_name from public.user_profiles
    where user_id='60000000-0000-4000-8000-000000000002') = 'Workout Member',
    'administrator inspection must not grant profile mutation';
end $$;

set local request.jwt.claim.sub = '60000000-0000-4000-8000-000000000003';
do $$
begin
  assert (select count(*) from public.exercise_categories where key='power') = 1,
    'registered users must see active category master data';
  assert (select count(*) from public.workout_sessions) = 0,
    'a non-admin must not see another user workout';
  begin
    perform * from public.admin_list_users('',100,0);
    raise exception 'non-admin unexpectedly listed accounts';
  exception when insufficient_privilege then null;
  end;
  begin
    insert into public.exercise_categories(key,name_en,name_th)
    values ('forbidden','Forbidden','ห้าม');
    raise exception 'non-admin unexpectedly changed master data';
  exception when insufficient_privilege then null;
  end;
end $$;

update public.exercises set name_en='Changed'
where id='64000000-0000-4000-8000-000000000001';

reset role;
do $$
begin
  assert (select name_en from public.exercises
    where id='64000000-0000-4000-8000-000000000001') = 'Power Clean',
    'non-admin must not mutate system exercises';
end $$;
rollback;
select 'admin-operations-ok';
`);
  assert.match(output, /admin-operations-ok/);
});
