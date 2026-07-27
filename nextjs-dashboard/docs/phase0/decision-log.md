# Phase 0 decision log

Decisions are accepted for the MVP unless superseded by a linked issue with
schema, privacy, migration, localization, and acceptance-test review.

## PD-001 — International adult audience

- Status: accepted
- Date: 2026-07-27
- Decision: serve international adults aged 18 and over.
- Consequence: the UI must avoid treatment claims, communicate estimation
  limitations in English and Thai, and receive jurisdiction-specific legal
  review before production launch.

## PD-002 — Locale, timezone, and measurement support

- Status: accepted
- Date: 2026-07-27
- Decision: support English and Thai, all valid IANA timezones, and metric and US
  customary displays.
- Consequence: the saved timezone defines the user's calendar day; timestamps
  remain UTC and measurements remain canonical in storage.

## PD-003 — Browser and device baseline

- Status: accepted
- Date: 2026-07-27
- Decision: use the pinned Playwright Chromium, Firefox, WebKit, Pixel-sized, and
  iPhone-sized projects as the minimum tested browser/device baseline.
- Consequence: core workflows must work with keyboard, pointer, and touch and
  target WCAG 2.2 AA.

## PD-004 — Manual nutrient provenance

- Status: accepted
- Date: 2026-07-27
- Decision: track calories, protein, carbohydrates, fat, fiber, sodium, sugar,
  and saturated fat using user-entered food-label values.
- Consequence: store and display the source as user-entered label data; do not
  imply verification or introduce an external nutrient database in the MVP.

## PD-005 — Retention and deletion

- Status: accepted
- Date: 2026-07-27
- Decision: retain account-owned records while the account exists. Defer
  permanent self-service account deletion to a later release; trusted
  administration handles authenticated support requests during the MVP.
- Consequence: active owned rows and authentication identity require a reviewed
  deletion order, while managed backups age out under documented retention.

## PD-006 — Export scope

- Status: accepted
- Date: 2026-07-27
- Decision: defer full account export to a later release. Keep the existing
  versioned guest JSON export because it covers browser-only data.
- Consequence: the MVP must not imply full account export exists. A later
  contract will use versioned JSON canonically and separately evaluate CSV
  views.

## PD-007 — Explicit MVP non-goals

- Status: accepted
- Date: 2026-07-27
- Decision: defer third-party food data, barcode scanning, wearables, social and
  coaching features, subscriptions, shared plans, AI recommendations,
  offline-first synchronization, native applications, full account export, and
  permanent self-service deletion.
- Consequence: adding any item requires separate discovery, privacy review,
  threat modeling, and release planning.
