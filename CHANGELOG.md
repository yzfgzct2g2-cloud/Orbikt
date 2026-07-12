# Changelog

All notable changes to Orbikt are documented here.

## [1.7.0] - 2026-07-06 — Orbikt Launcher (Milestone 7 — DX)

### Added
- **Orbikt Launcher — the official entry point for non-technical users.**
  Double-click `Orbikt.vbs` → 「Orbikt 啟動器」 page →「開始使用 Orbikt」→
  Orbikt opens in the browser. Users never see PowerShell / npm / Node /
  localhost / Vite / Git.
  - `launcher/server.mjs` — zero-dependency (Node stdlib), localhost-only
    orchestrator (port 5199). Serves the built app itself (static `dist/`,
    port 5198, SPA fallback) so no dev tooling runs at use-time. Fixed command
    set only; single-instance; idempotent start (never duplicates servers).
  - `launcher/launcherCore.mjs` — pure, unit-tested decisions: deps/generated/
    build freshness, start plan, update plan (pull → conditional install /
    reseed / rebuild), sync summary (no git vocabulary), diagnostics.
  - `launcher/ui.html` — System Status, Data Sources (CS100 / FA310 /
    manager-map / generated with counts + health), PASS/FAIL diagnostics,
    update, stop. Traditional-Chinese, zero developer terminology.
  - `Orbikt.vbs` — hidden-window entry with a friendly install message when
    the runtime is missing.
  - `ORBIKT_NO_BROWSER=1` for headless verification; `npm run launcher` for
    developers.
  - 20 new launcherCore tests (140 total). `docs/LAUNCHER.md` documents the
    architecture and the 1:1 Electron/Tauri migration path (UI unchanged,
    endpoints become IPC, pure core moves as-is).

### Fixed
- Windows `npm.cmd` spawning under modern Node (EINVAL, CVE-2024-27980
  mitigation) — fixed commands are routed through `cmd /c` with array args.

## [1.6.0] - 2026-07-06 — FA310 Import + Real CS100 Source (Milestone 6, partial)

### Added
- **FA310 import pipeline** — `scripts/fa310Normalize.mjs` (pure, tested) +
  `scripts/buildFa310Seed.mjs` (`npm run seed:fa310`): reads
  `input/FA310/FA310.xls` (Requests export, ROC-compact dates, V-flags),
  matches case national IDs to CS100 surrogate case IDs at import time, groups
  managers into anonymous deterministic keys (FA-M1…) from 主責個管員身分證,
  and emits sanitized `fa310.generated.json` + `fa310.meta.generated.json`.
  A hard guard aborts the build if any raw national ID reaches the output.
  Result: **390 records, 375 matched to CS100, 15 unmatched (reported), 5
  manager groups.**
- **Data Center** — FA310 source now 已匯入 with real counts/report; matching
  result shows real FA310↔CS100 stats; two new validation checks (FA310 raw-ID
  scan, FA310↔CS100 match result). Pending sources: 0.
- **Workspace ▸ FA310 tab** — real imported service record per case (service
  date, 電訪/家訪, manager group, tracking/goals completeness). The
  LongCare-QA-Engine review seam is untouched — review rules stay in the engine.
- 16 new tests (117 total), including generated-seed privacy contracts.

### Added (manager resolution — governance data rule)
- **FA310 is now the live PRIMARY responsible-manager source.** The manager
  roster `input/manager-map/manager-map.csv` (managerNationalId → managerName,
  Big5-aware parsing) resolves FA310 column S at import time:
  **375 of 378 cases receive their real manager from FA310** (3 fallback,
  labelled `managerSource: "fallback"`). Real per-manager caseloads: 簡淑儀 95,
  江睿儀 92, 游靜怡 90, 王郁琪 53, 房立泓 45.
- Generated/browser data exposes only `managerName`, `maskedManagerId`,
  `managerSource` (per governance); `CaseRecord.managerSource` added; Workspace
  Overview and FA310 tab show the manager with its source label.
- `config/team.json` manager names updated to the authoritative full names from
  the roster (matched by unique given-name suffix; ids/quotas unchanged).

### Changed
- **CS100 seed now builds from the real raw export** `input/CS100/CS100.xls`
  (fallback to the legacy local copy when absent).

### Security
- **`input/` and `mock-data/` are now gitignored**; `mock-data/CS100.xlsx` was
  **untracked** from the index after discovery that it contains real PII
  (378 valid-format national IDs + phones, 100% overlap with the real CS100
  export). ⚠️ The file remains in **git history** on GitHub — purging history
  requires a user-authorized rewrite (see release review).

## [1.5.0] - 2026-07-06 — Automation (Milestone 5)

### Added
- **Automation Transparency** (Settings) — a user-facing registry of all nine
  automated derivations (Today Tasks, abnormal detection, Eisenhower,
  next action, completion checklist, manager matching, source warnings,
  notifications, dashboard refresh): each with its plain-language rule
  (explainable), data source (traceable), output surface, code path
  (verifiable), and what it may write ("唯讀" for all but session state).
  `src/modules/automation/automationRegistry.ts` + tests enforcing that every
  entry is complete and that no automation writes to source systems.
- **Defined dashboard refresh** — Command Center gains a ↻ 重新整理 button with
  last-refreshed time. `refreshData()` re-runs all derivations and **merges the
  user's checked-off task state by id** — refresh never silently clears daily
  progress (automation must not silently change data). No fake auto-polling of
  the static seed.

### Notes
- The automations themselves (matching, reminders, abnormal detection,
  workflow suggestions) already existed as derivations; this milestone makes
  their explainability and traceability explicit per ACCEPTANCE ▸ Automation,
  and defines refresh semantics per WORKFLOW §10.

## [1.4.0] - 2026-07-06 — Case Workflow (Milestone 4)

### Added
- **Completion Checklist** on the Workspace Overview tab — six derived items
  (開案建檔, 評估完成/CMS, AA01 核定, FA310 通過, 派案完成, 訪視在軌) with a
  progress bar. Every item shows its current state as explainable detail and
  links to the Workspace tab where the work happens.
- **完成度 x/6** in the case banner — the case's completion status is visible
  from every tab and links back to the checklist.
- **`src/modules/workspace/caseChecklist.ts`** — pure derivations that READ
  stored statuses (visit from Visit Manager, dispatch from the external
  console, AA01/FA310 module statuses); nothing recomputed, SSOT respected.
  5 new unit tests.

### Notes
- With M2's Next Action + Case Abnormal Items and this checklist, a case can be
  reviewed start-to-finish inside Workspace: what's done, what remains, what's
  wrong, and what to do next — without re-searching or leaving the case file.
- WORKFLOW.md references "ACCEPTANCE.md ▸ Case Workflow", which does not exist
  as a section; the milestone's own Completion Criteria plus general acceptance
  principles were used (recorded in the release review).

## [1.3.0] - 2026-07-06 — Morning Workflow (Milestone 3)

### Added
- **Daily Progress** in the Command Center header — a progress bar showing
  today's planned work checked off (done/total), always visible without
  scrolling.
- **Checkable Today Tasks** — each task row has a done-toggle (separate from
  navigation, so checking never navigates); completed tasks show struck-through
  below the open list, feeding the Daily Progress bar. New store action
  `toggleTaskDone` (user working state for the day — SSOT unaffected).
- **KPI chip click-through** — 總案量 / 逾期 / 30 日訪視 / 60 日訪視 / 派案關注
  now open the Cases registry pre-filtered to exactly the cases they count,
  via new triage URL params (`?visit=<status>`, `?dispatch=attention`).
- **Cases triage filters** (`src/lib/caseFilters.ts`) — pure param→filter
  helpers; dispatch "attention" **reuses** `dispatchAttention` (no duplicated
  logic). Active filter shows as a removable chip on the Cases page.
  10 new unit tests (`caseFilters.test.ts`, `useAppStore.test.ts`).

### Notes
- Command Center already satisfied most of ACCEPTANCE ▸ Morning Workflow from
  v1.0.3 (compact one-screen layout, forward-looking Today Tasks, 異常通知,
  Eisenhower Matrix, Dispatch, Schedule, Visit warnings). This milestone closes
  the remaining gaps: daily progress and complete dashboard click-through.
- Dashboard remains an operational surface, not a module launcher.

## [1.2.0] - 2026-07-05 — Workspace Work Mode (Milestone 2)

### Added
- **Next Action strip** in the Workspace — the single most important next step
  for the open case, derived from its state and visible on every tab. Colour-
  coded by urgency (high/medium/low/none) with an explainable reason and a
  "前往處理" link to the relevant tab.
- **Case Abnormal Items panel** on the Overview tab — abnormalities scoped to
  THIS case (overdue visit, dispatch timeout/no-capacity, missing AA01, FA310
  returned), distinct from the forward-looking Case Tasks; each links to its tab.
- **`src/modules/workspace/caseFocus.ts`** — `caseAbnormalItems()` and
  `nextCaseAction()`, both derived and explainable. Abnormal detection **reuses**
  `deriveAbnormal` (no duplicated business logic). 7 unit tests in
  `caseFocus.test.ts`.

### Notes
- Workspace remains visually distinct from Cases (case-file banner) and requires
  no re-search after entry. All eight tabs (Overview, AA01, FA310, Dispatch,
  Visit, Genogram, Attachments, Timeline) and Knowledge references were already
  present from earlier phases; this milestone closes the "next action" and
  "case-specific abnormal items" acceptance gaps.

## [1.1.0] - 2026-07-05 — Data Center (Milestone 1)

### Added
- **Data Center page (`/data-center`)** — promoted from Settings ▸ Data Sources.
  A single operating surface for all six source systems (CS100, FA310, AA01,
  Knowledge, Dispatch, Visit Manager) with:
  - **Data Health Summary** KPI strip (source counts by status, total safe
    records, pending sources, live privacy verdict).
  - **Source Status** cards — status, last imported, record count, raw vs
    sanitized locations, import command, report link, and import errors per
    source.
  - **Import Report** — real CS100 generation metadata (produced-at, count) with
    breakdowns by manager / visit status / dispatch status.
  - **Import History** and **Import Log** — one entry per source, derived from
    the generated artifacts (newest first).
  - **Matching Result** — FA310 ↔ CS100 manager assignment, staged on CS100
    while FA310 is pending, fully explainable and traceable.
  - **Validation Result** — live privacy/integrity evidence: no raw national ID
    (letter + 9 digits), no phone, record count matches report, masked-ID format.
  - **Source Warnings** — missing / stale / pending / seed sources ranked by
    severity.
- **`src/modules/data/dataCenter.ts`** — all Data Center derivations, computed
  from browser-safe generated artifacts only (never raw files). 12 unit tests
  in `dataCenter.test.ts`, including a direct raw-national-ID guard on the seed.
- **Data Center** navigation entry in the sidebar.

### Changed
- **`src/modules/data/dataSources.ts`** expanded from 2 to all 6 source systems,
  with honest `status` (`ok` / `pending` / `seed` / `stale` / `missing`), a new
  `mode` (imported / index / engine / adapter / external), per-source `errors`,
  and `dependsOn`. Record counts are read from the generated artifacts so they
  cannot drift.
- **Settings ▸ Data Sources** slimmed to a compact at-a-glance summary that
  links to the full Data Center (no duplicated import/validation logic).

### Privacy
- Data Center reads only generated (de-identified) data; the browser never
  touches raw Excel. Live DOM scan confirms no raw national ID or phone number.

## [1.0.3] - 2026-07-04 — Acceptance Correction Sprint

### Added
- **Settings ▸ Data Sources** — CS100 + FA310 source status, last imported time,
  record count, import report link, safe-import instructions, and raw (`input/`)
  vs sanitized (`generated/`) locations. No browser upload of raw PII.
- **Eisenhower Matrix** on the Command Center — classifies overdue visits,
  dispatch timeouts, FA310 failures, AA01 unfinished/missing, and visit warnings
  into the four quadrants; each item links to the relevant case/tab.
- **異常通知 (Abnormal Notifications)** on the Command Center — overdue visits,
  dispatch timeout/no-capacity, missing AA01, FA310 failed, and source/import
  issues. Global Notifications page retained.
- **FA310 ↔ CS100 case-manager matching rule** (`docs/DATA_MATCHING.md` +
  `src/modules/data/caseManagerMatch.ts`): manager determined primarily from
  FA310 (national ID → case → name), CS100 as secondary; raw ID import-time only,
  browser exposes only `maskedNationalId`.

### Changed
- **Command Center rebuilt as a compact one-screen-first dashboard**: KPI strip
  (caseload / overdue / 30-day / 60-day / dispatch / today tasks) + dense panels
  (Today Tasks, 異常通知, Eisenhower, Dispatch, Schedule, Visit) with internal
  scrolling instead of long page scroll.
- **Today Tasks are now forward-looking** (meetings, care plans to complete,
  dispatch follow-ups, scheduled visits) — overdue items moved to 異常通知.
- **Cases vs Workspace distinction**: Cases is now a registry/triage list
  ("個案登記冊") with sort (visit urgency / CMS / name / manager) + count;
  Workspace gets a distinct "case file" banner (masked ID, manager, CMS, status).

### Notes
- Header global search continues to support case name / id / maskedNationalId /
  last-4 (v1.0.2). No raw national ID appears in browser-facing data.

## [1.0.2] - 2026-07-04 — UI upgrade (Codex component library)

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
- The `TopHeader` global search is now functional: submitting navigates to
  `/cases?q=…`; the Cases page reads `?q=` (via `useSearchParams`) and prefilters
  (name / caseId / manager / maskedNationalId / last-4). Cases still owns search.

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
