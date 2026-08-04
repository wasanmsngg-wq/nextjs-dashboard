# Exercise Tracker UI design system

The application uses an atomic component hierarchy backed by Ant Design. New
feature code must compose these project components instead of importing Ant
Design directly or inventing new colors, control sizes, and interaction states.

## Source of truth

- `app/ui/theme.ts`: semantic colors, radii, control sizes, and the Ant Design
  theme configuration.
- `app/ui/atoms`: single-purpose controls and visual primitives.
- `app/ui/molecules`: small compositions such as page headings and search
  fields.
- `app/ui/organisms`: application navigation and shell structures.
- `app/ui/templates`: page-level composition without feature data access.
- `app/features/*/ui`: feature components that consume the shared layers.

Dependencies flow downward: features may use any shared UI layer, templates
may use organisms/molecules/atoms, and shared UI never imports feature actions
or database modules.

## Core rules

1. Use `Button` or `ButtonLink` from `app/ui/atoms/button`. Choose one of the
   semantic variants: `primary`, `secondary`, `quiet`, or `danger`.
2. Use `Surface` for bordered cards and panels. Do not repeat border, radius,
   background, and shadow utilities in feature code.
3. Use `PageHeading` for page identity, supporting copy, and primary actions.
4. Use semantic values from `designTokens` when a new shared component needs a
   value that cannot be expressed through the configured Ant component.
5. Feature code must not import from `antd`. Add or extend a project primitive
   so accessibility, localization, sizing, and visual behavior remain
   consistent.
6. Preserve visible focus, keyboard operation, WCAG 2.2 AA contrast, 44-pixel
   primary touch targets, English/Thai text expansion, and narrow-screen
   layouts.
7. Use the shared `Dialog` molecule for confirmations or prompted input and
   `Toast` for transient action feedback. Product UI must not call browser
   `alert`, `confirm`, or `prompt`.
8. Every sub-page exposes a visible `BackNavigation` link to its stable parent
   page. Sidebar submenus complement this escape route but do not replace it.
9. Route changes initiated from application navigation show the shared
   transition loading state immediately, including while a protected server
   route is still resolving.
10. Sidebar groups with child destinations use the shared collapsible pattern.
    The active route group opens automatically, inactive groups start collapsed,
    and the parent destination remains a separate link from the accessible
    expand/collapse control.

## Adding a component

Start at the smallest reusable level. Add an atom only for one interaction or
visual responsibility. Combine atoms into a molecule when they repeatedly
appear together. Use organisms for substantial application regions, and
templates only for page structure. Include accessible naming and states in the
component API, add a focused test, and demonstrate the component in a real
feature before introducing another variant.

`BackNavigation` is the standard sub-page escape route. Use the inverse variant
only on dark surfaces. `RouteTransitionLoading` belongs to the application
shell and must not be recreated by feature pages.

## Migration policy

Existing pages are migrated incrementally when they are changed. Any modified
button, card, page heading, input, selection control, alert, or dialog must be
moved to the shared system as part of that change. Direct Ant Design imports in
feature code are rejected by the architecture tests.
