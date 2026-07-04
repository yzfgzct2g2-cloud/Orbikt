# Checkpoint CP-0017

## Task

v1.0.2 stable release — finalize the UI upgrade + functional global search

## Status

V1_0_2_STABLE (tagged v1.0.2)

## What shipped in v1.0.2

- **UI upgrade** (from the Codex handoff, component library only): design tokens
  (`.orbikt-card`), decoupled `AppShell`/`Sidebar`/`TopHeader`, `KpiCard`,
  `DashboardSection`, `DonutChart`/`LineChart`/`Sparkline`. Blueprint IA,
  routing, DataAdapters, and Workspace all preserved (Command Center = `/`).
- **Functional global search** (resolves the RC's known cosmetic item): the
  `TopHeader` search now submits to `/cases?q=…`; the Cases page reads `?q=` via
  `useSearchParams` and prefilters (name / caseId / manager / maskedNationalId /
  last-4). Cases still owns the actual filtering; no raw national ID client-side.

## Final verification (all PASS)

- `/` is Command Center; sidebar exposes only the 7 Orbikt destinations (no
  finance/invoice/module); Workspace 8 tabs intact; Cases search +
  maskedNationalId work (incl. via header `?q=`); git tree clean.
- Gates: typecheck / lint / test (58) / build all pass. No console errors.
- Runtime: header search `鄭阿梅` → `/cases?q=鄭阿梅` → 1 row (`C-0001`);
  `1601` → 1 row (`G*****1601`).

## Release

- Version bumped to 1.0.2 (package.json + sidebar label).
- Tagged `v1.0.2`. Push not performed (no git remote / auth configured).

## Next (V1.1, post-release)

Live integrations (Visit/Dispatch/AA01/FA310), Microsoft Graph, Supabase, full
Knowledge Hub embed, AA01 authoring UI port.
