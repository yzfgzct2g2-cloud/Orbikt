# Release Review — v1.4.0 (Milestone 4 — Case Workflow)

## Scope

Complete Milestone 4 per WORKFLOW.md §9: allow a case manager to process an
entire case without leaving Workspace unnecessarily. M2 delivered the case-file
surface (banner, 8 tabs, next action, case abnormal items); this release adds
the completion checklist and banner-level completion status.

## Acceptance evaluation

WORKFLOW.md §9 scope → status:

| Scope item | Where |
| --- | --- |
| import/source view | Data Center (global) + source fields on Overview |
| case overview | Overview tab (master fields, status cards) |
| assessment context | 評估日期 / CMS / 照管專員 on Overview; checklist item |
| AA01 status or draft | AA01 tab (engine draft) + status card + checklist |
| FA310 status or review result | FA310 tab (findings) + status card + checklist |
| dispatch status | Dispatch tab + checklist |
| visit status | Visit tab (SSOT read) + checklist |
| documents | Attachments tab (OneDrive link-first) |
| timeline | Timeline tab + Overview preview |
| knowledge references | Overview (traceable sources) |
| **completion checklist** | ✓ NEW — Overview card + banner 完成度 x/6 |

Completion Criteria: identify unfinished work ✓ · move between modules ✓ ·
no re-search ✓ · clear completion status ✓ · tests/build/lint/typecheck PASS ✓.

**Governance discrepancy recorded:** WORKFLOW.md points to
"ACCEPTANCE.md ▸ Case Workflow", which does not exist in ACCEPTANCE.md
(Governance V2). Review used the milestone's own Completion Criteria plus the
general Acceptance Principles. Suggest the user add that section (or update the
reference) in a future governance revision — per governance, Claude does not
edit ACCEPTANCE.md criteria unilaterally.

## Evidence

- typecheck / lint / tests (96) / build PASS.
- DOM-verified: C-0010 → 3/6 (50%), explainable details, 6 tab links;
  C-0017 → 6/6 (100%). No console errors; no raw PII.

## Blueprint / Product Memory

- Everything case-scoped stays inside Workspace; checklist items link to tabs,
  not external pages.
- Visit Manager remains visit-warning SSOT — checklist reads `visit.status`,
  never recomputes.
- No duplicated rules; labels reused from `lib/labels.ts`.

## Deferred (recorded, not abandoned)

- Real per-case document completeness check (needs Microsoft Graph — Milestone 6).
- FA310 live review result in checklist detail (needs FA310 import — Milestone 6).

## Verdict

**Acceptance PASS** for Milestone 4 — Case Workflow. Release v1.4.0.
