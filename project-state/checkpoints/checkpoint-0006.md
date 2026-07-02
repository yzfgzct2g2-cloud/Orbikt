# Checkpoint CP-0006

## Current Phase

Phase 4 — Case Workspace consolidation

## Status

PHASE_4_COMPLETE

## Summary

Deepened the Case Workspace so the Overview realises "Overview = Case + Task +
Timeline" from the migration-map Workspace Mapping, and made each module tab's
state visible at a glance.

## Delivered

- `DataAdapter.listCaseTasks(caseId)` + `Cs100DataAdapter` implementation
  (refactored `deriveTasks` into a reusable per-case `caseTasks` builder; also
  added an AA01-returned task type).
- Workspace Overview now shows:
  - Case master fields (from CS100) — existing
  - Visit / Dispatch / AA01 / FA310 status cards — existing
  - "個案待辦 Case Tasks" — open tasks for this case (uncapped)
  - "近期時間軸 Recent Timeline" — preview + link to the Timeline tab
- Workspace tab bar shows a status dot per module tab (AA01/FA310/Dispatch/
  Visit) derived from the case's stored status — no recomputation.

## Workspace Mapping compliance (migration-map)

| Tab | Source | Status |
|---|---|---|
| Overview | Case + Task + Timeline | ✅ all three surfaced |
| AA01 | Planner | ✅ shell + status dot |
| FA310 | Review | ✅ shell + status dot |
| Dispatch | Dispatch | ✅ status + link + dot |
| Visit | Visit Manager | ✅ read-only + dot |
| Genogram | Genogram | ✅ placeholder |
| Attachments | Documents | ✅ OneDrive link |
| Timeline | TimelineEvent | ✅ full timeline |

## Build / Type Check / Tests / Lint

- Build: PASS (bundle ~431 kB / gzip 93 kB).
- Typecheck: PASS · Tests: 28/28 PASS (added per-case tasks test) · Lint: PASS.
- Runtime smoke: Overview shows case tasks + timeline; tab dots render
  (FA310 approved=green, Dispatch waiting=amber, Visit overdue=red); no console
  errors.

## SSOT integrity

Tab dots and case tasks read stored case status only; no visit-warning or
dispatch logic is recomputed in the Workspace.

## Next Step

Phase 5 — Integrate Visit Manager shell: read/link the Google Apps Script visit
warnings (SSOT) into the Dashboard and the Workspace Visit tab, with an adapter
seam that can later fetch live GAS data.
