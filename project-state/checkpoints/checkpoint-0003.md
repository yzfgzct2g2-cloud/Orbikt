# Checkpoint CP-0003

## Current Phase

Phase 2 — Command Center depth: Calendar / Schedule adapter

## Status

PHASE_2_COMPLETE

## Summary

Added a first-class Calendar/Schedule capability to the DataAdapter and a
"Today Schedule" widget to the Command Center, completing the migration-map
Dashboard widget "Today Schedule → Calendar adapter (Google Calendar / ICS-ready)".

## Delivered

- `ScheduleEvent` type (ICS/Google-Calendar-ready: start/end ISO datetimes,
  kind, optional location) in `src/adapters/types.ts`.
- `DataAdapter.listSchedule(dayISO?)` added to the interface.
- `Cs100DataAdapter.listSchedule` — two standing team meetings (個管晨會,
  個案研討會) plus a visit entry for every case whose next visit falls on the
  day; sorted by start time.
- Command Center "今日行程 Today Schedule" widget (loads via the adapter,
  links visit rows to the case Workspace).

## Architecture / SSOT

- Schedule is a mock Calendar source behind the adapter seam; a real Google
  Calendar / ICS adapter swaps in with no UI change.
- A scheduled visit is a *calendar entry*, not a visit-warning recalculation —
  Visit Manager remains the SSOT for warnings.

## Build / Type Check / Tests / Lint

- Build: PASS (`tsc -b && vite build`, 73 modules, bundle ~415 kB / gzip 89 kB).
- Typecheck: PASS.
- Tests: PASS — 20/20 (added a schedule test: sorted, standing meetings present,
  visit events reference real cases and fall on the requested day).
- Lint: PASS.
- Runtime smoke: Command Center renders the schedule (meetings + visits), no
  console errors.

## Next Step

Phase 3 — Command Center consolidation pass: confirm every Dashboard widget in
migration-map maps to its declared source (Total Caseload, Today Tasks, Today
Schedule, Visit warnings, Dispatch, Documents, Recent Cases, Notifications).
