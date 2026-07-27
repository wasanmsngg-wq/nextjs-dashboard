# Phase 1 QA Evidence

Issue: #19 — Production Foundation

Status: Automated Phase 1 verification complete
Environment restriction: disposable local Supabase only; no production or Preview
connections are used by this test suite.

## Automated acceptance matrix

| Area                | Coverage                                                                                                              | Evidence                                                 | Status                                 |
| ------------------- | --------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- | -------------------------------------- |
| Domain contracts    | Identity, profile, guest envelope, rate limiter, reporter, framework boundary                                         | `tests/domain-contracts.test.mjs` and architecture tests | Implemented                            |
| Migration contracts | Timestamped migration, legacy table removal, RLS, ownership, admin isolation, idempotency, health RPC, synthetic seed | `tests/migration-contracts.test.mjs`                     | Implemented                            |
| Local-only safety   | Reject configured remote database and Supabase URLs during tests                                                      | `tests/local-supabase-guard.test.mjs`                    | Implemented                            |
| Database behavior   | Reset, profile ownership, admin customer/revenue access, self-escalation denial, guest import retry/rollback          | `tests/integration/database.test.mjs`                    | Implemented and passing                |
| Guest behavior      | Persistence, corruption/version/storage/quota handling, warnings, export/import/clear                                 | Unit and Playwright suites                               | Implemented                            |
| Authentication      | Signup, login, recovery/update-password entry points, callback allowlisting, and safe invalid confirmation            | Unit, contract, Playwright, and hosted owner checks      | Implemented; recovery delivery pending |
| Authorization       | Admin RLS, profile isolation, and old-route concealment                                                               | Integration and Playwright                               | Implemented                            |
| Localization        | Complete English and Thai states                                                                                      | Unit and Playwright                                      | Implemented                            |
| Accessibility       | WCAG A/AA automated scans and keyboard/responsive checks                                                              | `tests/e2e/accessibility.spec.ts`                        | Implemented (manual AA pending)        |
| Responsive/browser  | Chromium, Firefox, WebKit, Pixel-sized, and iPhone-sized smoke                                                        | `playwright.config.ts`                                   | Implemented                            |
| Security operations | CSP nonce, transport/security headers, generic health responses, production env validation                            | Unit and Playwright                                      | Implemented                            |

## Manual acceptance checks

- Verify guest warnings state that data is browser/device-specific, is not backed up,
  and may be cleared.
- Verify import comparison does not modify account data before explicit confirmation
  and local guest data is cleared only after server success.
- Inspect keyboard focus order, visible focus, validation announcements, zoom/reflow,
  and contrast on landing, authentication, dashboard, profile, import, and admin pages.
- Confirm admin navigation is absent until membership is confirmed by the server.
- Confirm customer search trims input and rejects/caps input beyond 80 characters.
- Confirm there are no real identities or customer records in seeds, screenshots,
  traces, videos, logs, or reports.

## Release evidence checklist

- [x] `pnpm install --frozen-lockfile`
- [x] Format check
- [x] Lint
- [x] Type check
- [x] Unit and contract tests
- [x] Local Supabase reset and live RLS integration tests
- [x] Production build
- [x] All Playwright projects (100/100)
- [x] Production dependency audit (no high/critical advisories)
- [x] `git diff --check`
- [x] No unresolved critical/high authorization, migration, security, or integrity finding
- [ ] Custom SMTP configured (deferred to production hardening)
- [ ] Distributed rate limiter configured (deferred to production hardening)
- [ ] Monitoring configured (deferred to production hardening)
- [x] Branch protection configured
- [x] Staging backup/restore evidence recorded

## Hosted-environment configuration incident

On 2026-07-27, preflight checks confirmed that the local database target and
Vercel Preview public URL both resolved to project `rnmzyccanuwacsxqpzez`.
Migration `20260727050000_production_foundation.sql` and the synthetic seed were
then applied to that target.

After Supabase management access became available, project inventory showed the
intended isolated Preview project is `qfnobrywiouxiaoirhgg`. A subsequent
read-only check showed both Vercel Preview and Production were configured for
`rnmzyccanuwacsxqpzez`; Preview was therefore not isolated as represented.

Further hosted database mutations stopped immediately. The affected target now
has eight customers, including the two deterministic synthetic customer IDs, and
twelve revenue rows. The seed upserted January and February revenue, so without a
pre-change backup it is not possible to prove whether those rows were inserted or
overwritten. The migration also removed legacy `public.users`, installed the
Phase 1 schema, and enabled RLS. Recovery or roll-forward action must be selected
before any further change.

After confirming that the old retained directory data was disposable, roll-forward
recovery completed:

- removed the two deterministic synthetic customer IDs from the shared project,
  leaving its six original customer rows;
- migrated and seeded the intended isolated Preview project
  `qfnobrywiouxiaoirhgg`;
- verified the Preview project has two synthetic customers, two synthetic revenue
  rows, five RLS-enabled protected tables, and nine policies;
- replaced the Vercel Preview runtime URL and publishable key without changing
  their Production-scoped values;
- configured the isolated project's Auth site URL and exact confirmation redirect
  URLs;
- redeployed Preview and confirmed readiness returns `{"status":"ready"}`.

The January and February values previously upserted on the shared project cannot
be reconstructed without pre-change evidence, but the owner confirmed that old
data does not matter. Administrator bootstrap and authenticated browser testing
were completed using the owner's isolated-staging identity.

An initial signup retry exposed duplicate Vercel variable definitions: the
integration-provided shared value won over the Preview override and created one
confirmed user on the shared project. That unintended user was removed. The
Preview scopes were removed and recreated as single, non-sensitive public
variables; a fresh environment pull confirmed `qfnobrywiouxiaoirhgg` before
redeployment. A code-level guard now prefers the isolated Preview variables over
generic integration variables. Preview Auth callbacks use the stable branch
alias, and the confirmed `wasanmsngg@gmail.com` staging identity has been
bootstrapped in `admins`.

## Current findings

1. Signup verification, login, and authenticated administrator access were
   exercised by the owner against isolated Preview. Recovery delivery and session
   refresh still need a controlled hosted test.
2. English/Thai localization and automated WCAG A/AA scans are complete. Manual
   WCAG 2.2 AA inspection remains before this release can be declared accessible.
3. Custom SMTP, distributed rate limiting, and monitoring are explicitly deferred
   to production hardening. Production environment validation continues to reject
   missing distributed rate limiting and monitoring configuration.
4. Merge, production deployment, migration, and tagging are outside this draft-PR
   phase and remain deferred.
