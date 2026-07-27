# Product and data decisions

## Audience and legal position

- Audience: international adults aged 18 and over.
- The product is a tracking and estimation tool, not a medical device.
- Calculator results are estimates, not diagnoses, treatment, or prescriptions.
- Users with medical, pregnancy, eating-disorder, or sport-specific needs are
  advised to consult an appropriately qualified professional.
- The signup and calculator experiences must communicate the adult-only audience
  and applicable limitations in plain English and Thai.
- Jurisdiction-specific privacy notices, terms, consent mechanisms, or age
  assurance require legal review before production launch. Product copy is not a
  substitute for legal advice.

## Support matrix

| Dimension        | MVP commitment                                                                                            |
| ---------------- | --------------------------------------------------------------------------------------------------------- |
| Desktop browsers | Current stable Chromium, Firefox, and WebKit/Safari behavior represented by the pinned Playwright release |
| Mobile layouts   | Touch-capable Android/Pixel-sized and iPhone-sized viewports in the Playwright matrix                     |
| Input            | Pointer, touch, and keyboard-only for core workflows                                                      |
| Accessibility    | WCAG 2.2 AA target with automated scans and manual review                                                 |
| Locales          | English (`en`) and Thai (`th`) for all user-facing MVP states                                             |
| Timezones        | Valid IANA timezone identifiers                                                                           |
| Unit systems     | Metric and US customary                                                                                   |

The exact versions in CI are the tested baseline. The project does not promise
support for obsolete browsers, JavaScript-disabled operation, feature phones, or
native mobile applications.

## Time and measurement

- A user's calendar day is determined by their saved IANA timezone.
- Before a valid preference exists, the application may propose the browser's
  valid IANA timezone; UTC is the deterministic fallback.
- Timestamps persist in UTC and measurements persist in documented canonical
  units. Locale and unit conversion occur only at system boundaries.

## Nutrient scope and provenance

The MVP tracks:

- calories;
- protein;
- carbohydrates;
- fat;
- fiber;
- sodium;
- sugar;
- saturated fat.

Values are entered by users from food labels. The application records
`user-entered label` as the source and does not claim that values are verified or
complete. Barcode scanning, external food databases, recommended daily values,
and authoritative nutrient-reference datasets are later-release discovery.

## Sensitive fields, retention, and deletion paths

| Data                                               | Reason                                                | Active retention                                                                           | Deletion path                                                                                          |
| -------------------------------------------------- | ----------------------------------------------------- | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------ |
| Email and auth identifiers                         | Account access, confirmation, recovery, and ownership | While the account exists                                                                   | Supabase trusted administration during MVP; self-service account deletion is deferred                  |
| Display name                                       | Personalize the interface                             | While profile exists                                                                       | User clears/changes it or trusted administration deletes the account                                   |
| Locale, IANA timezone, unit system                 | Language, day boundaries, and measurement display     | While profile exists                                                                       | User changes it; removed with account administration                                                   |
| Workout templates and sessions                     | Provide planning, history, and progress               | While account exists; archived catalog references remain as snapshots                      | User deletes eligible drafts/logs where offered; trusted account administration removes all owned rows |
| Food definitions, meal entries, nutrient snapshots | Provide daily nutrition totals and stable history     | While account exists                                                                       | User deletes eligible entries; trusted account administration removes all owned rows                   |
| Calculator inputs, versions, and targets           | Reproduce estimates and compare progress              | While account exists or target history is needed                                           | User replaces/deletes targets where offered; trusted account administration removes all owned rows     |
| Guest profile envelope                             | Browser-only use and optional confirmed import        | Until import succeeds, the user clears it, storage is cleared, or browser policy evicts it | Explicit clear control and browser storage controls                                                    |
| Structured operational logs                        | Reliability and security without sensitive payloads   | Minimum period configured by the monitoring provider                                       | Automatic expiry and restricted operator deletion                                                      |
| Database backups                                   | Disaster recovery                                     | At least seven days, subject to the documented environment policy                          | Automatic expiry; restored copies inherit the same controls                                            |

Workout, body, nutrition, activity, and calculator values must not appear in
logs, analytics, screenshots, test fixtures, or error reports containing real
user data.

## Export and deletion deferral

Full account export and permanent self-service account deletion are not in the
MVP. They are later-release features requiring separate contracts, authorization
tests, retention verification, and legal review. Until then:

- no UI may imply self-service export or deletion is available;
- a trusted operator can fulfill an authenticated support request using an
  audited administrative procedure;
- deletion must remove user-owned active rows and the authentication identity in
  a reviewed order;
- managed backups expire under their documented retention policy rather than
  being selectively rewritten;
- guest JSON export and local clear controls remain available because that data
  never becomes a full server account export.

The later export format should be a versioned JSON archive as the canonical
machine-readable contract, with CSV views considered for human readability.

## Non-goals

The MVP excludes:

- barcode scanning and third-party food databases;
- wearables and health-platform integrations;
- social features, coaching, subscriptions, and shared plans;
- AI-generated recommendations;
- offline-first synchronization;
- native mobile applications;
- medical diagnosis, treatment, or individualized clinical advice;
- full account export and permanent self-service account deletion.

These items require separate discovery, privacy review, threat modeling, and
release plans and must not enter the MVP implicitly.
