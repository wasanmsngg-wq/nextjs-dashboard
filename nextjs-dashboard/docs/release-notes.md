# Atomic Design migration release notes

## Summary

- Reorganized shared UI into atoms, molecules, organisms, and fetch-free
  templates.
- Grouped customers, dashboard, hospitals, and invoices by feature.
- Preserved route URLs, search parameters, locale cookie, server actions, and
  database schema.
- Split hospital presentation, form, profile, actions, confirmation, skeleton,
  and manager responsibilities.
- Added localized, layout-matched loading states.
- Added URL-contract, architecture, responsive, accessibility, cross-browser,
  and hospital CRUD tests.

## Validation

TypeScript, frozen-lockfile installation, the 12,000-record production build,
unit tests, and Chromium/Firefox/WebKit end-to-end checks pass. See
`docs/evidence/qa-report.md`.

## Rollback

No database migration is included. Roll back the application artifact to commit
`25ce13797675ebaf08a9fad36127307f2308cbe1` if release validation fails.

## Known issue

Invoice create/edit links target starter routes absent from the repository. No
new invoice business workflow was added as part of this structural migration.
