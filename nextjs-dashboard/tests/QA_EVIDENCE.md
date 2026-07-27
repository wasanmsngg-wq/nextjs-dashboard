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
| Authentication      | Entry points, callback allowlisting, safe invalid confirmation                                                        | `tests/e2e/auth.spec.ts`                                 | Implemented (delivery fixture pending) |
| Authorization       | Admin RLS, profile isolation, and old-route concealment                                                               | Integration and Playwright                               | Implemented                            |
| Localization        | Complete English and Thai states                                                                                      | Manual/Playwright                                        | Follow-up required                     |
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
- [x] All Playwright projects (80/80)
- [x] Production dependency audit (no high/critical advisories)
- [x] `git diff --check`
- [x] No unresolved critical/high authorization, migration, security, or integrity finding
- [ ] Custom SMTP configured
- [ ] Distributed rate limiter configured
- [ ] Monitoring configured
- [ ] Branch protection configured
- [ ] Staging backup/restore evidence recorded

## Isolated staging rehearsal

Rehearsed on 2026-07-27 against the isolated Supabase project used only by the
Vercel Preview environment:

- confirmed the local database URL and Preview public URL resolve to the same
  staging project before applying changes;
- dry-ran and then applied migration `20260727050000_production_foundation.sql`;
- loaded only the committed synthetic seed (`8` customers and `12` revenue rows);
- confirmed remote and local migration history match;
- confirmed database lint reports no schema errors;
- confirmed RLS is enabled on `user_profiles`, `admins`, `guest_imports`,
  `customers`, and `revenue`, with nine public-schema policies installed;
- confirmed no profiles or administrators were created by the seed;
- confirmed the Vercel Preview readiness endpoint returns `{"status":"ready"}`;
- rendered the landing, authentication, guest dashboard, profile, liveness, and
  readiness routes through Vercel deployment protection without middleware errors.

Production was not connected to or modified. Auth redirect allowlisting and the
first staging administrator still require trusted Supabase management access and
an explicitly selected administrator identity.

## Current findings

1. Signup verification delivery, recovery delivery, session refresh, and authenticated
   browser happy paths still need isolated Supabase test-user fixtures.
2. Complete English/Thai localization and manual WCAG 2.2 AA inspection remain
   release follow-up work.
3. The required custom SMTP, distributed rate limiter, monitoring, branch protection,
   and staging backup evidence remain release blockers by design.
