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

test("live local database enforces ownership, admin RLS, and import idempotency", () => {
  const output = runSql(String.raw`
begin;

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at
) values
  (
    '00000000-0000-0000-0000-000000000000',
    '20000000-0000-4000-8000-000000000001',
    'authenticated', 'authenticated', 'admin@example.test', '',
    now(), '{}', '{}', now(), now()
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '20000000-0000-4000-8000-000000000002',
    'authenticated', 'authenticated', 'member@example.test', '',
    now(), '{}', '{}', now(), now()
  );

insert into public.admins (user_id)
values ('20000000-0000-4000-8000-000000000001');

set local role authenticated;
set local request.jwt.claim.sub = '20000000-0000-4000-8000-000000000002';

insert into public.user_profiles (
  user_id, display_name, locale, timezone, unit_system
) values (
  '20000000-0000-4000-8000-000000000002',
  'Member', 'en', 'Asia/Bangkok', 'metric'
);

do $$
begin
  assert (select count(*) from public.user_profiles) = 1,
    'member must see their own profile';
  assert (select count(*) from public.customers) = 0,
    'non-admin must not see customers';
  assert (select count(*) from public.revenue) = 0,
    'non-admin must not see revenue';

  begin
    insert into public.admins (user_id)
    values ('20000000-0000-4000-8000-000000000002');
    raise exception 'member unexpectedly granted admin';
  exception
    when insufficient_privilege then null;
  end;

  assert public.import_guest_profile(
    '30000000-0000-4000-8000-000000000001',
    'Imported', 'th', 'Asia/Bangkok', 'metric'
  ), 'first guest import must apply';
  assert not public.import_guest_profile(
    '30000000-0000-4000-8000-000000000001',
    'Changed', 'en', 'UTC', 'us'
  ), 'retry must be idempotent';
  assert (
    select display_name = 'Imported' and locale = 'th'
    from public.user_profiles
    where user_id = '20000000-0000-4000-8000-000000000002'
  ), 'retry must not overwrite the imported profile';
end;
$$;

reset role;
set local role authenticated;
set local request.jwt.claim.sub = '20000000-0000-4000-8000-000000000001';

do $$
begin
  assert (select count(*) from public.customers) >= 2,
    'admin must see synthetic customers';
  assert (select count(*) from public.revenue) >= 2,
    'admin must see revenue';
  assert (select count(*) from public.user_profiles) = 1,
    'admin must inspect another user profile without gaining mutation access';
end;
$$;

rollback;
select 'rls-ok';
`);

  assert.match(output, /rls-ok/);
});
