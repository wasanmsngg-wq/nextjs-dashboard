-- v0.2.0 release-candidate workout experience corrections.
-- Keep category values stable across clients while equipment remains free text.

update public.exercises
set category = 'other'
where category not in ('strength', 'cardio', 'mobility', 'balance', 'sport', 'other');

alter table public.exercises
  add constraint exercise_category_value
  check (category in ('strength', 'cardio', 'mobility', 'balance', 'sport', 'other'));
