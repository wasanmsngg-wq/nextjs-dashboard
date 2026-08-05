# Exercise Application Delivery Plan

## 1. Product goal

Build a secure, accessible exercise web application where an authenticated user
can:

- create reusable workout plans;
- complete workouts using an interactive checklist;
- record sets, repetitions, weight, duration, distance, effort, and notes;
- review workout history and performance trends;
- log foods and meals;
- track calories, protein, carbohydrates, fat, fiber, and selected nutrients;
- calculate daily calorie, protein, and nutrient targets;
- compare daily intake and training results against personal goals.

The application is a tracking and estimation tool, not a diagnostic or medical
device. Calculated targets must be described as estimates. Avoid treatment
claims and advise users with medical, pregnancy, eating-disorder, or
sport-specific needs to consult an appropriately qualified professional.

## 2. Delivery principles

- [ ] Ship the smallest end-to-end feature that provides real user value.
- [ ] Keep business rules independent from React and database code.
- [ ] Use TypeScript strict mode and validate all external input at runtime.
- [ ] Store canonical units and convert only at system boundaries.
- [ ] Keep database migrations additive and reversible whenever practical.
- [ ] Make every phase independently testable by a non-developer.
- [ ] Require automated checks and human review before merging.
- [ ] Never use production data for local development or automated tests.
- [ ] Treat health, body, nutrition, and activity information as sensitive.
- [ ] Prefer maintainable, explicit code over premature abstraction.

## 3. Initial scope

### MVP

- Account and profile settings.
- Metric and US customary unit preferences.
- Exercise library.
- Workout template builder.
- Workout session checklist and set logging.
- Workout history and basic progress charts.
- Manual food library and serving definitions.
- Daily meal and nutrient logging.
- Calorie and protein target calculators.
- Dashboard summary for today's workout and nutrition progress.
- English and Thai localization for all user-facing MVP content.

### Later releases

- Barcode scanning and third-party food databases.
- Wearable or health-platform integrations.
- Social features, coaching, subscriptions, and shared plans.
- AI-generated recommendations.
- Offline-first synchronization.
- Full account export and permanent account deletion.

These later items require separate discovery, privacy review, threat modeling,
and release plans. They must not be silently added to the MVP.

## 4. Small-team responsibilities

One lead agent coordinates the work. The following bounded roles can run in
parallel when their files do not overlap:

| Role      | Primary responsibility                                              | Required output                                 |
| --------- | ------------------------------------------------------------------- | ----------------------------------------------- |
| Lead      | Scope, architecture, task breakdown, integration, release decision  | Updated plan, integration branch, release notes |
| Developer | Implement one bounded vertical slice                                | Code, migrations, focused automated tests       |
| QA        | Create acceptance tests, exploratory checks, accessibility checks   | Test evidence, reproducible defect reports      |
| Reviewer  | Review security, correctness, maintainability, and migration safety | Findings classified as blocking or follow-up    |

Working rules:

- [ ] Give each agent a concrete task, owned files, acceptance criteria, and
      verification commands.
- [ ] Do not allow agents to edit the same files concurrently.
- [ ] Developers do not approve their own changes.
- [ ] QA derives tests from acceptance criteria, not implementation details.
- [ ] The reviewer checks the final integrated diff, not only individual
      commits.
- [ ] The lead resolves conflicting findings and reruns the complete check set.
- [ ] Each phase ends with a short evidence report in the pull request.

## 5. Git and versioning strategy

Use a protected `main` branch and short-lived branches. `main` must always be
deployable.

### Branches

- Feature: `feature/<issue>-<short-description>`
- Fix: `fix/<issue>-<short-description>`
- Maintenance: `chore/<issue>-<short-description>`
- Release preparation: `release/v<major>.<minor>.<patch>`
- Emergency production fix: `hotfix/v<major>.<minor>.<patch>`

Normal work:

1. Create an issue with acceptance criteria.
2. Branch from the latest `main`.
3. Commit small, coherent changes using Conventional Commits.
4. Open a draft pull request early.
5. Rebase or merge the latest `main` before final verification.
6. Require passing checks and one independent approval.
7. Squash merge into `main`.
8. Let Vercel create a preview for the pull request. Until `v1.0.0`, Vercel
   Production tracks the protected `production` branch rather than `main`;
   release branches and `main` use isolated staging resources.

Do not keep a long-lived `develop` branch. Use feature flags for incomplete
production-safe work.

### Commit examples

- `feat(workouts): add workout session checklist`
- `feat(nutrition): record meal nutrients`
- `fix(calculators): reject impossible body measurements`
- `test(e2e): cover completed workout flow`
- `chore(release): prepare v0.2.0`

### Semantic versioning

- `MAJOR`: incompatible user workflow, API, or stored-data contract change.
- `MINOR`: backward-compatible capability.
- `PATCH`: backward-compatible bug, security, accessibility, or performance fix.

Start in `0.x` while validating the product:

| Version  | Intended milestone                                       |
| -------- | -------------------------------------------------------- |
| `v0.1.0` | Foundation, account profile, CI, and production baseline |
| `v0.2.0` | Workout templates and workout session checklist          |
| `v0.3.0` | Performance history and progress visualization           |
| `v0.4.0` | Food, meal, calorie, and nutrient tracking               |
| `v0.5.0` | Target calculators and integrated dashboard              |
| `v0.9.0` | Feature-complete release candidate                       |
| `v1.0.0` | Audited, documented, production-ready MVP                |

Every release requires an annotated Git tag, generated changelog, migration
notes, deployment evidence, and rollback instructions.

## 6. Proposed architecture

Use vertical feature modules while retaining small domain-neutral UI
primitives:

```text
app/
  (authenticated)/
    dashboard/
    workouts/
    nutrition/
    progress/
    settings/
  api/
  features/
    profile/
    exercises/
    workouts/
    nutrition/
    calculators/
  lib/
    auth/
    db/
    validation/
    units/
    observability/
  ui/
    atoms/
    molecules/
    organisms/
database/
  migrations/
tests/
  unit/
  integration/
  e2e/
```

Each feature should expose a small public API and may contain:

```text
feature/
  domain/       Pure types and business rules
  application/  Use cases and orchestration
  data/         Queries and persistence adapters
  ui/           Components
  validation/   Input schemas
  tests/        Focused feature tests
```

Dependency direction:

```text
UI -> application use case -> domain
                     |
                     +-> data adapter -> PostgreSQL
```

Domain code must not import Next.js, React, SQL clients, or browser APIs.
Server Components read data; Server Actions or route handlers perform validated
mutations. Client Components are reserved for interactions requiring browser
state.

## 7. Data design

Use UUID primary keys, `timestamptz` timestamps in UTC, explicit foreign keys,
check constraints, and indexes for actual query patterns. Every user-owned row
must include `user_id`; every query and mutation must enforce ownership on the
server.

Suggested entities:

- `user_profiles`: locale, timezone, unit system, height, optional birth date.
- `goals`: effective date, activity level, calorie and macro targets.
- `exercises`: system/user ownership, movement category, equipment, muscles.
- `workout_templates`: user-owned plan metadata.
- `workout_template_exercises`: ordered exercise prescriptions.
- `workout_sessions`: start/end time, status, notes, perceived effort.
- `workout_session_exercises`: ordered exercise snapshots.
- `workout_sets`: set type, reps, load, duration, distance, completion state.
- `foods`: user/system source and nutrient values per canonical quantity.
- `food_servings`: serving label and conversion to canonical grams/milliliters.
- `meal_entries`: date, meal category, food snapshot, quantity, nutrients.

Data rules:

- [ ] Use integer minor units or documented fixed-precision decimals; never
      binary floating point for persisted nutrition totals.
- [ ] Store weight in grams or decimal kilograms, distance in meters, energy in
      integer kilocalories, and time in seconds.
- [ ] Store a snapshot of mutable exercise/food facts used by historical logs.
- [x] Define whether a user's "day" is determined by their saved timezone.
- [ ] Make workout completion and meal logging idempotent.
- [ ] Add uniqueness and range constraints in both validation and PostgreSQL.
- [ ] Use transactions for multi-row template, workout, and meal mutations.
- [ ] Avoid hard deletion of referenced catalog items; archive them instead.
- [ ] Support permanent account deletion with a documented retention policy.

## 8. Calculator rules

Calculator formulas must be versioned domain functions with cited formula names,
documented assumptions, deterministic rounding, and unit tests.

- Calorie estimate: support a clearly named basal metabolic rate formula and
  an activity multiplier. Do not present it as a prescription.
- Protein target: calculate a configurable grams-per-kilogram range rather than
  claiming one universally correct value.
- Macro allocation: validate that percentages total 100 and convert energy
  using documented kcal-per-gram constants.
- Nutrient progress: compare logged totals with user-selected targets and
  distinguish "not configured" from zero.

Checklist:

- [ ] Ask for only inputs required by the selected formula.
- [ ] Explain why each input is used.
- [ ] Reject impossible, malformed, negative, and unsafe numeric values.
- [ ] Handle metric/US conversion without changing the canonical result.
- [ ] Display formula, assumptions, range, and last calculation time.
- [ ] Store calculator version with saved results.
- [ ] Never infer sensitive attributes that the user did not provide.
- [ ] Test boundaries, rounding, unit parity, and representative examples.

## 9. Delivery phases

### Phase 0 — Product decisions and measurable acceptance

Owner: Lead, with QA and reviewer input.

- [x] Write user stories for workout, performance, nutrition, and calculators.
- [x] Define supported devices, browsers, locales, timezones, and units.
- [x] Define MVP nutrient list and source of nutrient reference values.
- [x] Decide data retention, export format, deletion behavior, and legal copy.
- [x] Create low-fidelity workflows and keyboard interaction notes.
- [x] Record non-goals and defer third-party integrations.
- [x] Create the issue and milestone structure.

Verification gate:

- [x] Every MVP story has observable acceptance criteria.
- [x] Every sensitive field has a reason, retention rule, and deletion path.
- [x] No unresolved product decision blocks the schema.

### Phase 1 — Production foundation (`v0.1.0`)

Owner: Foundation developer. QA owns pipeline and accessibility smoke tests.

- [x] Add ESLint, formatter, import boundaries, and consistent scripts.
- [x] Add unit, integration, and Playwright test layers.
- [x] Add CI for install, lint, type-check, unit, integration, build, and E2E.
- [x] Pin production dependency versions and enable dependency updates.
- [x] Add environment-variable validation without exposing secrets.
- [x] Add migration tooling and separate development/test databases.
- [x] Add structured logs, request correlation, error monitoring, and health
      checks.
- [x] Add security headers, CSP, rate limits, and safe error responses.
- [x] Replace the single shared account model with real user identity before
      storing personal health information.
- [x] Add profile, locale, timezone, and unit preferences.
- [x] Establish preview, staging, and production deployment environments.

Verification gate:

- [x] A new developer can set up the app from documented steps.
- [x] CI passes from a clean checkout.
- [x] Unauthorized users cannot read or mutate another user's data.
- [x] Secrets and personal data are absent from logs, client bundles, and test
      fixtures.
- [x] Backup restoration and migration rollback are rehearsed using the isolated
      staging backup restored into the disposable local stack.

### Phase 2 — Workout planning and checklist (`v0.2.0`)

Owner: Workout developer. QA writes the workflow matrix. Reviewer checks
transactions and ownership.

Release decisions:

- Registered users own workout data; guests receive an authentication prompt.
- Include 12 bilingual system exercises plus user-created exercises.
- Tracking modes are repetitions/load, repetitions, duration, and
  distance/duration.
- Templates use per-set targets.
- Session sets retain immutable planned-target snapshots separately from actual
  results.
- Keep one active session per user and make completed sessions immutable.
- Untouched ad-hoc exercises may be removed. Planned exercises and exercises
  with recorded results must be canceled with a retained reason.
- Every set may record elapsed stopwatch time independently of its tracking
  mode; exercise time is the sum of its retained set times.
- Completing a workout atomically cancels every unfinished active exercise and
  requires a separate reason for each one.
- Empty workout sessions cannot be completed.
- Retain failed active-session mutations in a versioned same-browser IndexedDB
  queue. Conflicts require an explicit server-copy or device-copy choice;
  cross-device merging is deferred.
- Use shared accessible dialogs and toast notifications for confirmations,
  prompted input, and transient feedback. Native browser prompts are forbidden.
- `v0.2.0` is a staging release. Public production deployment remains deferred
  until `v1.0.0`.

- [x] Create and manage exercises.
- [x] Create, reorder, edit, archive, and duplicate workout templates.
- [x] Start a session from a template or as an empty workout.
- [x] Check off sets and exercises with keyboard and touch controls.
- [x] Log reps, load, time, distance, RPE, and notes.
- [x] Display planned targets separately from editable actual results.
- [x] Add exercises during a session without requiring a refresh.
- [x] Remove untouched ad-hoc exercises and retain canceled exercises with a
      required reason.
- [x] Record persisted per-set elapsed time and display exercise totals.
- [x] Autosave safely and show saving, saved, offline, and error states.
- [x] Resume an in-progress session.
- [x] Complete or discard a session with confirmation.
- [x] Require cancellation reasons for unfinished exercises during completion.
- [x] Prevent empty sessions from being completed.
- [x] Replace native browser prompts and bottom status messages with shared
      dialogs and toast notifications.
- [x] Prevent duplicate completion on retries or double clicks.

Verification gate:

- [x] Complete one workout on mobile using only touch.
- [x] Complete one workout on desktop using only the keyboard.
- [x] Refresh mid-session and confirm no accepted data is lost.
- [x] Simulate a failed save and verify recovery without duplicate sets.
- [x] Confirm one user cannot access another user's template or session URL.
- [x] Confirm set timers and exercise totals persist across refresh.
- [x] Confirm incomplete completion is atomic and retains every cancellation
      reason.
- [x] Confirm empty completion is rejected by both the UI and database.

### Phase 3 — Performance tracking (`v0.3.0`)

Owner: Performance developer. Reviewer validates aggregation correctness.

- [ ] Add session history with date and exercise filters.
- [ ] Show exercise history and personal-best rules.
- [ ] Calculate volume, estimated one-repetition maximum, duration, and
      consistency using documented formulas.
- [ ] Add accessible charts with equivalent text/table summaries.
- [ ] Handle deloads, bodyweight exercises, missing values, and unit changes.
- [ ] Ensure historical results remain stable after catalog edits.

Verification gate:

- [ ] Compare aggregates against a hand-calculated fixture.
- [ ] Verify metric and US displays represent the same canonical values.
- [ ] Verify chart information is available without color, pointer, or canvas.
- [ ] Verify empty, partial, and large histories.

### Phase 4 — Food and nutrient tracking (`v0.4.0`)

Owner: Nutrition developer. QA validates arithmetic and day boundaries.

- [ ] Create and edit custom foods with serving definitions.
- [ ] Add breakfast, lunch, dinner, and snack entries.
- [ ] Edit quantity and serving size without cumulative rounding errors.
- [ ] Display daily calories, macros, fiber, and configured nutrient totals.
- [ ] Copy a meal or previous day without sharing mutable records.
- [ ] Add favorites/recent foods only after core logging is reliable.
- [ ] Show source and freshness for externally sourced food data if introduced.

Verification gate:

- [ ] Match daily totals against hand-calculated test fixtures.
- [ ] Verify midnight behavior in at least two timezones and across DST.
- [ ] Verify decimal quantities, zero, maximums, and invalid units.
- [ ] Verify a food edit does not silently rewrite historical meal nutrients.

### Phase 5 — Targets and dashboard (`v0.5.0`)

Owner: Calculator developer and integration lead.

- [ ] Implement versioned calorie, protein, macro, and nutrient calculators.
- [ ] Allow users to override estimates and record an effective date.
- [ ] Show today's workout status and nutrition progress on the dashboard.
- [ ] Use progress language that is neutral and non-judgmental.
- [ ] Provide calculator explanations and limitations.
- [ ] Add reminders only as an explicit opt-in.

Verification gate:

- [ ] Calculator unit and boundary test matrix passes.
- [ ] Dashboard totals match source workout and meal records.
- [ ] Changing a target does not rewrite prior-day goals.
- [ ] The empty dashboard has a useful next action for a new user.

### Phase 6 — Production hardening (`v0.9.0`)

Owner: QA and reviewer; lead coordinates fixes.

- [ ] Complete threat modeling and authorization review.
- [ ] Run dependency, secret, static-analysis, and migration safety scans.
- [ ] Test OWASP-relevant input, session, CSRF, XSS, and rate-limit cases.
- [ ] Run WCAG 2.2 AA automated and manual checks.
- [ ] Test Chromium, Firefox, WebKit, Android-sized, and iPhone-sized layouts.
- [ ] Establish performance budgets and test realistic data volumes.
- [ ] Add database indexes supported by query plans.
- [ ] Verify observability alerts without recording sensitive payloads.
- [ ] Test backup restore, rollback, and incident procedures.
- [ ] Complete privacy notice, terms, data export, and deletion verification.

Verification gate:

- [ ] No unresolved critical/high security or data-integrity issue.
- [ ] No unresolved severity-one accessibility defect.
- [ ] Core Web Vitals and API latency meet documented budgets.
- [ ] Staging passes the full release checklist using production-like data
      volumes and synthetic accounts.

### Phase 7 — MVP release (`v1.0.0`)

Owner: Lead; all roles sign off.

- [ ] Freeze scope and create `release/v1.0.0`.
- [ ] Run all automated checks from a clean environment.
- [ ] Perform acceptance, exploratory, accessibility, and migration testing.
- [ ] Publish release notes and user-facing documentation.
- [ ] Confirm dashboards, alerts, on-call owner, rollback, and support route.
- [ ] Tag `v1.0.0` after the production deployment is healthy.
- [ ] Monitor errors, latency, and key workflow success after release.
- [ ] Hold a retrospective and move non-blocking findings to the backlog.

## 10. Quality strategy

### Test pyramid

- Unit tests: formulas, unit conversions, rounding, validation, ownership
  policies, state transitions, and aggregations.
- Integration tests: SQL constraints, transactions, repositories, migrations,
  timezone boundaries, and authorization against a disposable database.
- Component tests where useful: complex forms, checklist interactions, and
  error states.
- E2E tests: only critical user journeys across supported browsers.

Critical E2E journeys:

- [ ] Sign up/sign in/sign out and session expiry.
- [ ] Create template, complete workout, and view history.
- [ ] Interrupt and resume a workout.
- [ ] Add food entries and verify daily totals.
- [ ] Calculate and save a target.
- [ ] Export data and permanently delete an account.
- [ ] Confirm cross-user URLs cannot expose data.

Tests must use stable accessible roles, labels, and visible behavior. Do not
couple E2E tests to CSS classes or internal React properties unless waiting for
hydration is unavoidable and documented.

### Definition of done for every pull request

- [ ] Issue and acceptance criteria are linked.
- [ ] Types and runtime schemas are updated.
- [ ] Authorization and ownership are enforced server-side.
- [ ] Migration includes forward and rollback/roll-forward instructions.
- [ ] Unit/integration tests cover business rules and failure paths.
- [ ] E2E coverage is added only when the user workflow changed.
- [ ] Loading, empty, error, success, and retry states are handled.
- [ ] Keyboard, screen-reader naming, focus, contrast, and responsive behavior
      are checked.
- [ ] Localization keys exist in English and Thai.
- [ ] No secrets or sensitive values appear in source, logs, screenshots, or
      fixtures.
- [ ] Relevant documentation and changelog are updated.
- [ ] Developer, QA, and reviewer evidence is recorded.
- [ ] CI and preview deployment pass.

## 11. Security, privacy, and operations checklist

- [ ] Apply least privilege to database and deployment credentials.
- [ ] Rotate secrets and keep separate secrets per environment.
- [ ] Use secure, HTTP-only, same-site cookies and session expiration.
- [ ] Validate input on the server even when the client validates it.
- [ ] Parameterize all SQL and escape untrusted rendered content.
- [ ] Rate-limit authentication, search, calculators, exports, and mutations.
- [ ] Protect state-changing requests from CSRF and replay.
- [ ] Encrypt data in transit and rely on managed encryption at rest.
- [ ] Redact health/body/nutrition fields from logs and error reports.
- [ ] Record security-relevant audit events without storing sensitive payloads.
- [ ] Define backup frequency, retention, restore targets, and owners.
- [ ] Document incident response and vulnerability reporting.
- [ ] Set dependency and container scanning on a schedule.
- [ ] Delete exports promptly and make download URLs short-lived.
- [ ] Verify account deletion removes or irreversibly anonymizes owned data.

## 12. Human verification template

Copy this block into each feature issue or pull request:

```markdown
### Verification

Environment:
Version/commit:
Browser/device:
Test account:

- [ ] Happy path completed
- [ ] Invalid input rejected with a useful message
- [ ] Loading, empty, and failure states checked
- [ ] Refresh/retry does not duplicate or lose data
- [ ] Keyboard-only flow completed
- [ ] Mobile layout checked
- [ ] English and Thai checked
- [ ] Cross-user access denied
- [ ] Automated checks passed

Evidence:

- Screenshots/video:
- Test output:
- Database/migration check:

Known limitations:
Rollback:
```

## 13. First implementation backlog

Execute these in order:

- [x] Create the `v0.1.0` milestone and foundation issues.
- [x] Create `feature/<issue>-production-foundation` from `main`.
- [x] Add linting, formatting, type-check, and CI scripts.
- [x] Select migration tooling and create an empty migration baseline.
- [x] Design user identity and profile ownership before adding health data.
- [x] Add a disposable integration-test database.
- [x] Implement unit conversion primitives and tests.
- [x] Implement profile/timezone/unit preferences as the first vertical slice.
- [x] Run developer, QA, and reviewer passes.
- [ ] Merge, deploy, verify, and tag `v0.1.0`.

## 14. v0.2.0 release-candidate stabilization

Tracking issue: [#28](https://github.com/wasanmsngg-wq/nextjs-dashboard/issues/28)

- [x] Diagnose the empty exercise library as a mismatched Preview Supabase
      project rather than missing staging data.
- [x] Remove cross-deployment Preview canonical redirects.
- [x] Surface workout query and mutation failures instead of treating them as
      successful empty results.
- [x] Add guided exercise categories and editable equipment suggestions.
- [x] Fix deferred form-event access and immutable template editing.
- [x] Redesign all workout screens with responsive, accessible navigation and
      clear loading, empty, success, and error states.
- [x] Add and apply the roll-forward corrective staging migration.
- [x] Complete synthetic-user Preview acceptance and attach final CI evidence
      in `tests/QA_V0.2_EVIDENCE.md`.

## 15. Workout-session checklist stabilization (PR #27, merged)

Branch: `fix/workout-checklist`

Completed implementation:

- [x] Restore the Phase 0 session checklist with planned-versus-actual set
      tracking.
- [x] Allow sessions to start from a template or an empty state.
- [x] Insert newly added exercises into client state immediately without a
      refresh or stale session version.
- [x] Hide planned-target presentation for ad-hoc exercises and display
      template targets as compact readable values.
- [x] Add safe removal for untouched ad-hoc exercises.
- [x] Add retained exercise cancellation status, reason, and timestamp.
- [x] Restrict planned or recorded exercises to cancellation rather than
      deletion.
- [x] Fix authenticated workout discard authorization.
- [x] Add per-set Start, Stop, and Reset stopwatch controls.
- [x] Persist elapsed set time through autosave, offline retry, and refresh;
      derive exercise totals from retained set times.
- [x] Add reusable shared `Dialog` and `Toast` components.
- [x] Replace all remaining native product `confirm`, `alert`, and `prompt`
      usage and add an architecture regression test.
- [x] Require a separate cancellation reason for every unfinished exercise
      when completing a workout.
- [x] Apply unfinished cancellations and workout completion in one database
      transaction.
- [x] Disable completion for a session with no exercises and enforce the same
      rule in PostgreSQL.
- [x] Add complete English and Thai user-facing text.
- [x] Update `AGENTS.md` and the UI design-system contract for modern alignment,
      shared feedback components, and the native-prompt prohibition.

Committed migrations:

- `20260730130000_workout_checklist.sql`: planned-target snapshots and blank
  actual results.
- `20260730150000_workout_exercise_outcomes.sql`: exercise removal and retained
  cancellation outcomes.
- `20260730170000_workout_set_elapsed_time.sql`: persisted set elapsed time.
- `20260730190000_complete_workout_cancellations.sql`: atomic completion,
  required unfinished-exercise reasons, and empty-session rejection.

Verification evidence:

- [x] Disposable local Supabase reset applies the complete migration history.
- [x] 9 integration tests pass, including ownership, removal, cancellation,
      elapsed time, atomic completion, and empty-session rejection.
- [x] 36 unit tests pass.
- [x] 25 contract and architecture tests pass.
- [x] Formatting for changed files, linting, and type checking pass.
- [x] Production build passes.
- [x] Authenticated workout E2E passes on Chromium and an iPhone-sized project,
      including accessibility and responsive-overflow checks.
- [x] Production dependency audit reports no known vulnerabilities.
- [x] `git diff --check` passes.

Release state:

- [x] The workout-session stabilization changes were merged through PR #27
      into `main` on 2026-07-30.
- [x] GitHub Actions verification and all five Playwright browser projects
      completed successfully; the Vercel Preview checks also passed.
- [x] Back up the isolated staging project and apply migrations `150000`,
      `170000`, and `190000`; linked migration history was verified on
      2026-08-03.
- [x] Complete manual Preview acceptance with a synthetic user; the
      user-attested matrix and remote evidence are recorded in
      `tests/QA_V0.2_EVIDENCE.md`.
- [x] PR #27 passed the repository merge requirements and was merged.
- Production migration, deployment, release tagging, and production-branch
  changes remain outside this stabilization work and require separate explicit
  authorization.

## 16. Product backlog

- [x] Show a loading state and prevent duplicate submission on the workout
      session `Add` exercise button while the exercise is being added.

## 17. v0.2.0 staging release packaging

Tracking issue: [#30](https://github.com/wasanmsngg-wq/nextjs-dashboard/issues/30)

- [x] Keep the package version at `0.2.0`.
- [x] Date and complete the v0.2.0 changelog.
- [x] Document all six workout migrations, staging backup evidence,
      roll-forward recovery, and production exclusions.
- [x] Attach final GitHub Actions, Vercel, and manual Preview evidence.
- [x] Merge the release-preparation PR into `main` after all checks pass.
- [x] Create and push the annotated `v0.2.0` tag only after explicit user
      authorization.

Release evidence: PR
[#31](https://github.com/wasanmsngg-wq/nextjs-dashboard/pull/31) merged as
`297dae26c23b6241a2d67d9776e0bdbc1696b403`; annotated tag `v0.2.0`
peels to that commit.

## 18. v0.2.1 staging patch release

Tracking issue: [#36](https://github.com/wasanmsngg-wq/nextjs-dashboard/issues/36)

- [x] Set the package version to `0.2.1` and document the patch scope.
- [x] Include the secure administration and navigation improvements merged
      after the `v0.2.0` tag.
- [x] Show immediate loading state and prevent duplicate Add-exercise
      submissions while preserving failure recovery.
- [x] Pass formatting, linting, type checking, unit/contracts, integration,
      production build, all five Playwright projects, dependency audit, and
      `git diff --check`.
- [x] Merge the protected-branch release PR after GitHub Actions and Vercel
      Preview pass.
- [x] Create and push annotated tag `v0.2.1` after the merge is verified.

This patch has no database migration and performs no production migration,
deployment, or production-branch change. Phase 3 begins only after this patch
release is closed.

Release evidence: PR
[#37](https://github.com/wasanmsngg-wq/nextjs-dashboard/pull/37) merged as
`b6a18199167abc2d717324b76f37ab63e454368b`; GitHub Actions run
[`30969823349`](https://github.com/wasanmsngg-wq/nextjs-dashboard/actions/runs/30969823349)
and Vercel Preview passed; annotated tag `v0.2.1` peels to the merge commit.
