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
- [x] Corrected protected Vercel Preview and synthetic-user acceptance pass;
      the temporary user and automation bypass were removed afterward.
- [x] Empty-start sessions, immediate exercise insertion, Plan/Actual target
      snapshots, and authenticated discard are covered by local integration and
      Chromium/iPhone browser tests.

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

The broader product matrix above remains follow-up coverage. The
release-specific workout stabilization acceptance is recorded below against
the isolated staging deployment.

## Workout checklist Preview acceptance — 2026-08-03

- [x] Starting an empty workout disables `Complete workout` and explains that
      at least one exercise is required.
- [x] Adding an ad-hoc exercise displays it immediately without a refresh and
      does not show a planned-target panel.
- [x] An untouched ad-hoc exercise can be removed through the shared dialog.
- [x] Planned or recorded exercises can only be canceled and retain a required
      reason in the workout record.
- [x] Set timers persist through autosave and refresh and contribute to the
      exercise total.
- [x] Completing with unfinished exercises requires a separate cancellation
      reason for each exercise and completes atomically.
- [x] Toasts and shared dialogs provide feedback without native browser
      prompts.
- [x] English and Thai workout pages, dialogs, validation, and toast feedback
      pass without clipping or overlap.
- [x] Keyboard-only workout interaction, visible focus, dialog containment,
      Escape handling, and focus return pass.
- [x] Mobile navigation, dialogs, controls, and horizontal-overflow acceptance
      pass.

## Final remote evidence

- PR [#27](https://github.com/wasanmsngg-wq/nextjs-dashboard/pull/27) was
  merged into `main` on 2026-07-30.
- GitHub Actions run
  [30531931906](https://github.com/wasanmsngg-wq/nextjs-dashboard/actions/runs/30531931906)
  passed verification plus Chromium, Firefox, WebKit, Pixel, and iPhone
  Playwright projects.
- The protected
  [Vercel Preview](https://nextjs-dashboard-git-fix-workout-checklist-wasanmsnggs-projects.vercel.app)
  deployed successfully against staging project `rnmzyccanuwacsxqpzez`.
- A roles, schema, and data backup was captured before applying migrations
  `20260730150000`, `20260730170000`, and `20260730190000`; linked migration
  history was verified afterward.
- On 2026-08-03, the user completed the workout checklist Preview matrix with a
  staging account and confirmed every item above passed.
