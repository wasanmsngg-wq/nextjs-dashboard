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

test("completed history remains snapshot-stable and owner isolated", () => {
  const output = runSql(String.raw`
begin;
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at
) values
  ('00000000-0000-0000-0000-000000000000',
   '71000000-0000-4000-8000-000000000001',
   'authenticated','authenticated','history-one@example.test','',now(),'{}','{}',now(),now()),
  ('00000000-0000-0000-0000-000000000000',
   '71000000-0000-4000-8000-000000000002',
   'authenticated','authenticated','history-two@example.test','',now(),'{}','{}',now(),now());

set local role authenticated;
set local request.jwt.claim.sub = '71000000-0000-4000-8000-000000000001';

insert into public.exercises(id,user_id,name,tracking_mode)
values (
  '72000000-0000-4000-8000-000000000001',
  '71000000-0000-4000-8000-000000000001',
  'Original lift','reps_load'
);
insert into public.workout_sessions(
  id,user_id,status,template_name_snapshot,started_at,completed_at
) values (
  '73000000-0000-4000-8000-000000000001',
  '71000000-0000-4000-8000-000000000001',
  'completed','History fixture','2026-08-05T01:00:00Z','2026-08-05T02:00:00Z'
);
insert into public.workout_session_exercises(
  id,session_id,exercise_id,exercise_name_snapshot,tracking_mode,position,completed
) values (
  '74000000-0000-4000-8000-000000000001',
  '73000000-0000-4000-8000-000000000001',
  '72000000-0000-4000-8000-000000000001','Original lift','reps_load',0,true
);
insert into public.workout_sets(
  id,session_exercise_id,position,completed,reps,load_grams
) values (
  '75000000-0000-4000-8000-000000000001',
  '74000000-0000-4000-8000-000000000001',0,true,5,100000
);

update public.exercises set name='Renamed lift'
where id='72000000-0000-4000-8000-000000000001';

select 'snapshot=' || exercise_name_snapshot
from public.workout_session_exercises
where exercise_id='72000000-0000-4000-8000-000000000001';

set local request.jwt.claim.sub = '71000000-0000-4000-8000-000000000002';
select 'other_sessions=' || count(*) from public.workout_sessions;
select 'other_exercises=' || count(*) from public.workout_session_exercises
where exercise_id='72000000-0000-4000-8000-000000000001';
rollback;
  `);

  assert.match(output, /snapshot=Original lift/);
  assert.match(output, /other_sessions=0/);
  assert.match(output, /other_exercises=0/);
});
