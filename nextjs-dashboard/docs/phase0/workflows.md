# Low-fidelity workflows and keyboard notes

## Common interaction rules

- Use a logical heading hierarchy and one descriptive page title.
- Every control has a persistent accessible name; placeholders are not labels.
- Tab order follows reading order. Do not use positive `tabindex`.
- Enter activates the primary action; Space activates buttons and checkboxes.
- Focus is never trapped except inside a modal dialog and returns to the
  triggering control when the dialog closes.
- Validation summaries receive focus after a failed submission and link to
  invalid fields. Saved and error status changes use appropriate live regions.
- Destructive or completion dialogs default focus to the safest action and
  support Escape without committing.
- Reordering provides keyboard buttons such as Move up and Move down; drag is
  never the only mechanism.
- Touch targets and layouts remain usable at the supported mobile sizes and at
  200% zoom.

## Account and profile

```text
Landing
  -> Continue as guest -> Dashboard
  -> Sign up -> Confirm email -> Optional guest import review -> Dashboard
  -> Sign in -> Dashboard

Dashboard -> Profile settings -> Validate -> Save -> Saved announcement
```

Keyboard notes:

- Initial focus remains at the document start with a skip link to main content.
- Auth errors are announced without clearing valid user input.
- The language selector identifies the current language programmatically.
- The import review offers a clear Continue action even when no guest data
  exists.

## Workout template

```text
Workouts -> Templates -> New template
  -> Name template
  -> Add exercise -> Set targets
  -> Reorder using Move up/down
  -> Save -> Template detail
```

Keyboard notes:

- Exercise search is a labeled combobox or search input with predictable result
  navigation.
- Each repeated exercise and set group has an accessible heading or legend.
- Add, remove, duplicate, and reorder actions include the exercise/set name or
  position in their accessible name.

## Workout session

```text
Template detail -> Start workout -> In-progress checklist
  -> Record/check sets -> Autosave status
  -> Complete -> Confirmation -> Summary/history

In-progress checklist -> Leave/refresh -> Resume
In-progress checklist -> Discard -> Confirmation -> Workouts
```

Keyboard notes:

- Set completion is an actual checkbox or button exposing its state.
- Saving, saved, offline, and error states are announced without moving focus.
- Completing or discarding cannot occur from an accidental double activation.
- After adding a set, focus moves to the first field of the new set.

## History and performance

```text
Progress -> Filter by date/exercise -> Results
  -> Select session or exercise -> Detail
  -> Chart plus equivalent table/summary
```

Keyboard notes:

- Filters submit explicitly or announce refreshed results.
- Charts are not keyboard interaction requirements unless they provide controls;
  the same values remain available in a table or text summary.
- Personal bests never rely on color alone.

## Nutrition logging

```text
Nutrition -> Today -> Add meal entry
  -> Select/create food -> Choose serving and quantity
  -> Review user-entered label nutrients -> Save
  -> Updated daily totals
```

Keyboard notes:

- Meal categories use a fieldset and legend or an equivalently named selector.
- Nutrient inputs include units in their labels.
- Food source and snapshot behavior are visible before save.
- After save, focus returns to the new entry or a confirmation heading.

## Calculator and target

```text
Targets -> Choose calculator -> Enter required inputs
  -> Validate -> Estimate with formula/assumptions
  -> Accept or override -> Choose effective date -> Save
  -> Dashboard progress
```

Keyboard notes:

- Units are announced with every numeric input.
- Explanations are associated with the relevant input.
- Results receive a heading and polite announcement.
- Estimate, range, formula version, and limitations remain readable without
  relying on a tooltip.
