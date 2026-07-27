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
- Data export and account deletion.

### Later releases

- Barcode scanning and third-party food databases.
- Wearable or health-platform integrations.
- Social features, coaching, subscriptions, and shared plans.
- AI-generated recommendations.
- Offline-first synchronization.

These later items require separate discovery, privacy review, threat modeling,
and release plans. They must not be silently added to the MVP.

## 4. Small-team responsibilities

One lead agent coordinates the work. The following bounded roles can run in
parallel when their files do not overlap:

| Role | Primary responsibility | Required output |
| --- | --- | --- |
| Lead | Scope, architecture, task breakdown, integration, release decision | Updated plan, integration branch, release notes |
| Developer | Implement one bounded vertical slice | Code, migrations, focused automated tests |
| QA | Create acceptance tests, exploratory checks, accessibility checks | Test evidence, reproducible defect reports |
| Reviewer | Review security, correctness, maintainability, and migration safety | Findings classified as blocking or follow-up |

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
8. Let Vercel create a preview for the pull request and production deployment
   from `main`.

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

| Version | Intended milestone |
| --- | --- |
| `v0.1.0` | Foundation, account profile, CI, and production baseline |
| `v0.2.0` | Workout templates and workout session checklist |
| `v0.3.0` | Performance history and progress visualization |
| `v0.4.0` | Food, meal, calorie, and nutrient tracking |
| `v0.5.0` | Target calculators and integrated dashboard |
| `v0.9.0` | Feature-complete release candidate |
| `v1.0.0` | Audited, documented, production-ready MVP |

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
- [ ] Define whether a user's "day" is determined by their saved timezone.
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

- [ ] Write user stories for workout, performance, nutrition, and calculators.
- [ ] Define supported devices, browsers, locales, timezones, and units.
- [ ] Define MVP nutrient list and source of nutrient reference values.
- [ ] Decide data retention, export format, deletion behavior, and legal copy.
- [ ] Create low-fidelity workflows and keyboard interaction notes.
- [ ] Record non-goals and defer third-party integrations.
- [ ] Create the issue and milestone structure.

Verification gate:

- [ ] Every MVP story has observable acceptance criteria.
- [ ] Every sensitive field has a reason, retention rule, and deletion path.
- [ ] No unresolved product decision blocks the schema.

### Phase 1 — Production foundation (`v0.1.0`)

Owner: Foundation developer. QA owns pipeline and accessibility smoke tests.

- [ ] Add ESLint, formatter, import boundaries, and consistent scripts.
- [ ] Add unit, integration, and Playwright test layers.
- [ ] Add CI for install, lint, type-check, unit, integration, build, and E2E.
- [ ] Pin production dependency versions and enable dependency updates.
- [ ] Add environment-variable validation without exposing secrets.
- [ ] Add migration tooling and separate development/test databases.
- [ ] Add structured logs, request correlation, error monitoring, and health
      checks.
- [ ] Add security headers, CSP, rate limits, and safe error responses.
- [ ] Replace the single shared account model with real user identity before
      storing personal health information.
- [ ] Add profile, locale, timezone, and unit preferences.
- [ ] Establish preview, staging, and production deployment environments.

Verification gate:

- [ ] A new developer can set up the app from documented steps.
- [ ] CI passes from a clean checkout.
- [ ] Unauthorized users cannot read or mutate another user's data.
- [ ] Secrets and personal data are absent from logs, client bundles, and test
      fixtures.
- [ ] Backup restoration and migration rollback are rehearsed in staging.

### Phase 2 — Workout planning and checklist (`v0.2.0`)

Owner: Workout developer. QA writes the workflow matrix. Reviewer checks
transactions and ownership.

- [ ] Create and manage exercises.
- [ ] Create, reorder, edit, archive, and duplicate workout templates.
- [ ] Start a session from a template or as an empty workout.
- [ ] Check off sets and exercises with keyboard and touch controls.
- [ ] Log reps, load, time, distance, RPE, and notes.
- [ ] Autosave safely and show saving, saved, offline, and error states.
- [ ] Resume an in-progress session.
- [ ] Complete or discard a session with confirmation.
- [ ] Prevent duplicate completion on retries or double clicks.

Verification gate:

- [ ] Complete one workout on mobile using only touch.
- [ ] Complete one workout on desktop using only the keyboard.
- [ ] Refresh mid-session and confirm no accepted data is lost.
- [ ] Simulate a failed save and verify recovery without duplicate sets.
- [ ] Confirm one user cannot access another user's template or session URL.

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

- [ ] Create the `v0.1.0` milestone and foundation issues.
- [ ] Create `feature/<issue>-production-foundation` from `main`.
- [ ] Add linting, formatting, type-check, and CI scripts.
- [ ] Select migration tooling and create an empty migration baseline.
- [ ] Design user identity and profile ownership before adding health data.
- [ ] Add a disposable integration-test database.
- [ ] Implement unit conversion primitives and tests.
- [ ] Implement profile/timezone/unit preferences as the first vertical slice.
- [ ] Run developer, QA, and reviewer passes.
- [ ] Merge, deploy, verify, and tag `v0.1.0`.

