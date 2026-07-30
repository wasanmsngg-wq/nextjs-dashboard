# Supabase operations

This directory follows the Supabase CLI migration workflow. The local stack and
seed data are development-only. CI must start its own disposable local stack and
must not accept a hosted or production database URL.

## Local reset rehearsal

Run `pnpm supabase:start`, followed by `pnpm db:reset`. This destroys and
recreates only the local Supabase database. Never run reset commands with a
linked hosted project.

## Roll-forward recovery

Production recovery is roll-forward only:

1. stop application writes if data integrity is at risk;
2. capture the failed migration and database logs;
3. create a new timestamped corrective migration (never rewrite an applied one);
4. rehearse reset, upgrade, and restore against local and isolated staging;
5. review backups and the corrective SQL before a separately approved production
   migration.

Applying production migrations is outside this branch. The starter recovery
target is RPO 24 hours, RTO 8 hours, with at least seven days of backups.

The initial administrator must be bootstrapped out-of-band by a trusted operator:

```sql
insert into public.admins (user_id) values ('SUPABASE_AUTH_USER_UUID');
```

Do not place a real user UUID in migrations or seed data.

## Recovery rehearsal evidence

On 2026-07-27, the isolated staging project's `public` application data was
exported with `supabase db dump --linked --data-only --schema public`. The
disposable local stack was reset from committed migrations, its seeded
application rows were cleared, a synthetic local Auth identity was created for
the restored administrator foreign key, and the staging dump was restored into
local PostgreSQL with `ON_ERROR_STOP=1`.

Post-restore verification confirmed:

- two synthetic customer rows;
- two synthetic revenue rows;
- one administrator linked only to the synthetic local Auth identity;
- RLS still enabled on all five protected application tables;
- the committed `health_check` RPC returned `{"status":"ok"}`.

The temporary dump was deleted immediately and was never committed. No hosted
database was reset or used as a restore target. This rehearses logical recovery
from isolated staging into a disposable target; provider-managed backup
retention and point-in-time recovery remain production release requirements.
