# CP-0028 — Team Calendar V1

Date: 2026-07-18

Objective: `obj-orbikt-team-calendar-v1`

Version: 1.7.1

State: Verified

## Delivered

- First-class `/calendar` route and navigation entry.
- Responsive month, week, day, and mobile list views with Asia/Taipei dates.
- Team filters, progress counts, create/edit/detail/complete/cancel workflows.
- Owner/participant permissions, case-link authorization, soft delete and
  supervisor restore through the mock-auth role seam.
- Browser-local persistence behind `CalendarAdapter`; page reload preserves
  manual events in the same browser profile.
- Read-only Visit Manager event projections with source links; no duplicated
  visit-warning rules.
- Command Center today's team schedule summary and full-calendar entry.
- Design/spec and implementation plan under `docs/superpowers/`.

## Evidence

- `npm run typecheck`: PASS.
- `npm run lint`: PASS.
- `npm test -- --reporter=dot`: PASS, 29 files / 219 tests.
- `npm run build`: PASS, 124 modules; JS 628.35 kB (140.08 kB gzip), existing
  Vite chunk-size warning only.
- Real-browser workflow: create, persist, open, complete; 390×844 responsive
  list; console 0 errors (2 React Router v7 future-flag warnings).

## Boundary

This checkpoint does not provide cross-device or cross-account shared data.
Production sharing remains blocked on an authenticated backend/API and
server-side authorization or RLS. Google Calendar synchronization is not part
of V1.
