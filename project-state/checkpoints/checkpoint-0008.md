# Checkpoint CP-0008

## Current Phase

Phase 6 — Dispatch shell integration

## Status

PHASE_6_COMPLETE

## Summary

Established `src/modules/dispatch/dispatchManager.ts` as the single dispatch code
path, mirroring the Visit Manager module. Dispatch is an external system in V1;
Orbikt shows status and links out, and the module is API-ready.

## Delivered

- `src/modules/dispatch/dispatchManager.ts`
  - `dispatchManager` metadata: source, console URL, `status: "external"`,
    `future: "api"` (API-ready), `mode: "read_or_link"`.
  - `dispatchCounts(cases)` — counts by status in a stable display order.
  - `dispatchAttention(cases)` — timeout / no_capacity / manual_required.
- Command Center dispatch panel routed through the module; "派案需關注" stat
  uses `dispatchAttention`; panel labels cover the migration-map set
  (派案中 / 等待回覆 / Timeout / 全數無人力 / 人工介入 / 已完成); header links
  to the external console.
- Workspace Dispatch tab unified on the same module metadata (external,
  API-ready).
- Removed the now-unused `externalLinks` import from Command Center.
- Tests: `dispatchManager.test.ts` (ordered counts, attention filter, metadata).

## SSOT integrity

Dispatch status is read/linked only; no dispatch logic is rebuilt. One dispatch
code path now exists; wiring the Dispatch API later changes only the data source
behind the module helpers.

## Build / Type Check / Tests / Lint

- Build: PASS (bundle ~432 kB / gzip 93 kB).
- Typecheck: PASS · Tests: 34/34 PASS · Lint: PASS.
- Runtime smoke: dispatch panel shows all status labels + console link, no
  console errors.

## Next Step

Phase 7 — Integrate AA01 (Planner): wrap the existing `aa01-ai-system` into the
Workspace AA01 tab bound to the Case ID, preserving its generator/validation/
output logic (no rewrite).
