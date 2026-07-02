# Checkpoint CP-0001

## Current Phase

Phase 0 — Orbikt Shell

## Status

PHASE_0_COMPLETE

## Summary

Created the Orbikt application shell using the Blueprint-recommended stack
(React + TypeScript + Vite + TailwindCSS + React Router + Zustand). The shell is
a workspace, not a link directory: Command Center is the homepage, and every
case-scoped module lives inside the Workspace as a tab.

## Stack Decision

Standardised on the stable matrix: React 18.3 / Vite 5 / TypeScript 5.6 /
React Router 6 / Zustand 4 / Tailwind 3. This aligns with the Knowledge system
and de-risks the earlier-flagged React-version divergence for a shared shell.

## Delivered

- Root config: `package.json`, `vite.config.ts`, `tsconfig*.json`,
  `tailwind.config.js`, `postcss.config.js`, `eslint.config.js`, `index.html`,
  `public/favicon.svg`, `.gitignore` (excludes secrets/service-account keys).
- Entry: `src/main.tsx` (BrowserRouter), `src/index.css` (Tailwind).
- Routing: `src/App.tsx` — Command Center, Cases, Workspace (+ `:caseId/:tab`),
  Knowledge, Documents, Notifications, Settings; unknown routes → Command Center.
- Layout: `AppLayout`, `Sidebar` (7 global destinations), `Header`
  (active caseload, notification badge, mock-auth user).
- Pages: CommandCenter, Cases, Workspace, WorkspacePicker, Knowledge,
  Documents, Notifications, Settings.
- Workspace tab shell: Overview / AA01 / FA310 / Dispatch / Visit / Genogram /
  Attachments / Timeline. Module tabs show honest integration-source notices
  (not TODO placeholders).
- Data adapter foundation: `DataAdapter` interface + `MockDataAdapter`; typed
  domain model; mock case dataset (10 cases from real team.json managers);
  tasks / notifications / timeline / documents mocks.
- Config loaders: typed access to `config/team.json`, `config/integrations.json`,
  `config/source-systems.json`, and external links (Zero Duplicate Input).
- State: Zustand store with mock-auth session + role model
  (case_manager / supervisor / director / admin).

## Blueprint Compliance

- Command Center is the homepage and answers "what should I do today?".
- Case Workspace is the main operating surface; AA01/FA310/Dispatch/Visit/
  Genogram are tabs inside it, never standalone homepages.
- Visit Manager is the SSOT for visit warnings — adapter reads/links, never
  recalculates remaining days.
- Dispatch is treated as an external system (status + external link).
- FA310 rules are NOT duplicated in React; the tab states integration via the
  LongCare-QA-Engine adapter.
- Knowledge preserves the 7-layer traceable-source structure.
- No TODO / FIXME / unexplained placeholders.

## Build

PASS — `tsc -b && vite build` (74 modules, dist ~208 kB JS / 15 kB CSS).

## Type Check

PASS — `tsc -b`.

## Tests

PASS — `vitest run` (5/5, MockDataAdapter contract).

## Lint

PASS — `eslint .`.

## Runtime Smoke

Verified in browser: Command Center renders (total caseload 378 = sum of
team.json), no console errors; Workspace `/workspace/C-1003/fa310` renders the
case header, all 8 tabs, and the FA310 adapter notice.

## Known Issues / Carried Forward

- Cases use a typed mock dataset; ingesting the real CS100 source is Phase 1.
- AA01 (Planner) wrap = Phase 7; FA310 adapter = Phase 8; Dispatch = Phase 6;
  Visit Manager wiring = Phase 5; Genogram placeholder = Phase 10;
  Documents/OneDrive deepening = Phase 11.
- Some OneDrive sub-links and Google Calendar links in external-links.md are
  still blank (link-first is acceptable for V1).

## Next Step

Phase 1 — Case data adapter: ingest the real case source (CS100) behind the
existing DataAdapter interface so Cases/Command Center read live-shaped data.
