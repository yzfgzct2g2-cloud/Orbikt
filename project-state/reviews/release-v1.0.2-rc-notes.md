# Orbikt v1.0.2 — Release Candidate Notes (NOT tagged)

Status: **release candidate** — awaiting owner approval. Not tagged, not pushed.
Head commit at RC time: `3e81b9f` (UI upgrade).

## Theme

UI upgrade — adopt the Codex handoff as a **component library only**. No
architecture change; the Orbikt Blueprint is preserved.

## What changed since v1.0.1

- **Design system**: `src/styles/tokens.css` (`.orbikt-card`, CSS variables),
  imported by `index.css`. The shared `Card` primitive now uses `.orbikt-card`,
  so every page picked up the new visual style.
- **Shell**: new `AppShell` / `Sidebar` / `TopHeader` (decoupled from the module
  registry; Orbikt nav with Command Center = `/`). `AppLayout` renders
  `AppShell`; old `layout/Sidebar.tsx` + `Header.tsx` removed.
- **Command Center**: KPI row rebuilt with `KpiCard` (30/60-day split preserved),
  dispatch panel uses `DashboardSection` + `DonutChart`.
- **Removed (not adopted)**: `DashboardPage`, `ModulePlaceholderPage`, module
  `registry`/`types`, `mockDashboardData`, `dashboardSelectors`, module-only
  components, `vite.config.mjs` + `scripts/vite*.mjs` wrappers. `App.tsx`
  restored to Blueprint routing; scripts restored to plain `vite`.

## Final manual-safe verification (all PASS)

1. **`/` is Command Center** — index route → `<CommandCenter/>`; page `<h1>` =
   "Command Center". ✅
2. **No finance/invoice module exposed** — sidebar shows only the 7 Orbikt
   destinations (Command Center, Cases, Workspace, Knowledge, Documents,
   Notifications, Settings); no `發票`/`記帳`/`invoice`/module-registry anywhere
   in `src/`; deleted files confirmed gone. ✅
3. **Workspace tabs intact** — Overview / AA01 / FA310 / Dispatch / Visit /
   Genogram / Attachments / Timeline all render. ✅
4. **Cases search + maskedNationalId** — masked IDs render (e.g. `G*****1601`),
   no raw ID pattern; searching last-4 `1601` → 1 row (`G*****1601`); searching
   `鄭阿梅` → 1 row (`C-0001`); no-match → empty state. ✅
5. **git status clean** — working tree clean at verification time. ✅

Automated gates: `typecheck` / `lint` / `test (58)` / `build` all pass. No
console errors on any route.

## Known cosmetic item (non-blocking)

- The new `TopHeader` has a **decorative** search box (placeholder hints
  "前往 Cases 搜尋"); it is visual-only and does not filter. The functional
  search is the Cases page. Consider wiring it to navigate to `/cases` with a
  query in a future iteration.

## Release action (pending approval)

- On approval: `git tag -a v1.0.2 -m "Orbikt v1.0.2 — UI upgrade"`.
- Push (needs remote/auth — none configured):
  ```bash
  git remote add origin https://github.com/yzfgzct2g2-cloud/Orbikt.git
  git push -u origin master
  git push origin v1.0.2
  ```
