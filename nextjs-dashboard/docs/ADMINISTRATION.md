# Exercise Tracker administration

The administration workspace is available at `/admin`. It includes:

- a read-only registered-user directory;
- read-only workout exercise and set records;
- bilingual exercise-category master data;
- bilingual system exercises shared by all registered users; and
- the retained customer directory.

User profiles and workout history are intentionally read-only for
administrators. Creating, deleting, banning, or changing the role of an account
remains a trusted Supabase operation outside the application. The application
runtime does not use a service-role credential.

## Grant administrator access

1. Create the account through the normal `/signup` flow and ensure the email is
   verified. If email confirmation is disabled in a local project, create the
   account normally and confirm that it can log in.
2. In the matching Supabase project, open **Authentication → Users** and copy
   the account's user UUID. Verify the project name and project reference before
   continuing.
3. Open that project's SQL editor and run the following trusted operation,
   replacing the example UUID:

   ```sql
   insert into public.admins (user_id)
   values ('00000000-0000-0000-0000-000000000000')
   on conflict (user_id) do nothing;
   ```

   Alternatively, grant access by a verified email address without copying the
   UUID:

   ```sql
   insert into public.admins (user_id)
   select id
   from auth.users
   where lower(email) = lower('administrator@example.com')
     and email_confirmed_at is not null
   on conflict (user_id) do nothing;
   ```

   The email form inserts no row if that verified account does not exist in the
   selected project.

4. Sign out and sign back in. Open `/admin`; the **Administration** navigation
   item is also visible after server-confirmed membership.

Never put an administrator UUID in `supabase/seed.sql`, client code, or an
environment variable. Repeat the operation independently in local, staging, or
production only after verifying which project is in scope.

## Remove administrator access

Run this in the verified Supabase project's SQL editor:

```sql
delete from public.admins
where user_id = '00000000-0000-0000-0000-000000000000';
```

The user should then sign out. Their existing session can no longer satisfy the
server and RLS administrator checks, even before it is refreshed.

## Local development

Use Supabase Studio at `http://127.0.0.1:54323`, or connect to the disposable
local database and run the same SQL. Local reset and seed data intentionally do
not bootstrap an administrator; create a test account first and grant its UUID
explicitly.
