# Changelog

All notable changes to Orbikt are documented here.

## [Unreleased] — UI upgrade (Codex component library)

Adopted the Codex UI handoff as a **component library only** — the Blueprint
architecture is unchanged (Command Center homepage, routing/IA, DataAdapters,
Workspace all preserved).

### Added
- Design tokens `src/styles/tokens.css` (`.orbikt-card`, CSS variables) imported
  by `index.css`.
- Reusable visual components: `AppShell` / `Sidebar` / `TopHeader` (decoupled
  from the module registry, driven by Orbikt nav), `KpiCard`, `DashboardSection`,
  `DonutChart` / `LineChart` / `Sparkline` (+ `chartTypes.ts`, `chartUtils.ts`).

### Changed
- `AppLayout` now renders the new `AppShell`; the shared `Card` primitive uses
  `.orbikt-card`, upgrading every page consistently.
- Command Center KPI row rebuilt with `KpiCard` (30/60 split preserved) and a
  `DonutChart` for dispatch status.

### Removed
- The alternate module-dashboard architecture that was NOT adopted:
  `DashboardPage`, `ModulePlaceholderPage`, module `registry`/`types`,
  `mockDashboardData`, `dashboardSelectors`, module-only components, and the
  `vite.config.mjs` / `scripts/vite*.mjs` wrappers (scripts restored to plain
  `vite`).

## [1.0.1] - 2026-07-04 — Correction Sprint

### Restored
- **Blueprint architecture.** An alternate "module dashboard" prototype (an AI
  operating dashboard with a 記帳/發票 finance module) had begun replacing Command
  Center as the homepage and modifying committed entry files. Per the owner's
  decision it was **archived, not deleted**, into `archive/finance-module/`, and
  Command Center was restored as the homepage (`src/App.tsx`,
  `src/layout/AppLayout.tsx`, `src/index.css`, `package.json` restored to v1.0.0).

### Fixed
- **Command Center**: first row now has four separate cards — Total Caseload,
  Today Tasks, 30-Day Visit Warning, 60-Day Visit Warning (overdue kept visible
  in a second row).
- **FA310 tab**: displays `maskedNationalId` for identity verification (never the
  raw national ID); FA310 rules remain in the LongCare-QA-Engine adapter seam.
- **External links**: consolidated to a single machine-readable source of truth
  `config/external-links.json`, read by `src/config/externalLinks.ts` (no
  hardcoded duplicates). `config/external-links.md` remains human-readable.

### Changed
- **Knowledge Hub** relabeled honestly as "practical-topics index + external
  full-platform link" (not a fully embedded Hub); traceable citations preserved.
- **AA01 Planner** relabeled honestly as "engine-integrated draft mode; full
  authoring UI remains external."

### Hygiene
- `source-systems/` added to `.gitignore` with `docs/SOURCE_SYSTEMS.md` policy;
  removed unrelated 發票 mock data from production `src/`.

### Tests
- Added FA310 masked-identity tests and external-links SSOT tests (58 total).

## [1.0.0] - 2026-07-03 — Phases 0–12

- Initial V1: Command Center, Cases, Case Workspace (AA01 / FA310 / Dispatch /
  Visit / Genogram / Attachments / Timeline), Knowledge, Documents,
  Notifications, Settings.
- CS100 sanitized case seed (378 cases; `maskedNationalId` only, raw ID transient
  at import).
- AA01 engine vendored; FA310 QA-Engine adapter seam; Visit/Dispatch SSOT
  read-or-link modules; knowledge practical index; OneDrive link-first documents.
