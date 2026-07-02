# Phase 4 Review — Case Workspace Consolidation

## Objective

Make the Case Workspace the complete operating surface: Overview realises
"Case + Task + Timeline", and module state is visible per tab.

## Delivered

- `listCaseTasks(caseId)` adapter method (per-case, uncapped).
- Overview: Case Tasks + Recent Timeline added alongside master + status cards.
- Tab bar status dots for AA01 / FA310 / Dispatch / Visit.

## Workspace Mapping — all 8 tabs present and source-correct

Overview (Case+Task+Timeline), AA01, FA310, Dispatch, Visit, Genogram,
Attachments, Timeline. AA01/FA310/Dispatch/Visit/Genogram remain tabs inside the
Workspace, never standalone homepages.

## SSOT integrity

Status dots and case tasks read the case's stored status; nothing is recomputed.
Visit remains read-only pending the Phase 5 Visit Manager integration.

## Quality gates

- Build: PASS · Typecheck: PASS · Tests: 28/28 PASS · Lint: PASS
- Runtime smoke: PASS (Overview depth + tab dots verified, no console errors).

## Carried forward

- Live Visit Manager (Phase 5), Dispatch (Phase 6), AA01 (Phase 7), FA310
  (Phase 8) integrations.
- Editable tasks/notes are future scope; V1 surfaces derived open tasks.

## Verdict

**Phase 4 COMPLETE.** Proceeding to Phase 5 (Visit Manager shell).
