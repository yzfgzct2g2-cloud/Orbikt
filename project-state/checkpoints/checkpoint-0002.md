# Checkpoint CP-0002

## Current Phase

Phase 1 — Case Data Adapter (CS100)

## Status

PHASE_1_COMPLETE

## Summary

Replaced the hand-authored Phase 0 mock cases with a real, sanitized case seed
built from `mock-data/CS100.xlsx` (378 cases). Cases are read exclusively
through the `DataAdapter` interface; no UI component touches the xlsx.

## How CS100 is ingested

1. `scripts/cs100Normalize.mjs` — pure, dependency-free, unit-tested
   normalization logic (ROC→ISO dates, CMS parse, status mapping, tag
   derivation, manager assignment, deterministic seed generators).
2. `scripts/buildCaseSeed.mjs` (`npm run seed:cases`) — reads the xlsx,
   normalizes + sanitizes, and writes:
   - `src/data/seed/cases.generated.json` (bundled, sanitized)
   - `src/data/seed/meta.generated.json` (provenance + distribution stats)
3. `src/adapters/Cs100DataAdapter.ts` — implements `DataAdapter`, reads the
   generated seed, and derives tasks / notifications / timeline from the cases.
4. `src/adapters/index.ts` — `dataAdapter` now points at `Cs100DataAdapter`.

## Privacy (mask/omit sensitive identifiers)

- The national ID (身分證號), birth date, phone, and street addresses are NEVER
  read into the output.
- CRITICAL catch: for ~296 rows the raw 案號 itself embeds the national ID
  (format `CSMS-P<national-id><suffix>`). Every case therefore gets a non-PII
  surrogate id (`C-0001`…`C-0378`); the raw 案號 is dropped entirely.
- Verified: no `[A-Z][0-9]{9}` pattern anywhere in the generated seed; tests
  assert this on both the normalizer output and the adapter output.

## Normalized fields (from CS100)

id (surrogate), name, cmsLevel (nullable), status, age, welfare, area, village,
openDate, assessmentDate, serviceItemCount, careCenter, govAssessor, aUnit,
serviceCodes, tags. Managers assigned by team.json caseload quotas
(45/93/97/90/53 = 378), keeping team.json as the caseload reference.

## Seed provenance (V1 stand-ins)

visit / dispatch / aa01 / fa310 are deterministic seed stand-ins generated in
the data layer (never in the UI), to be replaced by their SSOT adapters in
Phases 5–8. SSOT respected: getVisit/getDispatch are read-only pass-throughs.

## UI updated to read from the adapter

- Command Center: total caseload now counts adapter cases (team.json shown as
  reference); visit-warning lists capped with "+N more"; tasks/notifications
  derived from real cases.
- Cases: added 居住地 column; CMS null-safe.
- Workspace Overview: added age/welfare/residence/open+assessment dates/
  care-center/assessor/A-unit; CMS null-safe.
- Workspace picker: capped grid + link to Cases search; CMS null-safe.

## Build / Type Check / Tests / Lint

- Build: PASS (`tsc -b && vite build`, 73 modules; bundle ~413 kB / gzip 89 kB,
  up from Phase 0 due to the 378-case seed).
- Typecheck: PASS.
- Tests: PASS — 19/19 (12 normalizer + 7 adapter), incl. PII-leak assertions
  and manager-quota checks.
- Lint: PASS.
- Runtime smoke: Command Center / Cases / Workspace verified in browser with
  live CS100 data, no console errors.

## Dependencies

- Added `xlsx@0.18.5` as a devDependency (build-time seed only; not bundled).

## Next Step

Phase 2 — deepen Command Center via first-class task/calendar/notification
adapters. (Visit Manager wiring = Phase 5, Dispatch = Phase 6, AA01 = Phase 7,
FA310 adapter = Phase 8 per the roadmap.)
