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
