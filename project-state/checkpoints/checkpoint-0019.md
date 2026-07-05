# Checkpoint CP-0019

## Milestone

Milestone 1 — Data Center (P0) → **COMPLETED**

## Version

v1.1.0 (minor: P0 milestone complete)

## Summary

Promoted Data Sources from a two-source Settings panel into a full **Data Center**
(`/data-center`) covering all six required source systems, with import report,
history, log, validation, matching, and source-abnormality surfaces — satisfying
WORKFLOW.md Milestone 1 and ACCEPTANCE.md ▸ Data Center.

## What shipped

1. **`src/pages/DataCenter.tsx`** — new page (route `/data-center`, sidebar nav):
   - Data Health Summary KPI strip (source counts by status, total safe records,
     pending sources, live privacy verdict).
   - Source Status cards for CS100 / FA310 / AA01 / Knowledge / Dispatch / Visit
     Manager — status, last imported, record count, raw vs sanitized locations,
     import command, report link, import errors.
   - Import Report (real CS100 metadata + breakdowns by manager / visit /
     dispatch), Import History, Import Log.
   - Matching Result (FA310 ↔ CS100), Validation Result (privacy/integrity
     evidence), Source Warnings.
2. **`src/modules/data/dataCenter.ts`** — all derivations from generated
   artifacts only (meta.generated.json, cases.generated.json,
   topics.generated.json). `validationResults()` scans the seed live for raw
   national ID / phone as in-app evidence.
3. **`src/modules/data/dataSources.ts`** — expanded 2 → 6 sources; new
   `status` (`seed`), `mode`, `errors`, `dependsOn`; counts read from generated
   meta (no drift).
4. **Settings ▸ Data Sources** slimmed to a compact summary linking to the Data
   Center (no duplicated logic).
5. **`dataCenter.test.ts`** — 12 tests (health, report ordering, history/log,
   validation privacy, matching, source issues + direct raw-ID guard).

## Verification

- typecheck **PASS** · lint **PASS** · tests **PASS (74, +12)** · build **PASS**.
- Browser smoke (`/data-center`): all sections render; nav shows Data Center;
  version = Orbikt v1.1.0; **no console errors**.
- Privacy: live DOM scan `/[A-Z][12]\d{8}/` = false, `/09\d{8}/` = false (an
  earlier true was a false positive from example copy — removed).

## Acceptance (ACCEPTANCE.md ▸ Data Center)

- CS100 imports (378) ✓ · Import Report ✓ · Import History ✓ · Import Log ✓ ·
  Record count ✓ · Source status ✓ · Matching (FA310↔CS100, staged/explainable)
  ✓ · Generated data has no raw national ID / phone / address / birth date ✓ ·
  DataAdapter uses generated data ✓ · browser never reads raw Excel ✓ · import
  errors are understandable ✓.
- FA310 live import remains **pending** (adapter seam ready; raw files not yet
  copied to `input/FA310/`) — surfaced honestly as a low-severity source warning,
  not hidden. Acceptance for the Data Center surface passes; FA310 live-load is
  tracked as deferred work (Milestone 6 — External Integration).

## Blueprint

Command Center remains the homepage; Data Center is a global destination (Data
Center architecture in CLAUDE.md), NOT a module-dashboard. IA / routing /
DataAdapter seam preserved.

## Next

Milestone 2 — Workspace Work Mode (P1, v1.2.0).
