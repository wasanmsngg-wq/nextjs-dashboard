# v0.3.0 session-history evidence

Date: 2026-08-05

Branch: `feature/39-performance-tracking`

Scope: Phase 3 steps 1–4 only. Exercise-detail progress and charts are not part
of this review slice.

## Automated evidence

- TypeScript strict check: passed.
- ESLint with zero warnings: passed.
- Unit tests: 42 passed, including formula, filter, and DST boundaries.
- Contract tests: 27 passed, including the additive migration contract.
- Disposable local Supabase reset: passed through
  `20260805110000_performance_history.sql`.
- Integration tests: 12 passed, including history ownership and snapshot
  stability.
- Production build: passed and emitted `/workouts/history` as a dynamic route.
- Production dependency audit: no known vulnerabilities.
- `git diff --check`: passed.
- Authenticated history journey passed on Chromium, Firefox, WebKit,
  Pixel-sized, and iPhone-sized projects. The journey includes workout
  completion, history display, exercise/date filters, responsive overflow, and
  automated WCAG checks.

The first combined iPhone-sized run timed out at the pre-existing discard
redirect before reaching history. An isolated rerun of the same project passed;
no reproducible history defect was found.

## Formatting baseline

All changed files pass focused Prettier formatting. Repository-wide
`pnpm format:check` reports 151 pre-existing files outside this slice as stale
under the currently pinned formatter, so unrelated files were not bulk
rewritten.

## Security and data integrity

- History reads use the registered user's Supabase session and existing RLS.
- Cross-user sessions and exercises are denied in the disposable database.
- Catalog renames do not rewrite `exercise_name_snapshot`.
- The runtime uses no service-role credential.
- Date and exercise filters are runtime validated and results are bounded to 20
  sessions per page.

## Not performed

- No staging or production migration.
- No staging or production deployment.
- No push, pull request, merge, or release tag.
