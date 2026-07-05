# Checkpoint CP-0022

## Milestone

Milestone 4 — Case Workflow (P1) → **COMPLETED**

## Version

v1.4.0 (minor: P1 milestone complete)

## Summary

A case can now be processed start-to-finish inside Workspace with a clear
completion status. The missing piece — the **Completion Checklist** — is now on
the Overview tab, with the case's 完成度 visible in the banner from every tab.
Combined with M2's Next Action strip and Case Abnormal Items, the user can see
what's done, what remains, what's wrong, and what to do next without leaving
the case file or re-searching.

## What shipped

1. **`src/modules/workspace/caseChecklist.ts`** — `caseCompletionChecklist(c)`
   derives six items (open, assessment/CMS, AA01 approved, FA310 approved,
   dispatch accepted/closed, visit on-track) with the current state as
   explainable detail and a link to the owning tab; `checklistProgress()`
   computes done/total/pct. READS stored statuses only — SSOT respected.
2. **Overview tab** — Completion Checklist card (progress bar + 6 linked items)
   paired with Case Abnormal Items in a two-column grid.
3. **Case banner** — "完成度 x/6" linking to the checklist, visible on every tab.
4. **`caseChecklist.test.ts`** — 5 tests (all-done, partial with status detail,
   visit on/off-track boundaries, assessment requires CMS, tab links). 96 total.

## Verification

- typecheck **PASS** · lint **PASS** · tests **PASS (96, +5)** · build **PASS**.
- Browser smoke (DOM-verified):
  - Partial case `C-0010`: banner 完成度 3/6, checklist "已完成 3/6 項（50%）",
    6 tab-linked items, explainable details（目前狀態：草稿 / 已通過 / 等待回覆）.
  - Complete case `C-0017`: banner 6/6, checklist 100%, progress bar at 100.
  - No console errors; no raw national ID in DOM.
- Preview screenshot capture still times out (tool-side; page readyState
  complete, zero console errors) — DOM verification used as evidence.

## Acceptance

WORKFLOW.md §9 Completion Criteria: user can identify what remains unfinished ✓
(checklist + details) · move between modules inside Workspace ✓ (tabs; checklist
items link to tabs) · no re-search of the same case ✓ (banner + tabs persist) ·
clear completion status ✓ (banner x/6 + progress bar). AA01/FA310/Dispatch/
Visit status clear ✓ (status cards + checklist) · timeline records progress ✓
(Timeline tab + Overview preview).

**Governance note:** WORKFLOW.md references "ACCEPTANCE.md ▸ Case Workflow",
but ACCEPTANCE.md has no such section. Evaluated against the milestone's own
Completion Criteria + ACCEPTANCE general principles (technical, workflow,
Blueprint, privacy, evidence). Flagged for a future governance edit; not a
Blueprint conflict.

## Blueprint

Case → Workspace → Modules preserved. Checklist reads module/visit/dispatch
statuses as stored (Visit Manager SSOT untouched). No duplicated business rules.

## Next

Milestone 5 — Automation (P2, v1.5.0).
