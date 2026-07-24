# Atomic Design migration QA report

Date: 2026-07-24
Environment: local immutable Next.js production build with the 12,000-record
PostgreSQL load-test dataset.

## Automated evidence

- `npx tsc --noEmit`: passed.
- `npm test`: 6 unit/architecture checks passed.
- `npm run build:load-test`: passed; all five user-facing routes compiled.
- `npm run test:e2e`: Chromium, Firefox, and WebKit projects cover routes,
  390/768/1280 widths, locale persistence, keyboard navigation, URL contracts,
  shared-component accessibility, and hospital CRUD.
- `npx madge --circular --extensions ts,tsx app`: 77 files checked; no cycle.
- `git diff --check`: passed.
- Load-test database: `SELECT COUNT(*) FROM hospital` returned `12000`.

## Runtime findings

- `/`, `/dashboard`, `/dashboard/invoices`, `/dashboard/customers`, and
  `/support` return HTTP 200 and have one logical `h1`.
- English/Thai selection updates `<html lang>`, writes `acme_locale`, and
  persists after reload.
- Invoice search resets `page` while preserving other URL state.
- Hospital search, page navigation, and 10/25/50 page-size selection preserve
  their URL contracts.
- Hospital create, view, edit, and delete passed using disposable QA records;
  each test removes its record.
- Large hospital pages use bounded table scrolling and sticky headers.
- No document-level horizontal overflow was detected at supported widths.
- Icon controls have accessible names; tables retain scoped headers; payment
  statuses include text and icons; focus remains trapped inside dialogs.

## Approved environment exception

Playwright WebKit on Windows closes the Ant Design dialog correctly and retains
keyboard operability, but does not report programmatic focus on the invoking
button after close. Chromium and Firefox prove restoration. This is treated as
a test-environment exception because WebKit/Safari button focus behavior depends
on the platform's full-keyboard-access preference.

## Known pre-existing product issue

Invoice create/edit controls point to course-starter routes that are not present
in this repository. The migration preserves those server-action/control
contracts and does not add a new invoice business workflow, which is explicitly
outside the migration scope.
