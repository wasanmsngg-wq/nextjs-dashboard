begin;

create extension if not exists pgcrypto with schema extensions;

drop table if exists public.users;

create table if not exists public.customers (
  id uuid primary key default extensions.gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 120),
  email text not null check (char_length(email) <= 254),
  image_url text not null default '',
  created_at timestamptz not null default now()
);

alter table public.customers
  add column if not exists created_at timestamptz not null default now();

do $$
declare
  missing_columns text[];
begin
  select array_agg(required.column_name)
  into missing_columns
  from (values ('id'), ('name'), ('email'), ('image_url')) as required(column_name)
  where not exists (
    select 1
    from information_schema.columns existing
    where existing.table_schema = 'public'
      and existing.table_name = 'customers'
      and existing.column_name = required.column_name
  );

  if missing_columns is not null then
    raise exception 'customers schema is incompatible; missing columns: %',
      array_to_string(missing_columns, ', ');
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.customers'::regclass and contype = 'p'
  ) then
    alter table public.customers add primary key (id);
  end if;
end;
$$;

alter table public.customers
  alter column name set not null,
  alter column email set not null,
  alter column image_url set not null;

alter table public.customers
  drop constraint if exists customers_name_length_check,
  add constraint customers_name_length_check
    check (char_length(name) between 1 and 120) not valid,
  drop constraint if exists customers_email_length_check,
  add constraint customers_email_length_check
    check (char_length(email) <= 254) not valid;
alter table public.customers
  validate constraint customers_name_length_check,
  validate constraint customers_email_length_check;

create unique index if not exists customers_email_lower_idx
  on public.customers (lower(email));
create index if not exists customers_name_lower_idx
  on public.customers (lower(name));

create table if not exists public.revenue (
  month text primary key check (char_length(month) between 1 and 20),
  revenue integer not null check (revenue >= 0)
);

do $$
declare
  missing_columns text[];
begin
  select array_agg(required.column_name)
  into missing_columns
  from (values ('month'), ('revenue')) as required(column_name)
  where not exists (
    select 1
    from information_schema.columns existing
    where existing.table_schema = 'public'
      and existing.table_name = 'revenue'
      and existing.column_name = required.column_name
  );

  if missing_columns is not null then
    raise exception 'revenue schema is incompatible; missing columns: %',
      array_to_string(missing_columns, ', ');
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.revenue'::regclass and contype = 'p'
  ) then
    alter table public.revenue add primary key (month);
  end if;
end;
$$;

alter table public.revenue
  alter column month set not null,
  alter column revenue set not null;

alter table public.revenue
  drop constraint if exists revenue_month_length_check,
  add constraint revenue_month_length_check
    check (char_length(month) between 1 and 20) not valid,
  drop constraint if exists revenue_nonnegative_check,
  add constraint revenue_nonnegative_check
    check (revenue >= 0) not valid;
alter table public.revenue
  validate constraint revenue_month_length_check,
  validate constraint revenue_nonnegative_check;

create table public.user_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '' check (char_length(display_name) <= 80),
  locale text not null default 'en' check (locale in ('en', 'th')),
  timezone text not null default 'UTC'
    check (char_length(timezone) between 1 and 100 and timezone !~ '[[:cntrl:]]'),
  unit_system text not null default 'metric' check (unit_system in ('metric', 'us')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table public.guest_imports (
  user_id uuid not null references auth.users(id) on delete cascade,
  export_id uuid not null,
  imported_at timestamptz not null default now(),
  primary key (user_id, export_id)
);

create index guest_imports_user_id_idx on public.guest_imports (user_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger user_profiles_set_updated_at
before update on public.user_profiles
for each row execute function public.set_updated_at();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.admins
    where user_id = (select auth.uid())
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

alter table public.user_profiles enable row level security;
alter table public.admins enable row level security;
alter table public.guest_imports enable row level security;
alter table public.customers enable row level security;
alter table public.revenue enable row level security;

create policy "profiles_select_own"
on public.user_profiles for select to authenticated
using ((select auth.uid()) = user_id);

create policy "profiles_insert_own"
on public.user_profiles for insert to authenticated
with check ((select auth.uid()) = user_id);

create policy "profiles_update_own"
on public.user_profiles for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "profiles_delete_own"
on public.user_profiles for delete to authenticated
using ((select auth.uid()) = user_id);

create policy "admins_select_self"
on public.admins for select to authenticated
using ((select auth.uid()) = user_id);

create policy "guest_imports_select_own"
on public.guest_imports for select to authenticated
using ((select auth.uid()) = user_id);

create policy "guest_imports_insert_own"
on public.guest_imports for insert to authenticated
with check ((select auth.uid()) = user_id);

create or replace function public.import_guest_profile(
  import_export_id uuid,
  import_display_name text,
  import_locale text,
  import_timezone text,
  import_unit_system text
)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  current_user_id uuid := (select auth.uid());
  inserted_count integer;
begin
  if current_user_id is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;

  insert into public.guest_imports (user_id, export_id)
  values (current_user_id, import_export_id)
  on conflict (user_id, export_id) do nothing;

  get diagnostics inserted_count = row_count;
  if inserted_count = 0 then
    return false;
  end if;

  insert into public.user_profiles (
    user_id,
    display_name,
    locale,
    timezone,
    unit_system
  )
  values (
    current_user_id,
    import_display_name,
    import_locale,
    import_timezone,
    import_unit_system
  )
  on conflict (user_id) do update
  set display_name = excluded.display_name,
      locale = excluded.locale,
      timezone = excluded.timezone,
      unit_system = excluded.unit_system;

  return true;
end;
$$;

revoke all on function public.import_guest_profile(uuid, text, text, text, text) from public;
grant execute on function public.import_guest_profile(uuid, text, text, text, text)
  to authenticated;

create policy "customers_admin_all"
on public.customers for all to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

create policy "revenue_admin_all"
on public.revenue for all to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

revoke all on table public.user_profiles from anon;
revoke all on table public.admins from anon;
revoke all on table public.guest_imports from anon;
revoke all on table public.customers from anon;
revoke all on table public.revenue from anon;

grant select, insert, update, delete on table public.user_profiles to authenticated;
grant select on table public.admins to authenticated;
grant select, insert on table public.guest_imports to authenticated;
grant select, insert, update, delete on table public.customers to authenticated;
grant select, insert, update, delete on table public.revenue to authenticated;

create or replace function public.health_check()
returns jsonb
language sql
stable
security invoker
set search_path = ''
as $$
  select jsonb_build_object('status', 'ok');
$$;

revoke all on function public.health_check() from public;
grant execute on function public.health_check() to anon, authenticated;

comment on table public.admins is
  'Trusted operators bootstrap administrators out-of-band by inserting an auth.users UUID. No client policy permits role mutation.';
comment on table public.guest_imports is
  'Idempotency ledger. Profile contents are written to user_profiles only after explicit application confirmation.';

commit;
