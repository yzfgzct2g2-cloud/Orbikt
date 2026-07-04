# Checkpoint CP-0016

## Task

UI upgrade — adopt the Codex UI handoff as a COMPONENT LIBRARY only

## Status

COMPLETE

## Principle

The Codex UI handoff is **not** the new architecture. It was treated as a
component library. The Orbikt Blueprint is preserved:

- Homepage remains Command Center (`/`).
- Case Workspace remains the primary operating surface.
- Cases page, routing, and information architecture unchanged.
- Every DataAdapter, route, and Workspace preserved.

## Imported (visual-only, decoupled)

- `src/styles/tokens.css` — design tokens (`.orbikt-card`, CSS vars); imported by
  `index.css`.
- `src/components/layout/AppShell|Sidebar|TopHeader` — **decoupled from the
  module registry**; Sidebar uses Orbikt nav (Command Center = `/`), TopHeader
  drops the module toggle and shows the real role.
- `src/components/dashboard/KpiCard` — **rebuilt with a plain, decoupled API**
  (no `OrbiktModule` / mock data).
- `src/components/dashboard/DashboardSection`, `src/components/charts/DonutChart`
  `LineChart` `Sparkline` (+ `chartTypes.ts`, `charts/chartUtils.ts`).

## Rebuilt

- `AppLayout` renders `<AppShell>`; old `src/layout/Sidebar.tsx` + `Header.tsx`
  deleted (replaced by the component-library shell).
- Shared `Card` primitive uses `.orbikt-card` → every page upgraded consistently.
- Command Center KPI row uses `KpiCard` (30/60 split kept); dispatch panel uses
  `DashboardSection` + `DonutChart`.

## NOT adopted (deleted)

`DashboardPage`, `ModulePlaceholderPage`, module `registry`/`types`,
`mockDashboardData` (duplicate — DataAdapter supplies equivalent),
`dashboardSelectors`, module-only components, `vite.config.mjs`,
`scripts/vite*.mjs` wrappers (scripts restored to plain `vite`). No routing
changes adopted; `App.tsx` restored to Blueprint routing.

## Gates

- typecheck PASS · lint PASS · test 58 PASS · build PASS.
- Runtime smoke (eval): all routes render with the new shell + `.orbikt-card`
  styling; Command Center KPIs + donut render; no console errors. (preview
  screenshots timed out — a tool-side renderer quirk, not an app error.)

## Note

The concurrent external process that had been re-generating the module dashboard
appears to have stopped; the working tree is clean and focused on this upgrade.
