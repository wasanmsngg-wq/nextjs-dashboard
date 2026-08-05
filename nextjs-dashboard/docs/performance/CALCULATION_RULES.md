# Performance calculation rules

These rules are the versioned domain contract for Exercise Tracker performance
features. Calculations use canonical stored units. Unit conversion is a display
concern and must not change the canonical result.

## Included records

- Only sessions with `status = completed` are performance history.
- Only completed sets on non-canceled exercises contribute to calculations.
- Canceled exercises and incomplete sets remain visible in history but do not
  contribute to aggregates or personal bests.
- A deload is ordinary completed training. It is never removed merely because
  its load or volume is below a prior workout.
- Missing measurements remain missing. They are not converted to zero or
  inferred from profile data.

## Volume v1

`volumeGrams = sum(repetitions * externalLoadGrams)`

Only completed sets with positive repetitions and a positive recorded external
load qualify. Bodyweight exercises without an explicitly recorded external load
have no load volume; Exercise Tracker does not infer body mass. The UI may show
their completed repetitions separately.

## Estimated one-repetition maximum v1

The Epley formula is used for completed repetition-and-load sets containing 1
through 10 repetitions and a positive external load:

`estimated1RM = load * (1 + repetitions / 30)`

A single repetition returns the recorded load exactly. Results are calculated
in grams, rounded to the nearest gram, and converted only for display. Sets over
10 repetitions are excluded because this estimate becomes increasingly
unreliable at high repetition counts. This is a training estimate, not medical
or diagnostic advice.

## Duration v1

Session duration is the non-negative whole-second difference between
`completed_at` and `started_at`. Persisted per-set elapsed time remains a
separate measurement and must not replace wall-clock session duration.

## Consistency v1

Consistency is reported as completed-session frequency: session count and
distinct active days for each calendar week in the user's saved IANA timezone.
It is not an adherence percentage because Phase 3 does not store a required
weekly schedule. Multiple sessions on one local day count as multiple sessions
but one active day.

## Weekly progress presentation v1

The progress view groups completed sessions by ISO week (Monday through
Sunday) in the user's saved IANA timezone. Users without a saved profile use
UTC, matching the application profile default. Ranges are bounded to 4, 8, 12,
or 26 weeks; weeks without sessions remain explicit zero/missing rows rather
than disappearing.

- Weekly volume is the sum of eligible set volume.
- Weekly estimated 1RM is the highest eligible Epley estimate, not a sum or an
  average across exercises.
- Weekly duration is the sum of completed-session wall-clock duration.
- Weekly consistency reports session count and distinct active days.
- An exercise filter includes sessions where that exercise was retained and
  not canceled, then aggregates eligible sets for that exercise only.
- Repetitions-only work is reported separately as bodyweight repetitions.
  Missing load on a load-tracked set remains missing and is not relabeled as
  bodyweight work.

Charts are visual summaries of these weekly rows. Every value is printed and
the complete data remains available in the adjacent keyboard-accessible table;
color, hover, pointer input, and canvas are never required to read a result.

## Personal bests v1

Eligible completed sets may produce the following records:

- heaviest external load with at least one repetition;
- highest Epley estimated 1RM;
- greatest repetitions for repetitions-only or bodyweight work;
- longest duration;
- greatest distance;
- fastest pace only when both positive distance and duration are present.

Equal results retain the earliest achievement timestamp. Missing values never
beat recorded values.

## Stability

Historical presentation uses workout-session snapshots, especially
`exercise_name_snapshot` and `template_name_snapshot`. Renaming or archiving a
catalog exercise or template must not rewrite completed history.
