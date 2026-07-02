# Phase 0 Review — Orbikt Shell

## Goal

Stand up the Orbikt application shell so all subsequent phases integrate INTO a
working workspace, not into an empty repo.

## Deliverables vs. Blueprint (all met)

| Required | Status | Location |
|---|---|---|
| root package.json | ✅ | `package.json` |
| src/ | ✅ | `src/` |
| routing | ✅ | `src/App.tsx` (React Router 6) |
| Layout | ✅ | `src/layout/AppLayout.tsx` |
| Sidebar | ✅ | `src/layout/Sidebar.tsx` |
| Header | ✅ | `src/layout/Header.tsx` |
| Command Center page | ✅ | `src/pages/CommandCenter.tsx` |
| Cases page | ✅ | `src/pages/Cases.tsx` |
| Workspace page | ✅ | `src/pages/Workspace.tsx` (+ `WorkspacePicker`) |
| Knowledge page | ✅ | `src/pages/Knowledge.tsx` |
| Documents page | ✅ | `src/pages/Documents.tsx` |
| Notifications page | ✅ | `src/pages/Notifications.tsx` |
| Settings page | ✅ | `src/pages/Settings.tsx` |
| mock data adapter foundation | ✅ | `src/adapters/*`, `src/data/mock/*` |
| project-state update | ✅ | `project-state/PROJECT_STATE.json` |
| checkpoint review | ✅ | `checkpoints/checkpoint-0001.md`, this file |
| successful build | ✅ | build/typecheck/test/lint all PASS |

## Architecture Notes

- **Adapter seam**: the UI depends only on the `DataAdapter` interface and the
  domain types in `src/adapters/types.ts`. V1 uses `MockDataAdapter`; Supabase /
  GAS / Dispatch API / Graph / Calendar drop in later with no UI changes.
- **SSOT boundaries encoded in code**: `getVisit` and `getDispatch` are
  documented read-only pass-throughs — Orbikt never recomputes visit warnings
  or dispatch status.
- **Zero Duplicate Input**: config JSON (`team`, `integrations`,
  `source-systems`) is imported directly rather than re-typed.

## Quality Gates

- Build: PASS (`tsc -b && vite build`)
- Typecheck: PASS
- Tests: PASS (5/5)
- Lint: PASS
- Runtime smoke: PASS (Command Center + Workspace verified in browser, no
  console errors)

## Risks Carried Into Later Phases

- Real case ingestion (CS100) — Phase 1.
- Cross-language FA310 adapter contract to the Python QA Engine — Phase 8.
- Live Visit Manager / Dispatch wiring — Phases 5–6.

## Verdict

**Phase 0 COMPLETE.** Ready to proceed to Phase 1.
