# Production verification

Date: 2026-07-24
Production URL: `https://nextjs-dashboard-eight-jade-42.vercel.app/`
Implementation release: `a23e8dbc02c9fb0776b166571de061279411b86a`
Rollback commit: `25ce13797675ebaf08a9fad36127307f2308cbe1`

## Deployment health

- Vercel production alias served the new Atomic Design build.
- `/`, `/dashboard`, `/dashboard/invoices`, `/dashboard/customers`, and
  `/support` returned HTTP 200.
- Every route had one logical `h1`.
- No failed resources, page exceptions, or document-level horizontal overflow
  were detected at 390px, 768px, or 1280px.
- A background prefetch to the absent course-starter invoice-create route was
  found during the first smoke pass, fixed in `a23e8db`, redeployed, and
  verified absent.

## Functional verification

- Thai selection set `acme_locale=th`, updated `<html lang="th">`, and persisted
  the translated dashboard after reload.
- Sidebar opened by pointer and closed with Escape.
- Invoice search produced `page=1&query=alice`.
- Hospital page size changed
  `query=bangkok&page=3&pageSize=10` to
  `query=bangkok&page=1&pageSize=25`.
- The disposable record `Atomic Production QA a23e8db` was created, viewed,
  updated from 42 to 43 beds, deleted, and confirmed absent.

## Production latency samples

Three uncached HTTP samples per route:

| Route | Average |
| --- | ---: |
| `/` | 0.531 s |
| `/dashboard` | 3.643 s |
| `/dashboard/invoices` | 1.389 s |
| `/dashboard/customers` | 0.883 s |
| `/support?pageSize=10` | 1.130 s |
| `/support?pageSize=25` | 1.054 s |
| `/support?pageSize=50` | 1.316 s |

No severity-one or severity-two regression was observed during deployment,
functional verification, repeated route requests, or the monitoring window.
