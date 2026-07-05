# Checkpoint CP-0023

## Milestone

Milestone 5 — Automation (P2) → **COMPLETED**

## Version

v1.5.0 (minor: P2 milestone complete)

## Summary

Made Orbikt's automation explicitly explainable, traceable, and verifiable
(ACCEPTANCE ▸ Automation), and defined the dashboard-refresh behavior
(WORKFLOW §10). The automated derivations themselves (matching, reminders,
abnormal detection, workflow suggestions) already existed from M1–M4.

## What shipped

1. **`src/modules/automation/automationRegistry.ts`** — registry of all 9
   automations (today-tasks, abnormal-detection, eisenhower, next-action,
   completion-checklist, manager-matching, source-warnings, notifications,
   dashboard-refresh). Each entry: plain-language rule, data source, output
   surface, code path, and writes ("nothing" | "session-state").
2. **Settings ▸ 自動化透明度 Automation Transparency** — renders the registry
   for users; badge shows 唯讀 / 僅工作階段狀態.
3. **Defined dashboard refresh** — store `refreshData()`: re-runs all
   derivations, merges done-marks by task id (never silently clears daily
   progress), records `lastRefreshedAt`. Command Center ↻ button with last
   update time; no fake auto-polling of the static seed.
4. **Tests** — registry completeness/uniqueness/no-source-writes (4) + refresh
   done-merge (1). 101 total.

## Verification

- typecheck **PASS** · lint **PASS** · tests **PASS (101, +5)** · build **PASS**.
- Browser smoke (DOM-verified):
  - Check task → 1/12 → ↻ 重新整理 → still 1/12, button shows "↻ 重新整理 · HH:MM".
  - Settings shows 自動化透明度 with all 9 entries, rules, sources, code paths.
  - No console errors; no raw PII.

## Acceptance (ACCEPTANCE.md ▸ Automation)

Explainable ✓ (per-entry rule; nextAction reasons inline) · traceable ✓
(source per entry; abnormal bodies name case + condition) · verifiable ✓
(code paths; Data Center validation) · never silently changes important data ✓
(all read-only except session merge that PRESERVES user state) · abnormal
remains visible ✓ · user can understand why a result occurred ✓.

## Blueprint

No new surfaces beyond a Settings card and a refresh control. No SSOT logic
duplicated; registry documents existing derivations.

## Next

Milestone 6 — External Integration (P3, v2.0.0) — NOTE: expected to hit Stop
Conditions quickly (credentials for Visit GAS / Dispatch API / Graph /
Supabase / Calendar / LINE; FA310 raw files). Adapter-seam work that needs no
credentials may proceed; live wiring stops for authorization.
