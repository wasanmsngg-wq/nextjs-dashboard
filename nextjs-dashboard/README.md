# Exercise Tracker

Exercise Tracker is a bilingual English/Thai Next.js application with Supabase
Auth, browser-only guest profiles, registered profile preferences, and an
administrator-only customer directory.

## Development

Use Node 24 and pnpm 11.15.1. Copy `.env.example` to an ignored `.env.local`,
then use a local or isolated staging Supabase project. Never place a service-role
or secret key in this application.

```bash
pnpm install --frozen-lockfile
pnpm supabase start
pnpm db:reset
pnpm dev
```

The initial administrator is bootstrapped out-of-band using the instructions in
`supabase/README.md`; real administrator IDs do not belong in migrations or seed
data.

## Verification

```bash
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm test:integration
pnpm build
pnpm test:e2e
pnpm audit:prod
git diff --check
```

Integration tests require the disposable local Supabase stack. Production
migrations, deployments, releases, and tags are outside this branch.
