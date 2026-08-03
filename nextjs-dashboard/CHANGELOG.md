# Changelog

## 0.2.0 - 2026-08-03

- Add a bilingual system exercise library and user-owned custom exercises.
- Add unit-aware workout templates with ordered exercises and per-set targets.
- Add resumable workout sessions for four tracking modes with RPE and notes.
- Add transactional RLS-protected workout persistence, immutable completion,
  idempotent retries, and a same-browser IndexedDB recovery queue.
- Add responsive, keyboard-accessible English and Thai workout interfaces.
- Stabilize Preview routing and the staging Supabase connection.
- Redesign the workout, exercise, template, active-session, and completed-session
  experiences with clearer responsive navigation and status feedback.
- Add guided exercise categories, equipment suggestions with custom entry, and
  explicit workout data-loading failures.
- Fix multi-character template input, cross-browser state races, and immediate
  completed-workout feedback.
- Restore empty-workout entry, render newly added exercises without a refresh,
  and present sessions as planned-versus-actual set checklists.
- Preserve template targets separately from recorded results and repair
  authenticated workout discard behavior.
- Allow untouched ad-hoc exercises to be removed while retaining planned or
  recorded exercise cancellations with required reasons.
- Persist per-set stopwatch time, derive exercise totals, and preserve timing
  through autosave, offline retry, and refresh.
- Require a separate cancellation reason for every unfinished exercise during
  atomic workout completion and reject empty workout completion.
- Replace browser prompts and bottom-page status messages with shared,
  accessible dialogs and toast notifications.
- Stabilize WebKit coverage for transient toast semantics and steady-state Axe
  accessibility scans.

## 0.1.0 - Unreleased

- Replace the shared credential with Supabase authentication.
- Add guest and registered profile foundations, admin isolation, security controls, and CI.
