# MVP user stories and acceptance criteria

The application is an estimation and tracking tool for adults aged 18 and over.
It does not diagnose conditions or prescribe treatment.

## Account and profile

As an adult user, I can create an account and set my display name, language,
timezone, and unit system so the application presents information appropriately.

Acceptance criteria:

- A guest can use the dashboard and profile without creating a server account.
- A registered user can sign up, confirm their email, sign in, recover access,
  sign out, and have sessions revoked.
- Profile changes persist to the current browser for a guest and to the user's
  protected account for a registered user.
- Every user-owned database read and mutation is restricted to the current user.
- English and Thai cover every user-facing MVP state.
- Dates use the saved IANA timezone; measurements display in the saved unit
  system without changing their canonical stored value.

## Workout planning

As a user, I can build reusable workout templates so I can prepare a workout
before training.

Acceptance criteria:

- The user can create, rename, duplicate, reorder, and archive a template.
- The user can add ordered exercises with set targets appropriate to the
  exercise, including repetitions, load, time, or distance.
- Invalid and out-of-range values are rejected with an associated message.
- A template update is transactional and a retry cannot create duplicate rows.
- Archived exercises remain readable in templates and historical sessions.
- Another user cannot discover or access the template by changing a URL.

## Workout checklist

As a user, I can start and complete a workout checklist so accepted training
data is preserved even if the session is interrupted.

Acceptance criteria:

- A session can start from a template or empty state.
- The user can add exercises and record sets, repetitions, load, duration,
  distance, effort, and notes.
- The interface exposes saving, saved, offline, and recoverable error states.
- Refreshing or reopening resumes one in-progress session without losing an
  acknowledged save.
- Completion and discard require clear confirmation and are idempotent.
- The complete flow works with touch on a supported mobile viewport and with
  keyboard alone on desktop.

## Performance

As a user, I can review workout history and trends so I can understand changes
in my training.

Acceptance criteria:

- History can be filtered by date and exercise.
- Volume, estimated one-repetition maximum, duration, consistency, and personal
  bests use named, versioned, tested formulas.
- Historical results use snapshots and do not change after catalog edits.
- Metric and US displays represent the same canonical values.
- Every chart has an equivalent accessible text or table representation.
- Empty, partial, missing-value, bodyweight, and large-history states remain
  understandable.

## Food and meal logging

As a user, I can define foods and log meals so I can review daily nutrient
totals.

Acceptance criteria:

- A user can create and edit a manual food with named serving definitions.
- A meal entry records breakfast, lunch, dinner, or snack, quantity, serving,
  and a snapshot of the food's nutrient values.
- MVP nutrients are calories, protein, carbohydrates, fat, fiber, sodium, sugar,
  and saturated fat.
- Nutrient values come from user-entered label values; the UI identifies that
  source and does not imply independent verification.
- Daily totals match hand-calculated fixed-precision fixtures without cumulative
  rounding drift.
- The saved timezone determines the user's day, including midnight and daylight
  saving transitions.
- Editing a food does not rewrite historical meal snapshots.

## Calculators and targets

As a user, I can estimate and override calorie, protein, macro, and nutrient
targets so I can compare logged data with my chosen goals.

Acceptance criteria:

- Each calculator asks only for inputs required by its named formula and explains
  why each input is used.
- The result states that it is an estimate, shows assumptions and a range where
  appropriate, and records formula version and calculation time.
- Impossible, malformed, negative, or unsafe values are rejected.
- Metric and US inputs produce equivalent canonical results with deterministic
  rounding.
- Macro percentages must total 100 and use documented energy constants.
- The user may override a result with an effective date; changing a target does
  not rewrite earlier days.
- The application distinguishes a target that is not configured from a zero
  value and never infers an unprovided sensitive attribute.

## Integrated dashboard

As a user, I can see today's workout and nutrition status so I know the next
useful action.

Acceptance criteria:

- The dashboard uses the saved timezone to select today.
- Workout status and nutrient totals match their source records.
- Progress language is neutral and non-judgmental.
- A new user sees a useful next action rather than an empty chart.
- Reminders are absent unless a future release adds explicit opt-in controls.
