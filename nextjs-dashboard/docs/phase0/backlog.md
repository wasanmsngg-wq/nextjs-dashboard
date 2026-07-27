# Milestone and issue proposal

This file is the source for creating the GitHub milestone and issue structure.
Creating those external records is the final unchecked Phase 0 action.

## Milestones

| Milestone                                 | Outcome                                                                                  |
| ----------------------------------------- | ---------------------------------------------------------------------------------------- |
| `v0.1.0 — Production foundation`          | Authentication, profile preferences, CI, migrations, security, and isolated environments |
| `v0.2.0 — Workout planning and checklist` | Exercise library, templates, sessions, and reliable set logging                          |
| `v0.3.0 — Performance tracking`           | History, documented aggregates, personal bests, and accessible trends                    |
| `v0.4.0 — Nutrition tracking`             | Manual foods, servings, meals, and fixed-precision nutrient totals                       |
| `v0.5.0 — Targets and dashboard`          | Versioned calculators, effective-dated targets, and integrated daily summary             |
| `v0.9.0 — Production hardening`           | Security, privacy, accessibility, performance, recovery, and operational evidence        |
| `v1.0.0 — MVP release`                    | Audited international adult MVP and production release                                   |
| `Later — Export and deletion`             | Full account export and permanent self-service deletion after legal and retention review |

## Issue template

Each feature issue must contain:

- user story and linked acceptance criteria;
- in-scope and explicit non-goals;
- sensitive fields, purpose, retention, and deletion behavior;
- schema/migration and authorization implications;
- English and Thai states;
- keyboard, screen-reader, responsive, loading, empty, error, and retry states;
- unit, integration, and critical E2E evidence;
- migration recovery and rollout notes.

## Proposed issues

### `v0.1.0`

- Production foundation and isolated environments (existing issue #19).
- Complete hosted authentication and profile acceptance.
- Rehearse staging backup restore and record RPO/RTO evidence.
- Complete EN/TH and manual WCAG 2.2 AA foundation review.
- Enable branch protection and obtain independent approval.

### `v0.2.0`

- Canonical unit conversion primitives.
- User/system exercise library with archive behavior.
- Workout template CRUD, duplication, and keyboard reordering.
- Workout session lifecycle and idempotent completion.
- Set logging for reps, load, duration, distance, RPE, and notes.
- Autosave, offline/error recovery, and resume.

### `v0.3.0`

- Session and exercise history filters.
- Versioned volume, estimated 1RM, duration, and consistency formulas.
- Personal-best rules and historical snapshots.
- Accessible progress charts with table summaries.

### `v0.4.0`

- Manual foods and serving definitions.
- Fixed-precision MVP nutrient storage and validation.
- Meal entry CRUD and timezone-based day boundaries.
- Meal copy using immutable nutrient snapshots.
- Daily nutrient totals and arithmetic fixtures.

### `v0.5.0`

- Versioned calorie estimate.
- Versioned protein range and macro allocation.
- Effective-dated targets and user overrides.
- Integrated workout and nutrition dashboard.
- Calculator limitations and neutral progress language.

### `v0.9.0`

- Configure custom SMTP, distributed rate limiting, and monitoring before the
  first production release.
- Threat model and authorization review.
- Security, secret, dependency, and migration scans.
- WCAG 2.2 AA manual audit and browser/device matrix.
- Performance budgets, realistic synthetic volume, and query plans.
- Monitoring alert, backup restore, rollback, and incident rehearsals.
- International adult privacy/legal review.

### `Later — Export and deletion`

- Define and version the complete JSON export contract.
- Decide whether CSV views accompany the canonical archive.
- Implement authenticated, rate-limited export generation and expiry.
- Implement re-authenticated permanent account deletion.
- Verify cascading deletion, backup expiry, audit events, and support procedure.
