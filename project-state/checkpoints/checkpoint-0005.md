# Checkpoint CP-0005

## Current Phase

Phase 3 — Command Center consolidation

## Status

PHASE_3_COMPLETE

## Summary

Completed the Command Center against the migration-map Dashboard Mapping: every
widget now maps to its declared source. Added the two remaining widgets
(Caseload by Manager, Documents) and a per-manager caseload hover on Total
Caseload.

## Delivered

- `src/lib/caseload.ts` — `caseloadByManager(cases, team)` reporting actual
  assigned count (from the adapter case set) vs the team.json reference. Tested.
- Command Center:
  - Total Caseload stat now has a hover tooltip listing each manager's assigned
    load ("Hover shows manager caseload").
  - "團隊案量 Caseload by Manager" card — per-manager bar of assigned/reference.
  - "文件 Documents" card — OneDrive link-first, reads `listDocuments`.
  - Personalized greeting using the mock-auth user name.

## Dashboard Mapping compliance (migration-map)

| Widget | Source | Status |
|---|---|---|
| Total Caseload | Case data / team.json | ✅ (+ per-manager hover) |
| Today Tasks | Task adapter (+ derived) | ✅ |
| Today Schedule | Calendar adapter | ✅ (Phase 2) |
| 30-Day Visit Warning | Visit Manager | ✅ read-only |
| 60-Day Visit Warning | Visit Manager | ✅ read-only |
| Dispatch Status | Dispatch adapter | ✅ external + link |
| Documents | Document Center | ✅ OneDrive link-first |
| Recent Cases | Case activity | ✅ |
| Notifications | Notification module | ✅ |

## Build / Type Check / Tests / Lint

- Build: PASS (`tsc -b && vite build`, bundle ~428 kB / gzip 92 kB).
- Typecheck: PASS.
- Tests: PASS — 27/27 (added caseload helper tests).
- Lint: PASS.
- Runtime smoke: all Command Center widgets render (5-manager caseload bars,
  Documents, greeting), no console errors.

## Next Step

Phase 4 — Case Workspace consolidation (Overview/Timeline depth, tab-status
surfacing) per the migration-map Workspace Mapping. Visit Manager (Phase 5),
Dispatch (Phase 6), AA01 (Phase 7), FA310 (Phase 8) follow.
