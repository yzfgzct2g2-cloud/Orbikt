# Checkpoint CP-0014

## Current Phase

Phase 12 — Final polish + release

## Status

V1_RELEASE_READY (Orbikt v1.0.0)

## Summary

Whole-app QA pass, version bumped to v1.0.0, README + version label updated,
minor polish (CMS null guard in the Workspace header). All 12 Blueprint modules
are present and integrated per the migration-map.

## Release polish

- `package.json` version → 1.0.0; Sidebar footer → "Orbikt v1.0.0".
- README: added "Running Orbikt", data-build steps, and an architecture summary.
- Fixed CMS display when a case has no assessed CMS level (Workspace header).

## Full QA gate (v1.0.0)

- `npm run lint` → PASS
- `npm run build` (tsc -b && vite build) → PASS (89 modules)
- `npm run typecheck` → PASS
- `npm run test` → 54/54 PASS
- Release smoke: all 11 routes render content, no console errors
  (Command Center, Cases, Workspace picker, Workspace + all 8 tabs, Knowledge,
  Documents, Notifications, Settings).

## Blueprint V1 acceptance

| # | Module | State |
|---|---|---|
| 1 | Command Center | ✅ homepage; caseload/tasks/schedule/visit/dispatch/docs/notifications |
| 2 | Cases | ✅ list + masked-ID search |
| 3 | Case Workspace | ✅ main operating surface; 8 tabs |
| 4 | Planner (AA01) | ✅ vendored engine runs bound to Case ID |
| 5 | Review (FA310) | ✅ QA-Engine adapter seam (no rules in React) |
| 6 | Dispatch | ✅ external status + link, API-ready |
| 7 | Visit Manager | ✅ SSOT read/link, single code path |
| 8 | Knowledge Hub | ✅ 21 topics + citations + Workspace references |
| 9 | Genogram | ✅ prototype placeholder + Case ID hook |
| 10 | Document Center | ✅ OneDrive link-first + per-case attachments |
| 11 | Notifications | ✅ unified center |
| 12 | Settings | ✅ mock auth + role model + source systems |

Principles held: Case First, Workspace First, Single Source of Truth (Visit /
Dispatch / FA310 / Knowledge read-or-linked, never recomputed), Zero Duplicate
Input (config imported), no TODO/FIXME/unexplained placeholders, PII policy
(maskedNationalId only; raw ID transient at import).

## Release action

- Commit "Orbikt v1.0.0" and tag `v1.0.0`.
- **Push not performed:** this local repo has no configured git remote and
  pushing to the Orbikt GitHub repo requires the remote + credentials (external
  authorization). Left for the owner to push.

## Post-release (V1.1)

- Live integrations: Visit Manager (GAS fetch), Dispatch API, AA01 authoring UI
  port, FA310 live QA-Engine call.
- Microsoft Graph (documents), Supabase (persistence), Google Calendar.
- Fill missing OneDrive sub-folder + Calendar links in external-links.md.
