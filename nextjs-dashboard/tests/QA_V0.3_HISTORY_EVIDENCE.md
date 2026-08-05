# v0.3.0 performance-history evidence

Date: 2026-08-05

Branch: `feature/39-performance-tracking`

Scope: Phase 3 session history plus exercise-detail history and personal-best
presentation. Aggregate trends and charts are not part of these review slices.

## Automated evidence

- TypeScript strict check: passed.
- ESLint with zero warnings: passed.
- Unit tests: 45 passed, including formula, personal-best, filter, and DST
  boundaries.
- Contract tests: 28 passed, including both additive migration contracts.
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

## Exercise-detail slice

- Personal-best selection is a versioned pure domain function. Unit fixtures
  cover missing values, bodyweight repetitions, incomplete sets, faster pace,
  and earliest-tie retention.
- The disposable database applies
  `20260805130000_exercise_performance.sql`; live integration checks confirm
  Epley `100 kg x 5 = 116.667 kg`, snapshot stability, and cross-user denial
  through security-invoker views.
- Exercise history retains archived catalog snapshots, shows canceled records
  without awarding them personal bests, and links back to immutable workouts.
- The dedicated browser fixture verifies `100 kg = 220.46 lb`, English and Thai
  presentation, accessible data tables, no responsive overflow, and automated
  WCAG checks on Chromium, Firefox, WebKit, Pixel-sized, and iPhone-sized
  projects.
- The long workout-session journey remains outside this focused evidence. Its
  existing iPhone discard redirect is intermittently slow, so performance
  acceptance uses an isolated synthetic completed-history fixture rather than
  masking results behind an unrelated workflow.
