# Repository UI requirements

All new or modified user-interface code in `nextjs-dashboard` must comply
with:

- `nextjs-dashboard/docs/UI_DESIGN_SYSTEM.md`
- The atomic hierarchy under `nextjs-dashboard/app/ui`
- The centralized Ant Design theme in
  `nextjs-dashboard/app/ui/theme.ts`

## Rules

1. Reuse shared UI components before creating new ones.
2. Feature code must not import `antd` directly.
3. Use `Button` and `ButtonLink` from
   `nextjs-dashboard/app/ui/atoms/button`.
4. Use `Surface` for cards and panels.
5. Use `PageHeading` for page headings and primary actions.
6. Do not introduce one-off colors, control sizes, borders, radii, or
   shadows.
7. If a shared component is missing, extend the design system at the
   appropriate atomic level.
8. Preserve WCAG 2.2 AA, keyboard navigation, English and Thai text
   expansion, and mobile layouts.
9. Run formatting, linting, type checking, tests, the production build,
   and relevant Playwright projects before completion.
10. Update `nextjs-dashboard/docs/UI_DESIGN_SYSTEM.md` when changing the
    design-system contract.
11. When designing UX/UI, ensure it is modern and properly aligned.
12. Use shared dialogs and toast notifications for confirmations, prompted
    input, and transient feedback. Never use browser `alert`, `confirm`, or
    `prompt` in product UI.
13. Every sub-page must provide a visible way back to its main or parent page
    using the shared back-navigation component. Do not rely only on browser
    history, breadcrumbs, or the sidebar.

## Release workflow safeguards

1. Treat release checkboxes in `nextjs-dashboard/plan.md` as evidence-backed
   state. Reconcile them with the local branch, GitHub PR, and CI state before
   reporting release status.
2. A merged PR or successful CI run does not prove that staging migrations
   were applied or that manual Preview acceptance passed. Mark each gate
   complete only from direct evidence.
3. Before applying staging migrations, verify the Supabase project identity
   and take a recoverable staging backup. Never apply production migrations,
   deploy production, create a release tag, or change the production branch
   without explicit user authorization.
4. Prefer recording post-merge identifiers in the GitHub Release or tracking issue instead of opening an evidence-only
   pull request, unless the release plan explicitly requires an in-repository record.

## Token and execution efficiency

1. Read only relevant file sections. Prefer targeted searches and bounded line ranges over printing complete large
   files.
2. Keep GitHub and CI queries compact. Request only required fields and show successful job-step details only when they
   provide necessary evidence.
3. Do not repeatedly poll pending CI checks. Use auto-merge when authorized and appropriate, or recheck only after a
   meaningful interval.
4. Run focused checks while developing. Run the complete required verification suite once before completion or release.
5. Do not rerun expensive checks when no relevant files changed unless branch protection, release policy, or direct
   evidence requires them.
6. Avoid evidence-only follow-up pull requests when immutable release evidence can be recorded in a GitHub Release or
   tracking-issue comment.
7. Keep progress updates concise and do not repeat evidence already reported.
