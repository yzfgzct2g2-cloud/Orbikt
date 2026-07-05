# Checkpoint CP-0021

## Milestone

Milestone 3 — Morning Workflow (P1) → **COMPLETED**

## Version

v1.3.0 (minor: P1 milestone complete)

## Summary

Closed the remaining ACCEPTANCE ▸ Morning Workflow gaps on the Command Center:
**daily progress** and **complete dashboard click-through**. The compact
one-screen dashboard (Today Tasks, 異常通知, Eisenhower, Dispatch, Schedule,
Visit warnings) was already in place from v1.0.3.

## What shipped

1. **Daily Progress** — header progress bar (done/total today tasks), visible
   without scrolling; `role="progressbar"` with aria values.
2. **Checkable Today Tasks** — done-toggle per row (separate button from the
   navigation link, so checking never navigates); done tasks render
   struck-through under the open list; "今日待辦已全部完成 ✓" empty state.
   New store action `toggleTaskDone(id)` — user working state, SSOT unaffected.
3. **KPI chip click-through** — 總案量 → /cases; 逾期 → /cases?visit=overdue;
   30 日 → ?visit=within_30; 60 日 → ?visit=within_60; 派案關注 →
   ?dispatch=attention.
4. **`src/lib/caseFilters.ts`** — `triageFilterFromParams` / `applyTriageFilter`
   / `triageFilterLabel`; dispatch "attention" reuses `dispatchAttention` (no
   duplicated business logic). Cases page shows a removable active-filter chip.
5. **Tests** — `caseFilters.test.ts` (7) + `useAppStore.test.ts` (3) = 10 new;
   91 total.

## Verification

- typecheck **PASS** · lint **PASS** · tests **PASS (91, +10)** · build **PASS**.
- Browser smoke (DOM-verified):
  - Progress bar 0/12 → checked a task → 1/12, bar 8%, struck-through row,
    undo button appears; checking never navigates.
  - 逾期 chip → /cases?visit=overdue → exactly **38** cases (matches import
    report byVisitStatus.overdue=38), filter chip "訪視：已逾期", all rows 已逾期.
  - ?dispatch=attention → exactly **69** cases (timeout 16 + no_capacity 35 +
    manual_required 18), chip "派案：需關注".
  - Clear filter → back to 378, clean URL.
  - No console errors; no raw national ID / phone in DOM.
- Note: preview screenshot capture timed out twice (tool-side renderer issue;
  page readyState=complete, zero console errors). DOM verification used as
  evidence per ACCEPTANCE ▸ Evidence Requirements.

## Acceptance (ACCEPTANCE.md ▸ Morning Workflow / Command Center)

Homepage ✓ · readable without excessive scrolling ✓ (unchanged compact layout)
· Today Tasks forward-looking ✓ · meetings visible ✓ (schedule + meeting tasks)
· visit warnings ✓ · dispatch follow-up ✓ · abnormal clearly distinguished ✓ ·
Eisenhower classifies real work ✓ · **clicking any dashboard item opens the
correct destination** ✓ (chips now click through to filtered registry) ·
**daily progress** ✓ NEW · not a module launcher ✓.

## Blueprint

Command Center remains the operational "what should I do today?" surface.
Cases stays the registry/triage list — chip click-through lands there (triage),
not on a new surface. No SSOT duplication (visit statuses read as stored;
dispatch attention reused).

## Next

Milestone 4 — Case Workflow (P1, v1.4.0).
