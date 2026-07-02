# Checkpoint CP-0007

## Current Phase

Phase 5 — Visit Manager shell integration

## Status

PHASE_5_COMPLETE

## Summary

Established `src/modules/visit/visitManager.ts` as the SINGLE visit-warning code
path in Orbikt, reinforcing the SSOT rule: Orbikt reads/links the Visit Manager
(GAS) result and never recalculates a second countdown.

## Delivered

- `src/modules/visit/visitManager.ts`
  - `visitManager` metadata: SSOT source label, GAS URL, external status
    (from integrations.json), `mode: "read_or_link"`.
  - `bucketVisitWarnings(cases)` — groups cases by the Visit-Manager-provided
    `visit.status` (a grouping, NOT a recalculation), most-urgent-first.
- Command Center visit warnings now go through `bucketVisitWarnings`; rows
  enriched with the migration-map fields (case name, manager, next due date,
  remaining days, status) and link to the case's Visit tab. Header shows the
  SSOT source + external link.
- Workspace Visit tab references the same `visitManager` metadata (single
  source of the URL/label).
- Tests: `visitManager.test.ts` (grouping correctness, urgency sort, metadata).

## SSOT integrity (explicit)

There is now exactly one place that reads visit warnings. In V1 the status/dates
originate from the case seed (standing in for the GAS output); wiring the live
GAS read later changes only the data source behind `bucketVisitWarnings`, not
any caller. No second countdown algorithm exists anywhere.

## Build / Type Check / Tests / Lint

- Build: PASS (bundle ~432 kB / gzip 93 kB).
- Typecheck: PASS · Tests: 31/31 PASS · Lint: PASS.
- Runtime smoke: visit warnings show SSOT label + next-due/remaining-days and
  link to the Visit tab; no console errors.

## Note / future

- A live GAS fetch would require external authorization and response parsing
  (the endpoint returns an HTML web app). That is out of V1 scope; the module
  seam is ready for it. Not a blocker.

## Next Step

Phase 6 — Integrate Dispatch shell: external status panel + Workspace Dispatch
tab + API-ready adapter, showing dispatch status without rebuilding dispatch
logic.
