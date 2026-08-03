-- Secure administration for account visibility, workout audit records, and
-- exercise master data. Application runtime continues to use the signed-in
-- user's Supabase session; no service-role credential is required.
--
-- Roll-forward recovery: restore the affected staging backup into a disposable
-- project, correct this migration in a new timestamped migration, and reapply.
-- Do not modify auth.users or completed workout records during recovery.

create table public.exercise_categories (
  key text primary key,
  name_en text not null,
  name_th text not null,
  sort_order integer not null default 0,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint exercise_category_key_shape check (
    key ~ '^[a-z][a-z0-9-]{0,39}$'
  ),
  constraint exercise_category_name_en_length check (
    length(trim(name_en)) between 1 and 80
  ),
  constraint exercise_category_name_th_length check (
    length(trim(name_th)) between 1 and 80
  ),
  constraint exercise_category_sort_order_range check (
    sort_order between 0 and 999
  )
);

create trigger exercise_categories_updated_at
before update on public.exercise_categories
for each row execute function public.set_updated_at();

insert into public.exercise_categories (key, name_en, name_th, sort_order)
values
  ('strength', 'Strength', 'ความแข็งแรง', 10),
  ('cardio', 'Cardio', 'คาร์ดิโอ', 20),
  ('mobility', 'Mobility', 'การเคลื่อนไหว', 30),
  ('balance', 'Balance', 'การทรงตัว', 40),
  ('sport', 'Sport', 'กีฬา', 50),
  ('other', 'Other', 'อื่น ๆ', 999)
on conflict (key) do nothing;

alter table public.exercises
  drop constraint exercise_category_value,
  add constraint exercise_category_master_fk
    foreign key (category) references public.exercise_categories(key)
    on update restrict on delete restrict;

alter table public.exercise_categories enable row level security;

create policy exercise_categories_authenticated_select
on public.exercise_categories for select to authenticated
using (archived_at is null or (select public.is_admin()));

create policy exercise_categories_admin_insert
on public.exercise_categories for insert to authenticated
with check ((select public.is_admin()));

create policy exercise_categories_admin_update
on public.exercise_categories for update to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

revoke all on table public.exercise_categories from anon;
grant select, insert, update on table public.exercise_categories to authenticated;

-- Administrators may inspect account-owned records, but these policies do not
-- allow administrators to change profiles, workouts, or historical results.
create policy profiles_admin_select
on public.user_profiles for select to authenticated
using ((select public.is_admin()));

create policy exercises_admin_select
on public.exercises for select to authenticated
using ((select public.is_admin()));

create policy exercises_admin_insert_system
on public.exercises for insert to authenticated
with check (
  (select public.is_admin())
  and user_id is null
  and system_key is not null
);

create policy exercises_admin_update_system
on public.exercises for update to authenticated
using ((select public.is_admin()) and user_id is null)
with check (
  (select public.is_admin())
  and user_id is null
  and system_key is not null
);

create policy workout_templates_admin_select
on public.workout_templates for select to authenticated
using ((select public.is_admin()));

create policy workout_template_exercises_admin_select
on public.workout_template_exercises for select to authenticated
using ((select public.is_admin()));

create policy workout_template_sets_admin_select
on public.workout_template_sets for select to authenticated
using ((select public.is_admin()));

create policy workout_sessions_admin_select
on public.workout_sessions for select to authenticated
using ((select public.is_admin()));

create policy workout_session_exercises_admin_select
on public.workout_session_exercises for select to authenticated
using ((select public.is_admin()));

create policy workout_sets_admin_select
on public.workout_sets for select to authenticated
using ((select public.is_admin()));

create function public.admin_list_users(
  search_text text default '',
  result_limit integer default 50,
  result_offset integer default 0
)
returns table (
  user_id uuid,
  email text,
  email_confirmed_at timestamptz,
  last_sign_in_at timestamptz,
  created_at timestamptz,
  display_name text,
  locale text,
  timezone text,
  unit_system text,
  is_admin boolean,
  workout_count bigint,
  custom_exercise_count bigint
)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  normalized_search text := trim(coalesce(search_text, ''));
begin
  if not exists (
    select 1 from public.admins
    where admins.user_id = (select auth.uid())
  ) then
    raise exception 'administrator access required' using errcode = '42501';
  end if;

  if result_limit < 1 or result_limit > 100 or result_offset < 0
    or length(normalized_search) > 80 then
    raise exception 'invalid user directory request' using errcode = '22023';
  end if;

  return query
  select
    users.id,
    coalesce(users.email, '')::text,
    users.email_confirmed_at,
    users.last_sign_in_at,
    users.created_at,
    coalesce(profiles.display_name, ''),
    coalesce(profiles.locale, 'en'),
    coalesce(profiles.timezone, 'UTC'),
    coalesce(profiles.unit_system, 'metric'),
    exists (
      select 1 from public.admins
      where admins.user_id = users.id
    ),
    (
      select count(*) from public.workout_sessions
      where workout_sessions.user_id = users.id
    ),
    (
      select count(*) from public.exercises
      where exercises.user_id = users.id
    )
  from auth.users
  left join public.user_profiles profiles on profiles.user_id = users.id
  where normalized_search = ''
    or coalesce(users.email, '') ilike '%' || normalized_search || '%'
    or coalesce(profiles.display_name, '') ilike '%' || normalized_search || '%'
  order by users.created_at desc
  limit result_limit
  offset result_offset;
end;
$$;

revoke all on function public.admin_list_users(text, integer, integer) from public;
grant execute on function public.admin_list_users(text, integer, integer)
  to authenticated;

comment on table public.exercise_categories is
  'Administrator-managed bilingual category suggestions for exercise creation.';
comment on function public.admin_list_users(text, integer, integer) is
  'Read-only administrator account directory. Role mutation remains out-of-band.';
