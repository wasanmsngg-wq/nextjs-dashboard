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

### Release-candidate workout correction

- [x] Local migration reset applies the corrective category constraint.
- [x] Custom exercise creation returns an inserted record and survives reload.
- [x] Category guidance and custom equipment entry are covered by E2E.
- [x] Multi-character template name and notes remain stable in WebKit.
- [x] Exercise selection, template save, session completion, and read-only
      transition pass in Chromium, Firefox, WebKit, Pixel, and iPhone.
- [x] Preview variables now identify staging project `rnmzyccanuwacsxqpzez`.
- [x] A staging schema backup was captured before the corrective migration.
- [ ] Corrected Vercel Preview and synthetic-user acceptance pass.

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
