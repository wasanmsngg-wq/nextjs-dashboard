# v0.2.0 QA evidence

## Automated

Evidence is recorded from a clean local database before the draft PR is
published:

- [x] frozen install and formatting
- [x] lint and type checking
- [x] domain and migration contracts
- [x] live PostgreSQL RLS/integration tests
- [x] production build
- [x] Chromium, Firefox, WebKit, Pixel, and iPhone Playwright projects
- [x] production dependency audit and `git diff --check`

## Manual staging matrix

- [ ] Create, edit, and archive a custom exercise.
- [ ] Create, reorder, edit, duplicate, and archive a template.
- [ ] Start from a template and from an empty workout.
- [ ] Record all four tracking modes, RPE, notes, and set completion.
- [ ] Refresh and resume the active workout.
- [ ] Disconnect, edit, reconnect, and confirm no duplicate sets.
- [ ] Exercise both conflict choices with two browser contexts.
- [ ] Complete a workout twice and confirm one immutable record.
- [ ] Discard an active workout with confirmation.
- [ ] Confirm another account receives not-found behavior for owned URLs.
- [ ] Complete touch, keyboard, English, Thai, and responsive-layout passes.

Manual staging items remain unchecked until the isolated staging deployment is
available.
