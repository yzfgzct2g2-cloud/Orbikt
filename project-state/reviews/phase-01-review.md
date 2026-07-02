# Phase 1 Review — Case Data Adapter (CS100)

## Objective

Implement the Case data adapter using `mock-data/CS100.xlsx` as the V1 case seed.

## Requirements vs. delivered

| Requirement | Status | Notes |
|---|---|---|
| Preserve Phase 0 architecture | ✅ | `DataAdapter` interface unchanged; new impl only |
| Read CS100 through an adapter, not in UI | ✅ | Build-time seed → `Cs100DataAdapter`; UI imports `dataAdapter` only |
| Normalize CS100 → Case model | ✅ | `scripts/cs100Normalize.mjs` |
| Update Cases / Command Center / Workspace Overview / caseload | ✅ | All read from adapter |
| Do not expose full ID numbers | ✅ | National ID omitted; surrogate ids; no `[A-Z]\d{9}` in output |
| Keep team.json as manager/caseload reference | ✅ | Managers assigned by team.json quotas |
| Install xlsx if needed | ✅ | `xlsx@0.18.5` devDependency (build-time only) |
| Add adapter tests | ✅ | 19 tests (normalizer + adapter) |
| lint / typecheck / tests / build | ✅ | All PASS |
| checkpoint-0002 / phase-01-review / PROJECT_STATE | ✅ | This set |
| Commit Phase 1 | ✅ | See git log |

## Key decision — build-time sanitized seed (not runtime xlsx)

Parsing the raw xlsx in the browser would ship PII (national IDs) as a
downloadable asset. Instead a build-time script emits a sanitized JSON that the
adapter imports. The raw xlsx never reaches the client.

## Privacy incident caught and fixed

Initial generation leaked national IDs because the raw 案號 embeds them for
~296/378 rows. Fixed by assigning non-PII surrogate ids and dropping the raw
案號; asserted by tests on both normalizer and adapter output.

## SSOT integrity

visit/dispatch/aa01/fa310 are deterministic V1 seed stand-ins produced in the
data layer, not recomputed in the UI. getVisit/getDispatch remain read-only
pass-throughs, so wiring Visit Manager (Phase 5) / Dispatch (Phase 6) later is
an adapter-only change.

## Quality gates

- Build: PASS · Typecheck: PASS · Tests: 19/19 PASS · Lint: PASS
- Runtime smoke: PASS (Command Center, Cases, Workspace with live CS100 data)

## Carried forward

- Task/Calendar/Notification as first-class adapters — Phase 2.
- Real Visit Manager / Dispatch / AA01 / FA310 integration — Phases 5–8.
- Cases page renders all 378 rows (no pagination yet) — acceptable for V1.

## Verdict

**Phase 1 COMPLETE.** Proceeding to Phase 2.
