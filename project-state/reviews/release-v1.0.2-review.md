# Release Review — Orbikt v1.0.2 (stable)

## Theme

UI upgrade (Codex handoff as a component library only) + functional global
search. No architecture change; the Blueprint is preserved.

## Changes since v1.0.1

- Design tokens + `.orbikt-card` applied app-wide via the shared `Card`.
- Decoupled shell (`AppShell`/`Sidebar`/`TopHeader`) driven by Orbikt nav
  (Command Center = `/`), no module registry.
- Command Center KPIs use `KpiCard` (30/60 split kept) + `DonutChart` for
  dispatch.
- **TopHeader global search wired**: submits to `/cases?q=…`; Cases reads `?q=`
  and prefilters. (Resolves the v1.0.2-RC known cosmetic item.)
- Module-dashboard architecture NOT adopted (deleted); routing restored to
  Blueprint.

## Acceptance verification (all PASS)

1. `/` is Command Center. ✅
2. No finance/invoice/module exposed (sidebar = 7 Orbikt destinations; no
   `發票`/`記帳`/`invoice`/module-registry in `src/`). ✅
3. Workspace tabs intact (8). ✅
4. Cases search + maskedNationalId work, including from the header (`?q=`);
   no raw ID client-side. ✅
5. git tree clean. ✅

Gates: typecheck / lint / test (58) / build all pass. No console errors.

## Known limitations (carried, unchanged)

AA01 draft-mode (full authoring external); Knowledge practical index + external
platform link; Visit/Dispatch/FA310 read-or-link adapter seams (live calls need
external runtime/auth); Documents OneDrive link-first (Graph deferred); Genogram
placeholder; mock auth.

## Release action

- Version 1.0.2; tag `v1.0.2`.
- Push not performed — no git remote configured. Commands reported to owner.

## Verdict

**v1.0.2 is stable and released (tagged, not pushed).**
