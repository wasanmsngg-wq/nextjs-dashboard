-- Phase 3 performance history query support.
-- Roll forward recovery: this index is additive and may be recreated
-- concurrently in a later corrective migration if query-plan evidence changes.

create index workout_session_exercises_exercise_session_idx
  on public.workout_session_exercises(exercise_id, session_id)
  where exercise_id is not null;
