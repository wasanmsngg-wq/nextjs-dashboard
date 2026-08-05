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
      "-At",
    ],
    { encoding: "utf8", input: sql, stdio: ["pipe", "pipe", "pipe"] },
  );
}

test("weekly aggregates match a hand-calculated fixture and remain owner scoped", () => {
  const output = runSql(String.raw`
begin;
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at
) values
  ('00000000-0000-0000-0000-000000000000',
   '81000000-0000-4000-8000-000000000001',
   'authenticated','authenticated','aggregate-one@example.test','',now(),'{}','{}',now(),now()),
  ('00000000-0000-0000-0000-000000000000',
   '81000000-0000-4000-8000-000000000002',
   'authenticated','authenticated','aggregate-two@example.test','',now(),'{}','{}',now(),now());

set local role authenticated;
set local request.jwt.claim.sub = '81000000-0000-4000-8000-000000000001';
insert into public.user_profiles(user_id,display_name,timezone)
values ('81000000-0000-4000-8000-000000000001','Aggregate owner','Asia/Bangkok');

insert into public.exercises(id,user_id,name,tracking_mode) values
  ('82000000-0000-4000-8000-000000000001',
   '81000000-0000-4000-8000-000000000001','Aggregate lift','reps_load'),
  ('82000000-0000-4000-8000-000000000002',
   '81000000-0000-4000-8000-000000000001','Bodyweight fixture','reps');

insert into public.workout_sessions(
  id,user_id,status,started_at,completed_at
) values
  ('83000000-0000-4000-8000-000000000001',
   '81000000-0000-4000-8000-000000000001','completed',
   '2026-07-27T01:00:00Z','2026-07-27T02:00:00Z'),
  ('83000000-0000-4000-8000-000000000002',
   '81000000-0000-4000-8000-000000000001','completed',
   '2026-07-27T10:00:00Z','2026-07-27T10:30:00Z'),
  ('83000000-0000-4000-8000-000000000003',
   '81000000-0000-4000-8000-000000000001','completed',
   '2026-08-03T01:00:00Z','2026-08-03T01:45:00Z');

insert into public.workout_session_exercises(
  id,session_id,exercise_id,exercise_name_snapshot,tracking_mode,
  position,completed,status,cancellation_reason,canceled_at
) values
  ('84000000-0000-4000-8000-000000000001',
   '83000000-0000-4000-8000-000000000001',
   '82000000-0000-4000-8000-000000000001','Aggregate lift','reps_load',0,true,'active',null,null),
  ('84000000-0000-4000-8000-000000000002',
   '83000000-0000-4000-8000-000000000001',
   '82000000-0000-4000-8000-000000000002','Bodyweight fixture','reps',1,true,'active',null,null),
  ('84000000-0000-4000-8000-000000000003',
   '83000000-0000-4000-8000-000000000002',
   '82000000-0000-4000-8000-000000000001','Aggregate lift','reps_load',0,true,'active',null,null),
  ('84000000-0000-4000-8000-000000000004',
   '83000000-0000-4000-8000-000000000002',
   '82000000-0000-4000-8000-000000000001','Canceled lift','reps_load',1,false,'canceled','fixture cancellation',now()),
  ('84000000-0000-4000-8000-000000000005',
   '83000000-0000-4000-8000-000000000003',
   '82000000-0000-4000-8000-000000000001','Aggregate lift','reps_load',0,true,'active',null,null);

insert into public.workout_sets(
  id,session_exercise_id,position,completed,reps,load_grams
) values
  ('85000000-0000-4000-8000-000000000001','84000000-0000-4000-8000-000000000001',0,true,5,100000),
  ('85000000-0000-4000-8000-000000000002','84000000-0000-4000-8000-000000000002',0,true,20,null),
  ('85000000-0000-4000-8000-000000000003','84000000-0000-4000-8000-000000000003',0,true,3,120000),
  ('85000000-0000-4000-8000-000000000004','84000000-0000-4000-8000-000000000004',0,true,10,200000),
  ('85000000-0000-4000-8000-000000000005','84000000-0000-4000-8000-000000000005',0,true,8,60000),
  ('85000000-0000-4000-8000-000000000006','84000000-0000-4000-8000-000000000005',1,false,100,300000),
  ('85000000-0000-4000-8000-000000000007','84000000-0000-4000-8000-000000000001',1,true,10,null);

select 'all=' || row_to_json(summary)
from public.performance_weekly_summary('2026-07-27','2026-08-05',null) summary;
select 'filtered=' || row_to_json(summary)
from public.performance_weekly_summary(
  '2026-07-27','2026-08-05','82000000-0000-4000-8000-000000000001'
) summary;

set local request.jwt.claim.sub = '81000000-0000-4000-8000-000000000002';
select 'other=' || count(*)
from public.performance_weekly_summary('2026-07-27','2026-08-05',null);
rollback;
  `);

  assert.match(
    output,
    /all=\{"week_start":"2026-07-27","session_count":2,"active_days":1,"volume_grams":860000,"peak_estimated_one_rep_max_grams":132000,"duration_seconds":5400,"completed_sets":4,"bodyweight_reps":20\}/,
  );
  assert.match(
    output,
    /all=\{"week_start":"2026-08-03","session_count":1,"active_days":1,"volume_grams":480000,"peak_estimated_one_rep_max_grams":76000,"duration_seconds":2700,"completed_sets":1,"bodyweight_reps":0\}/,
  );
  assert.match(
    output,
    /filtered=\{"week_start":"2026-07-27","session_count":2,"active_days":1,"volume_grams":860000,"peak_estimated_one_rep_max_grams":132000,"duration_seconds":5400,"completed_sets":3,"bodyweight_reps":0\}/,
  );
  assert.match(output, /other=0/);
});
