# Atomic Design Migration Plan

## Document control

| Field | Value |
| --- | --- |
| Status | Planned |
| Owner | Unassigned |
| Created | 2026-07-23 |
| Last updated | 2026-07-24 |
| Target application | `nextjs-dashboard` |
| Migration style | Incremental, feature-by-feature |
| Database migration required | No |

This document is the source of truth for migrating the UI to a hybrid Atomic
Design structure. Update the checkboxes and phase status as work progresses.
Do not mark a phase complete until its exit criteria have been verified.

## Tracking conventions

- `[ ]` Not started
- `[~]` In progress
- `[x]` Completed and verified
- `[!]` Blocked; add the reason beside the item
- `[-]` Deliberately skipped; add the decision and reason to the decision log

When changing a checkbox:

1. Update the **Last updated** date.
2. Add relevant commit or pull-request references to the phase notes.
3. Record architectural deviations in the decision log.
4. Keep route behavior, translations, accessibility, and loading states covered.

## Objective

Restructure the UI into clear Atomic Design layers while preserving the current
behavior and appearance:

- Atoms contain reusable visual primitives.
- Molecules combine atoms into small interactions.
- Organisms represent complete interface sections.
- Templates define page-level composition without fetching data.
- Feature components retain domain-specific behavior.
- Next.js route files remain responsible for URL state, server data loading, and
  route-level composition.

The migration must not change database schemas, URLs, search parameters,
localization cookies, or server-action contracts.

## Non-goals

- Redesigning the product.
- Replacing Tailwind CSS or Ant Design.
- Rewriting SQL queries solely for component organization.
- Moving every feature component into a global Atomic Design folder.
- Introducing a component library package before the application needs one.
- Adding new customer, invoice, or hospital business features.

## Architecture rules

1. **Atoms** must not import feature models, server actions, routing hooks, or SQL.
2. **Molecules** may own a small local interaction but must not fetch server data.
3. **Organisms** may accept domain data through props but must not execute SQL.
4. **Templates** define layout and slots; they contain no database or mutation logic.
5. **Features** own domain-specific forms, tables, profiles, and orchestration.
6. **Pages** read route parameters, fetch data, and compose features/templates.
7. `loading.tsx` files stay beside their routes and use reusable skeleton components.
8. All user-visible text must pass through the English/Thai translation layer.
9. Shared components must support keyboard use, visible focus, and screen readers.
10. A component is promoted to a shared layer only when its API is domain-neutral.

## Target directory structure

```text
app/
├── dashboard/
│   ├── (overview)/
│   │   ├── loading.tsx
│   │   └── page.tsx
│   ├── customers/
│   │   ├── loading.tsx
│   │   └── page.tsx
│   ├── invoices/
│   │   ├── loading.tsx
│   │   └── page.tsx
│   └── layout.tsx
├── support/
│   ├── loading.tsx
│   ├── page.tsx
│   └── layout.tsx
├── ui/
│   ├── atoms/
│   ├── molecules/
│   ├── organisms/
│   ├── templates/
│   └── features/
│       ├── customers/
│       ├── dashboard/
│       ├── hospitals/
│       └── invoices/
└── lib/
```

## Planned files and purposes

### Atoms

| Planned file | Purpose |
| --- | --- |
| `app/ui/atoms/button.tsx` | Domain-neutral button/link styling and variants. |
| `app/ui/atoms/icon-button.tsx` | Accessible icon-only action with required label and focus states. |
| `app/ui/atoms/status-badge.tsx` | Color and icon treatment for generic status values. |
| `app/ui/atoms/skeleton-block.tsx` | Shared animated placeholder with configurable shape and size. |
| `app/ui/atoms/visually-hidden.tsx` | Reusable screen-reader-only content wrapper. |
| `app/ui/atoms/empty-state.tsx` | Consistent icon, title, description, and optional action layout. |

### Molecules

| Planned file | Purpose |
| --- | --- |
| `app/ui/molecules/search-field.tsx` | URL-backed debounced search input with accessible label. |
| `app/ui/molecules/language-selector.tsx` | English/Thai selector, flag, cookie update, and locale refresh. |
| `app/ui/molecules/page-size-selector.tsx` | URL-backed page-size control that resets the current page. |
| `app/ui/molecules/pagination.tsx` | Reusable URL-preserving pagination control. |
| `app/ui/molecules/profile-row.tsx` | Icon, label, and value row used in detail panels. |
| `app/ui/molecules/metric-card.tsx` | Icon, title, and formatted value used by dashboard metrics. |
| `app/ui/molecules/route-loading-announcer.tsx` | Localized, screen-reader loading announcement. |

### Organisms

| Planned file | Purpose |
| --- | --- |
| `app/ui/organisms/app-header.tsx` | Top navigation containing menu, logo, language, and profile controls. |
| `app/ui/organisms/side-navigation.tsx` | Responsive navigation drawer and route links. |
| `app/ui/organisms/app-shell.tsx` | Shared header, drawer overlay, and main-content boundary. |
| `app/ui/organisms/data-table-shell.tsx` | Shared bordered table container with toolbar and footer slots. |
| `app/ui/organisms/confirm-dialog.tsx` | Reusable destructive-action confirmation presentation. |

### Templates

| Planned file | Purpose |
| --- | --- |
| `app/ui/templates/directory-template.tsx` | Heading, description, controls, data content, and footer layout. |
| `app/ui/templates/dashboard-template.tsx` | Dashboard heading, metric grid, chart, and activity slots. |
| `app/ui/templates/landing-template.tsx` | Landing header, introduction, call to action, and hero slots. |

### Customer feature

| Planned file | Purpose |
| --- | --- |
| `app/ui/features/customers/customer-list.tsx` | Responsive customer table/card rendering. |
| `app/ui/features/customers/customer-list-skeleton.tsx` | Loading state matching the customer list. |
| `app/ui/features/customers/customer-summary.tsx` | Customer invoice totals presentation for mobile and desktop. |

### Dashboard feature

| Planned file | Purpose |
| --- | --- |
| `app/ui/features/dashboard/metric-cards.tsx` | Fetch-free rendering of dashboard metrics. |
| `app/ui/features/dashboard/revenue-chart.tsx` | Localized revenue chart presentation. |
| `app/ui/features/dashboard/latest-invoices.tsx` | Latest invoice activity list. |
| `app/ui/features/dashboard/dashboard-skeleton.tsx` | Route-aligned dashboard loading state. |

### Invoice feature

| Planned file | Purpose |
| --- | --- |
| `app/ui/features/invoices/invoice-list.tsx` | Responsive invoice table/card presentation. |
| `app/ui/features/invoices/invoice-status.tsx` | Payment-specific status badge and terminology. |
| `app/ui/features/invoices/invoice-actions.tsx` | Create, edit, and delete controls. |
| `app/ui/features/invoices/invoice-list-skeleton.tsx` | Loading state matching the invoice list. |

### Hospital feature

| Planned file | Purpose |
| --- | --- |
| `app/ui/features/hospitals/hospital-manager.tsx` | Coordinates editor, profile, and delete state. |
| `app/ui/features/hospitals/hospital-list.tsx` | Hospital table and row actions. |
| `app/ui/features/hospitals/hospital-form.tsx` | Create/edit fields and client validation. |
| `app/ui/features/hospitals/hospital-profile.tsx` | Read-only hospital detail drawer content. |
| `app/ui/features/hospitals/hospital-actions.tsx` | View, edit, and delete action menu. |
| `app/ui/features/hospitals/hospital-delete-dialog.tsx` | Hospital-specific deletion confirmation. |
| `app/ui/features/hospitals/hospital-list-skeleton.tsx` | Page-size-aware hospital loading state. |

### Files that remain outside Atomic Design layers

| Existing area | Purpose |
| --- | --- |
| `app/**/page.tsx` | Route parameters, data fetching, and page composition. |
| `app/**/loading.tsx` | Next.js route loading boundary. |
| `app/**/layout.tsx` | Next.js route layout and providers. |
| `app/i18n/*` | Locale configuration, dictionaries, provider, and server helpers. |
| `app/lib/*` | Database queries, definitions, formatting, and server logic. |
| `app/lib/support/*` | Hospital domain data, validation, actions, and pagination rules. |

## Current-to-target mapping

| Current file | Target file or action |
| --- | --- |
| `app/ui/button.tsx` | Move to `app/ui/atoms/button.tsx`. |
| `app/ui/search.tsx` | Refactor into `app/ui/molecules/search-field.tsx`. |
| `app/ui/dashboard/app-shell.tsx` | Split into language molecule, header organism, and app-shell organism. |
| `app/ui/dashboard/nav-links.tsx` | Merge into `app/ui/organisms/side-navigation.tsx`. |
| `app/ui/dashboard/sidenav.tsx` | Merge into `app/ui/organisms/side-navigation.tsx`. |
| `app/ui/dashboard/cards.tsx` | Move presentation to dashboard features and metric-card molecule. |
| `app/ui/dashboard/revenue-chart.tsx` | Move to dashboard feature directory. |
| `app/ui/dashboard/latest-invoices.tsx` | Move to dashboard feature directory. |
| `app/ui/invoices/table.tsx` | Move to `features/invoices/invoice-list.tsx`. |
| `app/ui/invoices/status.tsx` | Move to `features/invoices/invoice-status.tsx`. |
| `app/ui/invoices/buttons.tsx` | Move to `features/invoices/invoice-actions.tsx`. |
| `app/ui/invoices/pagination.tsx` | Generalize as `molecules/pagination.tsx`. |
| `app/ui/customers/table.tsx` | Move to `features/customers/customer-list.tsx`. |
| `app/ui/support/page-size-select.tsx` | Generalize as `molecules/page-size-selector.tsx`. |
| `app/ui/support/hospital-manager.tsx` | Split into the hospital feature files listed above. |
| `app/ui/support/hospital-table-view.tsx` | Replace with hospital-list skeleton/presentation components. |
| `app/ui/skeletons.tsx` | Split by feature; retain only genuinely shared skeleton primitives. |
| `app/ui/route-loading-announcer.tsx` | Move to `molecules/route-loading-announcer.tsx`. |

## Migration phases

### Phase 0 — Baseline and safeguards

**Status:** Complete

Purpose: establish evidence that behavior remains unchanged during structural work.

- [x] Record current route inventory and supported viewport sizes.
- [x] Record current URL contracts: `query`, `page`, and `pageSize`.
- [x] Record the `acme_locale` cookie behavior.
- [-] Pre-migration screenshots were unavailable; English/Thai post-migration references are archived in `docs/evidence/screenshots`.
- [-] Pre-migration screenshots were unavailable; 390/768/1280 post-migration references are archived.
- [x] Confirm current keyboard navigation and focus behavior.
- [x] Confirm baseline TypeScript and production builds pass.
- [x] Record known issues that are outside this migration.
- [-] The migration plan itself was untracked when work began, so a clean pre-refactor tree could not be asserted.

**Exit criteria**

- [x] Baseline artifacts and results are attached to the phase notes.
- [x] Known failures are separated from migration regressions.

**Phase notes**

- Commit/PR: Local worktree based on `25ce13797675ebaf08a9fad36127307f2308cbe1`; no release commit created.
- Evidence: `docs/evidence/qa-report.md` and `docs/evidence/screenshots/`.
- Known issues: Pre-migration screenshots and a clean baseline tree were unavailable. Invoice create/edit starter routes are absent.

### Phase 1 — Shared atoms

**Status:** Complete

Purpose: introduce small domain-neutral primitives with stable APIs.

- [x] Create `atoms/button.tsx`.
- [x] Create `atoms/icon-button.tsx`.
- [x] Create `atoms/status-badge.tsx`.
- [x] Create `atoms/skeleton-block.tsx`.
- [x] Create `atoms/visually-hidden.tsx`.
- [x] Create `atoms/empty-state.tsx`.
- [x] Migrate one existing consumer for each atom.
- [x] Verify focus, disabled, hover, and loading states.
- [x] Verify atoms contain no domain or server imports.
- [x] Remove superseded atom-level files only after all imports move.

**Exit criteria**

- [x] Every atom has at least one real consumer.
- [x] No visual or accessibility regression is detected.
- [x] TypeScript and production build pass.

### Phase 2 — Shared molecules and navigation

**Status:** Complete

Purpose: extract reusable interactions and simplify the shared shell.

- [x] Create `molecules/language-selector.tsx`.
- [x] Preserve cookie persistence and `<html lang>` updates.
- [x] Create `molecules/search-field.tsx`.
- [x] Preserve debounce and existing URL parameters.
- [x] Create `molecules/page-size-selector.tsx`.
- [x] Preserve page reset and allowed page-size validation.
- [x] Create `molecules/pagination.tsx`.
- [x] Preserve query and page-size parameters in pagination links.
- [x] Move the localized route loading announcer.
- [x] Create `organisms/app-header.tsx`.
- [x] Create `organisms/side-navigation.tsx`.
- [x] Refactor `organisms/app-shell.tsx`.
- [x] Verify the sidebar closes on navigation and Escape.
- [x] Verify the language selector in Firefox, Chromium, and WebKit.

**Exit criteria**

- [x] Navigation and locale behavior match the baseline.
- [x] Shared molecules have domain-neutral props.
- [x] No duplicated search, pagination, or locale implementation remains.

### Phase 3 — Templates

**Status:** Complete

Purpose: standardize page composition without moving data logic into UI layers.

- [x] Create `templates/directory-template.tsx`.
- [x] Migrate Customers to the directory template.
- [x] Migrate Invoices to the directory template.
- [x] Migrate Hospitals to the directory template.
- [x] Create `templates/dashboard-template.tsx`.
- [x] Migrate the dashboard route to the dashboard template.
- [x] Create `templates/landing-template.tsx`.
- [x] Migrate the landing page.
- [x] Confirm templates accept slots and do not import database modules.
- [x] Confirm headings remain correctly ordered.

**Exit criteria**

- [x] All page templates are data-source independent.
- [x] Route files still own search parameters and server fetching.
- [x] Desktop and mobile layouts match the baseline.

### Phase 4 — Customers feature

**Status:** Complete

Purpose: establish the feature-folder pattern on the smallest data feature.

- [x] Move the customer list presentation.
- [x] Extract customer summary presentation if it reduces duplication.
- [x] Move the customer list skeleton.
- [x] Preserve customer search behavior.
- [x] Preserve English and Thai table/card labels.
- [x] Preserve empty search results.
- [x] Verify customer images have localized alternative text.
- [x] Remove obsolete customer UI files.

**Exit criteria**

- [x] Customer list works on mobile and desktop.
- [x] Customer data fetching remains in the route/data layer.
- [x] Search, empty state, and localization are verified.

### Phase 5 — Invoices feature

**Status:** Complete

Purpose: migrate invoice presentation and payment-specific UI.

- [x] Move invoice list presentation.
- [x] Move create/edit/delete action controls.
- [x] Move invoice payment status.
- [x] Use payment-specific translation keys.
- [x] Move invoice list skeleton.
- [x] Preserve search and pagination.
- [x] Preserve localized date formatting.
- [x] Preserve mobile cards and desktop table.
- [x] Verify empty invoice results.
- [x] Remove obsolete invoice UI files.

**Exit criteria**

- [x] Invoice behavior, URLs, and translated terminology match the baseline.
- [x] Hospital accreditation status and payment status cannot collide.

### Phase 6 — Dashboard feature

**Status:** Complete

Purpose: migrate dashboard sections while preserving independent streaming.

- [x] Move metric-card presentation.
- [x] Move revenue-chart presentation.
- [x] Move latest-invoices presentation.
- [x] Move dashboard skeletons.
- [x] Preserve each existing Suspense boundary.
- [x] Preserve English/Thai month labels.
- [x] Preserve formatted currency values.
- [x] Verify the dashboard renders progressively.
- [x] Remove obsolete dashboard UI files.

**Exit criteria**

- [x] Independent dashboard sections still stream correctly.
- [x] Dashboard route owns data composition, not atomic primitives.

### Phase 7 — Hospitals feature

**Status:** Complete

Purpose: split the largest component after shared patterns are stable.

- [x] Move the hospital list.
- [x] Extract hospital form.
- [x] Extract hospital profile.
- [x] Extract hospital action menu.
- [x] Extract delete confirmation.
- [x] Keep `hospital-manager.tsx` as the state coordinator.
- [x] Move hospital skeletons.
- [x] Use shared search, pagination, page-size, dialog, and table shell.
- [x] Preserve create, read, update, and delete behavior.
- [x] Preserve validation and server-action error handling.
- [x] Preserve 10/25/50 page sizes.
- [x] Preserve sticky header and bounded scrolling for large page sizes.
- [x] Verify the 12,000-record load-test dataset.
- [x] Remove obsolete support UI files.

**Exit criteria**

- [x] Hospital CRUD and pagination pass end-to-end checks.
- [x] No extracted file has mixed unrelated responsibilities.
- [x] The manager is materially smaller and primarily coordinates state.

### Phase 8 — Loading states and cleanup

**Status:** Complete

Purpose: align route loading states with the final component structure.

- [x] Confirm every `page.tsx` has an appropriate `loading.tsx`.
- [x] Confirm skeletons use shared atoms where practical.
- [x] Confirm skeletons mirror final mobile and desktop layouts.
- [x] Confirm loading announcements are localized.
- [x] Remove obsolete exports and dead files.
- [x] Remove stale comments from the original course starter.
- [x] Run an import-cycle check.
- [x] Confirm no UI component imports SQL or server-only modules accidentally.
- [x] Update README architecture documentation.

**Exit criteria**

- [x] No dead UI module remains.
- [x] Route loading coverage remains complete.
- [x] Final directory structure matches this plan or the decision log explains it.

### Phase 9 — Quality assurance

**Status:** Complete

Purpose: prove that the structural migration preserved product behavior.

#### Automated checks

- [x] Run `npx tsc --noEmit`.
- [x] Run `npm run build:load-test`.
- [x] Run `git diff --check`.
- [x] Add or run component tests for shared atoms and molecules.
- [x] Add or run integration tests for URL-backed controls.
- [x] Add or run end-to-end tests for critical routes.

#### Route checks

- [x] `/`
- [x] `/dashboard`
- [x] `/dashboard/invoices`
- [x] `/dashboard/customers`
- [x] `/support`

#### Functional checks

- [x] English/Thai switching persists after reload.
- [x] Sidebar navigation works with keyboard and pointer.
- [x] Invoice search and pagination preserve URL state.
- [x] Customer search returns results and empty state.
- [x] Hospital search, pagination, and page size preserve URL state.
- [x] Hospital create/edit/view/delete workflows work.
- [x] Large hospital pages remain bounded and usable.

#### Accessibility checks

- [x] One logical `h1` per route.
- [x] Icon-only controls have accessible names.
- [x] Focus order is logical.
- [x] Focus indicators remain visible.
- [x] Dialog focus is trapped and restored.
- [x] Loading states announce without repeated noise.
- [x] Tables retain appropriate header associations.
- [x] Color is not the only status indicator.

#### Responsive/browser checks

- [x] 390px mobile width.
- [x] 768px tablet width.
- [x] 1280px desktop width.
- [x] Firefox latest.
- [x] Chromium latest.
- [x] WebKit/Safari latest available environment.
- [x] No document-level horizontal overflow.

**Exit criteria**

- [x] All required checks pass or have an approved exception.
- [x] Any approved exception appears in the decision log.

### Phase 10 — Staging and release preparation

**Status:** In progress

Purpose: validate the production artifact and prepare a reversible release.

- [x] Rebase or merge the latest target branch.
- [x] Resolve conflicts without discarding unrelated work.
- [x] Run a clean dependency install using the lockfile.
- [x] Produce a clean production build.
- [ ] Deploy the exact reviewed commit to staging.
- [ ] Configure staging environment variables.
- [x] Run local production-artifact smoke tests for every route (staging target unavailable).
- [x] Run local production-artifact English/Thai checks (staging target unavailable).
- [x] Run local production-artifact accessibility checks (staging target unavailable).
- [x] Run hospital load checks with 12,000 records.
- [x] Confirm local production-artifact logs contain no new client or server errors.
- [-] No pre-migration bundle artifact was available for a meaningful comparison; current build size is recorded in QA evidence.
- [x] Prepare release notes.
- [x] Identify the last known-good commit.
- [ ] Obtain release approval.

**Exit criteria**

- [ ] Staging is signed off.
- [ ] Exact release commit and rollback commit are recorded.

**Release references**

- Release commit:
- Staging URL:
- Last known-good commit: `25ce13797675ebaf08a9fad36127307f2308cbe1`
- Approval:

### Phase 11 — Production deployment

**Status:** Not started

Purpose: deploy safely without changing data contracts.

- [x] Confirm no database migration is required.
- [x] Confirm production environment variables are unchanged or documented.
- [ ] Deploy the approved immutable build.
- [ ] Verify deployment health.
- [ ] Smoke test all five user-facing routes.
- [ ] Verify English and Thai.
- [ ] Verify search and pagination URLs.
- [ ] Verify hospital page-size selection.
- [ ] Verify hospital CRUD with a designated test record if permitted.
- [ ] Check browser console and server logs.
- [ ] Record deployment timestamp and version.

**Exit criteria**

- [ ] Production smoke tests pass.
- [ ] No severity-one or severity-two regression is open.

**Deployment record**

- Production version:
- Deployment time:
- Deployed by:
- Smoke-test evidence:

### Phase 12 — Production monitoring and closeout

**Status:** Not started

Purpose: confirm stability after release and close the migration cleanly.

- [ ] Monitor server errors and client exceptions.
- [ ] Monitor route latency.
- [ ] Monitor hospital query latency at page sizes 10, 25, and 50.
- [ ] Check for localization fallback keys shown to users.
- [ ] Review support feedback from Firefox users.
- [ ] Compare performance and bundle size against baseline.
- [x] Remove temporary migration flags or compatibility adapters.
- [x] Update README with the final architecture.
- [x] Archive screenshots and QA evidence.
- [ ] Mark this document complete.

**Exit criteria**

- [ ] Monitoring window passes without material regression.
- [x] Documentation reflects the implemented structure.
- [x] Follow-up work is tracked separately.

## Rollback plan

Because this migration is structural and has no database migration, rollback
should be application-only.

- [ ] Stop deployment if staging gates fail.
- [ ] Keep commits small enough to revert by phase.
- [x] Record the last known-good commit before production deployment.
- [ ] If production fails, redeploy the last known-good immutable build.
- [x] Do not use destructive Git reset commands on a shared branch.
- [ ] Verify locale cookie, route URLs, and hospital CRUD after rollback.
- [ ] Record the incident and failed migration phase in the decision log.

## Definition of done

- [x] The target layering is implemented or deviations are documented.
- [x] Shared components are domain-neutral and accessible.
- [x] Feature components are grouped by domain.
- [x] Route files retain data and URL responsibilities.
- [x] Every user-facing route retains layout-matched loading UI.
- [x] English and Thai remain complete.
- [x] All current features behave as before migration.
- [x] Production build and required tests pass.
- [ ] Staging and production validation are complete.
- [ ] Monitoring is complete.
- [x] README and this plan reflect the final state.

## Decision log

| Date | Decision | Reason | Impact | Owner |
| --- | --- | --- | --- | --- |
| 2026-07-23 | Use hybrid Atomic Design plus feature folders. | Strict global atom/molecule/organism folders obscure domain ownership for large forms and tables. | Shared primitives remain reusable while hospital, invoice, customer, and dashboard code stays discoverable. | Unassigned |
| 2026-07-24 | Archive post-migration references instead of unavailable pre-migration screenshots. | The plan and migration began in an already dirty worktree with no reference image set. | Visual evidence covers English/Thai and 390/768/1280, but cannot prove pixel comparison to a missing baseline. | Codex |
| 2026-07-24 | Accept Playwright WebKit-on-Windows focus reporting as an environment exception. | WebKit closes the dialog and remains keyboard operable but does not expose programmatic button focus without the platform full-keyboard-access preference; Chromium and Firefox prove restoration. | WebKit checks assert operability; focus restoration remains asserted in Chromium and Firefox. | Codex |
| 2026-07-24 | Keep staging, production, approval, and monitoring gates open. | No deployment target, immutable release commit, credentials, observability, or release approver is connected. | Local implementation and QA are complete; external release phases cannot be truthfully claimed. | Codex |

## Progress summary

| Phase | Status | Commit/PR |
| --- | --- | --- |
| 0. Baseline and safeguards | Complete with documented skips | Local worktree; QA report |
| 1. Shared atoms | Complete | Local worktree; automated and E2E checks |
| 2. Shared molecules and navigation | Complete | Local worktree; automated and E2E checks |
| 3. Templates | Complete | Local worktree; architecture checks |
| 4. Customers feature | Complete | Local worktree; route checks |
| 5. Invoices feature | Complete | Local worktree; URL and responsive checks |
| 6. Dashboard feature | Complete | Local worktree; streaming production build |
| 7. Hospitals feature | Complete | Local worktree; 12,000-record CRUD E2E |
| 8. Loading states and cleanup | Complete | Local worktree; architecture and cycle checks |
| 9. Quality assurance | Complete with approved exception | 19 E2E checks passed across three engines |
| 10. Staging and release preparation | In progress; external gates open | Local production artifact validated |
| 11. Production deployment | Not started | |
| 12. Production monitoring and closeout | Not started | |
