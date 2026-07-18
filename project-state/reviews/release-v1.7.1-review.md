# Orbikt v1.7.1 Release Review — Team Calendar V1

Date: 2026-07-18

Objective: `obj-orbikt-team-calendar-v1`

## Blueprint and SSOT review

PASS. Command Center remains the homepage and summary surface. Case events link
to Case Workspace. Visit Manager is read-only projected; AA01, FA310, and
Dispatch rules are not copied. The calendar owns only manual coordination
events.

## Permission and privacy review

PASS for the documented mock-auth V1 boundary. Case managers mutate only their
own manual events; supervisors/admin roles manage all and restore; participants
are read-only; source events are protected. Case linking is limited to assigned
cases for case managers. Calendar data contains no newly introduced raw IDs,
phones, addresses, birth dates, or medical details.

UI/store permissions are not backend security. A shared adapter must repeat
these checks server-side through authorization/RLS.

## Persistence and integration review

PASS for V1 scope. Local storage survives reload in one browser profile through
the adapter seam. It is not team-shared production persistence. Google Calendar
was not connected; no OAuth, external calendar write, or two-way sync exists.

## QA review

- Typecheck: PASS.
- Lint: PASS.
- Unit/integration tests: PASS, 219/219.
- Build: PASS.
- Browser operation: PASS; create/open/complete and mobile list verified with
  zero console errors.
- Regression coverage: all existing 140 tests plus calendar tests passed.

`npm audit` reports 6 existing dependency advisories: Vite/Vitest development
server findings (major-version upgrades required) and SheetJS `xlsx` findings
with no registry fix available. The production launcher serves built static
files on localhost and does not expose Vitest UI, which reduces the dev-server
attack surface but does not resolve the advisories. No forced breaking upgrade
was made inside this feature objective; dependency remediation requires its own
verified upgrade checkpoint.

## Known limitations and next safe action

The calendar cannot yet share manual events across devices/accounts. When real
auth and backend credentials are available, implement a Supabase/API
`CalendarAdapter` with RLS/server authorization, migration from local V1 data,
and multi-user concurrency tests. Keep Google integration as a separate,
privacy-reviewed optional export objective.
