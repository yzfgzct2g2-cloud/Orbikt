# Checkpoint CP-0020

## Milestone

Milestone 2 — Workspace Work Mode (P1) → **COMPLETED**

## Version

v1.2.0 (minor: P1 milestone complete)

## Summary

Closed the two remaining ACCEPTANCE ▸ Workspace gaps so the Workspace fully
"feels like a case file": a visible **Next Action** for the open case, and a
distinct **case-specific abnormal items** panel. All other Workspace acceptance
criteria (banner, 8 tabs, knowledge references, visual distinction from Cases,
no re-search) were already satisfied by earlier phases.

## What shipped

1. **`src/modules/workspace/caseFocus.ts`**
   - `caseAbnormalItems(c)` — case-scoped abnormal items (reuses
     `deriveAbnormal`, filters to the case; source-level items excluded).
   - `nextCaseAction(c)` — the single next step, prioritising the highest-
     severity abnormal, then the natural module progression (AA01 → FA310 →
     visit). Returns `{ title, reason, to, urgency }` — explainable + navigable.
2. **`src/pages/Workspace.tsx`** — Next Action strip below the case banner,
   visible on every tab, colour-coded by urgency with a "前往處理" link.
3. **`src/pages/workspace/WorkspaceTabs.tsx`** — Case Abnormal Items panel on the
   Overview tab (distinct from Case Tasks); empty state shows "本案無異常項目".
4. **`caseFocus.test.ts`** — 7 tests (case-scoped filtering, urgency priority,
   FA310/AA01/visit fallbacks, clean-case "none").

## Verification

- typecheck **PASS** · lint **PASS** · tests **PASS (81, +7)** · build **PASS**.
- Browser smoke:
  - Overdue case `C-0010`: Next Action = "立即安排逾期家訪 · 逾期 8 天" (high,
    red), links to /visit; Case Abnormal panel populated.
  - Clean case `C-0017`: Next Action = "本案暫無待處理事項" (none, green, no
    action link); Case Abnormal panel = "本案無異常項目".
  - No console errors. Live DOM scan: no raw national ID / phone
    (maskedNationalId only, e.g. `G*****3235`). Full names allowed per Product
    Memory.

## Acceptance (ACCEPTANCE.md ▸ Workspace)

Opens from a case ✓ · banner (name/ID/maskedNationalId/manager/CMS/status) ✓ ·
all 8 tabs ✓ · knowledge references ✓ · **next action visible** ✓ · **case-
specific abnormal items visible** ✓ · visually distinct from Cases ✓ · no
re-search ✓ · no raw PII ✓.

## Blueprint

Case → Workspace → Modules preserved. AA01/FA310/Dispatch/Visit remain tabs
inside Workspace (not standalone pages). Visit Manager stays the visit-warning
SSOT (read-only). No business logic duplicated (abnormal detection reused).

## Next

Milestone 3 — Morning Workflow (P1, v1.3.0).
