# Release Review — v1.1.0 (Milestone 1 — Data Center)

## Scope

Complete Milestone 1 (Data Center, P0) per WORKFLOW.md and ACCEPTANCE.md ▸ Data
Center. Promote the two-source Settings panel into a full Data Center covering
all six source systems with import/validation/matching/abnormality surfaces.

## Acceptance evaluation

| ACCEPTANCE ▸ Data Center criterion | Result |
| --- | --- |
| CS100 imports successfully | ✓ 378 cases (meta.generated.json) |
| FA310 imports successfully | ⚠ pending — adapter seam ready, raw not copied; shown honestly |
| Import Report generated | ✓ real CS100 metadata + breakdowns |
| Import History recorded | ✓ per-source |
| Import Log recorded | ✓ per-source, newest first |
| Record count displayed | ✓ |
| Source status displayed | ✓ all 6 |
| FA310 ↔ CS100 matching completes | ✓ staged on CS100 while FA310 pending, explainable |
| Generated data: no raw national ID | ✓ live DOM + unit-test guard |
| Generated data: no raw phone | ✓ |
| Generated data: no raw address / birth date | ✓ (never emitted by cs100Normalize) |
| DataAdapter uses generated data | ✓ Cs100DataAdapter reads generated seed |
| Browser never reads raw Excel | ✓ |
| Import failures produce understandable errors | ✓ per-source `errors[]` surfaced |

FAIL conditions: none triggered (no raw Excel in browser, no raw ID reaching
frontend, matching does not silently fail, import report present, source status
known, generated data reproducible via `npm run seed:cases`).

## Privacy (ACCEPTANCE ▸ Privacy)

- Data Center derives from generated artifacts only; raw files never read.
- Live DOM scan: raw national ID = false, phone = false.
- `validationResults()` gives in-app evidence rather than a bare claim.

## Blueprint / Product Memory

- Command Center remains homepage; Dashboard unchanged.
- Data Center added as a global destination — matches the Data Center
  Architecture section of CLAUDE.md; not a module-dashboard.
- No accepted architecture re-evaluated. Wrap-first respected (reused
  dataSources registry, abnormal detection, primitives, KpiCard).

## Verification evidence

- typecheck PASS · lint PASS · tests PASS (74) · build PASS (105 modules).
- No console errors on `/data-center`.

## Deferred (recorded, not abandoned)

- FA310 live import (copy raw to `input/FA310/`, run LongCare-QA-Engine) →
  Milestone 6 — External Integration. Dependency: FA310 source files + engine
  access. User approval / file provisioning needed.
- Dispatch / Visit Manager live APIs (currently honest seed stand-ins) →
  Milestone 6.

## Verdict

**Acceptance PASS** for Milestone 1 — Data Center. Release v1.1.0.
