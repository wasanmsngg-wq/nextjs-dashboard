# v0.3.0 performance-history evidence

Date: 2026-08-05

Branches: `feature/39-performance-tracking` and
`feature/39-performance-aggregates`

Scope: Phase 3 session history, exercise-detail history, personal bests, weekly
aggregates, and accessible progress visualization.

## Automated evidence

- TypeScript strict check: passed.
- ESLint with zero warnings: passed.
- Unit tests: 49 passed, including formula, personal-best, aggregate summary,
  explicit weekly gaps, bounded filters, timezone, and DST boundaries.
- Contract tests: 30 passed, including all four additive performance
  migration contracts.
- Disposable local Supabase reset: passed through
  `20260805152700_performance_weekly_summary.sql`.
- Integration tests: 14 passed, including history ownership, snapshot
  stability, a hand-calculated owner-isolated aggregate fixture, and a
  multi-day session that resolves to 24 seconds of active time.
- Production build: passed and emitted `/workouts/history` and
  `/workouts/progress` as dynamic routes.
- Production dependency audit: no known vulnerabilities.
- `git diff --check`: passed.
- Ten focused authenticated history/progress tests passed across Chromium,
  Firefox, WebKit, Pixel-sized, and iPhone-sized projects. The progress journey
  includes navigation discoverability, exercise/range filters, metric/US
  parity, English/Thai content, empty and partial histories, a 26-week history,
  responsive overflow, keyboard-focusable scroll regions, equivalent tables,
  no canvas dependency, and automated WCAG checks.

The first combined iPhone-sized run timed out at the pre-existing discard
redirect before reaching history. An isolated rerun of the same project passed;
no reproducible history defect was found.

## Formatting baseline

All changed files pass focused Prettier formatting. Repository-wide
`pnpm format:check` reports 149 pre-existing files outside this slice as stale
under the currently pinned formatter, so unrelated files were not bulk
rewritten.

## Security and data integrity

- History reads use the registered user's Supabase session and existing RLS.
- Cross-user sessions and exercises are denied in the disposable database.
- Catalog renames do not rewrite `exercise_name_snapshot`.
- The runtime uses no service-role credential.
- Date and exercise filters are runtime validated and results are bounded to 20
  sessions per page.
- Progress reads use a security-invoker function, existing RLS, explicit
  `auth.uid()` ownership, saved-timezone weeks with a UTC fallback, and a
  maximum 366-day database range.

## Staging correction evidence

- Vercel Preview variables were pulled immediately before migration and resolve
  to staging project `rnmzyccanuwacsxqpzez`.
- The retained pre-correction Free-plan application-logical backup contains
  public data, auth metadata, migration replay files, a manifest, and SHA-256
  checksums. Supabase-managed point-in-time recovery is unavailable on the Free
  plan.
- Migration `20260805152700_performance_weekly_summary.sql` was applied to
  staging transactionally and recorded in the migration ledger.
- A post-application read-only check confirmed the function sums
  `workout_sets.elapsed_seconds`, contains no wall-clock epoch calculation, and
  reports 24 seconds across the three completed sets for session
  `bf0796e8-5d53-455d-ab51-c0badce4e4df`.
- Manual acceptance on the corrective Preview deployment confirmed workout
  history and Progress show 24 seconds of active time for that session.
- No production migration, production deployment, or release tag was performed.

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

## Aggregate and visualization slice

- The hand-calculated database fixture confirms two same-day sessions count as
  two sessions and one active day; `860,000` gram-repetitions of volume;
  `132,000` grams peak Epley estimated 1RM; `110` seconds of completed-set
  active time; canceled and incomplete sets excluded; bodyweight repetitions
  separate; and a lower deload week retained.
- A separate regression fixture spans 187,708 wall-clock seconds but reports
  exactly 24 active seconds from completed sets of 9, 7, and 8 seconds.
- Missing load on a load-tracked set remains missing instead of becoming zero
  or bodyweight work. A repetitions-only set contributes bodyweight
  repetitions without inventing volume or estimated 1RM.
- Charts print every value and reference the complete weekly table. Scrollable
  chart and table regions are keyboard focusable, and no result depends on
  color, hover, pointer input, or canvas.
- Empty exercise history, explicit zero/missing weeks, and the maximum
  26-week presentation are covered in browser and domain acceptance.
