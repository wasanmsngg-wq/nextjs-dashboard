# Phase 1 Manual Accessibility Acceptance

Date prepared: 2026-07-27  
Environment: isolated Vercel Preview  
Target: WCAG 2.2 AA

## Automated evidence

The complete local suite passed before this matrix was prepared:

- 175/175 Playwright checks across Chromium, Firefox, WebKit, Pixel, and
  iPhone projects.
- English and Thai axe scans for landing, login, signup, password recovery,
  password update, dashboard, profile, and guest-import pages.
- English and Thai authenticated axe scans for the administrator customer
  directory.
- Keyboard profile submission and live-region status verification.
- Mobile navigation initial focus, focus containment, Escape close, and focus
  restoration.
- 320 CSS-pixel reflow with WCAG text-spacing overrides.
- Source-derived verification that every literal application translation key
  has a Thai translation.

Automated checks do not replace human inspection. The observations below must
be completed by the product owner on the stable Preview before manual
accessibility acceptance is recorded.

## Owner observation matrix

| Check                          | Pages                                                                | Expected result                                                                                   | Status              |
| ------------------------------ | -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | ------------------- |
| English and Thai visual review | Dashboard, profile, import, admin customers                          | Text is understandable, visible, and not clipped or overlapping                                   | Passed — 2026-07-27 |
| Keyboard and visible focus     | Dashboard navigation and profile form                                | Focus is always visible and follows a sensible order                                              | Passed — 2026-07-27 |
| Navigation focus lifecycle     | Mobile-width dashboard                                               | Focus enters the menu, stays contained with Tab/Shift+Tab, and returns to the opener after Escape | Passed — 2026-07-27 |
| 400% zoom/reflow               | Landing, authentication, dashboard, profile, import, admin customers | Content remains usable without two-dimensional scrolling or hidden controls                       | Passed — 2026-07-27 |
| Registered profile persistence | Profile settings                                                     | Saved preferences remain after refresh and success is announced                                   | Passed — 2026-07-27 |

## Recording the result

When all rows pass, replace each status with `Passed — 2026-07-27` and add the
browser/device used below. If a row fails, record the page, language,
viewport/zoom, keyboard sequence, expected behavior, and observed behavior.

Browser/device: Owner-tested keyboard and low-resolution browser

Reviewer: Product owner

Notes: Translation, keyboard navigation, low-resolution layout, registered
profile persistence, and the corrected hosted admin shell passed. The initial
admin-page review found the application shell missing; commit `84aa92a` corrected
it and added authenticated English/Thai top-bar/sidebar assertions before the
owner retested it successfully.
