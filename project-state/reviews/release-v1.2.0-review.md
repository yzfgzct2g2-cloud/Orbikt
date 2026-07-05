# Release Review — v1.2.0 (Milestone 2 — Workspace Work Mode)

## Scope

Complete Milestone 2 per WORKFLOW.md and ACCEPTANCE.md ▸ Workspace: make the
Workspace feel like entering a case file. Earlier phases already delivered the
banner, all eight tabs, and knowledge references; this release closes the two
outstanding acceptance gaps — next action and case-specific abnormal items.

## Acceptance evaluation (ACCEPTANCE ▸ Workspace)

| Criterion | Result |
| --- | --- |
| Opens from a selected case | ✓ |
| Case banner + name + ID | ✓ |
| maskedNationalId visible | ✓ (e.g. G*****3235) |
| Responsible manager / CMS / status | ✓ |
| Overview / AA01 / FA310 / Dispatch / Visit / Genogram / Attachments / Timeline tabs | ✓ |
| Knowledge references | ✓ (Overview) |
| **Next action visible** | ✓ NEW — strip on every tab, derived + explainable |
| **Case-specific abnormal items visible** | ✓ NEW — Overview panel, per-case |
| Visually distinct from Cases | ✓ case-file banner |
| No re-search after entry | ✓ |
| No raw PII | ✓ DOM scan clean |

FAIL conditions: none (Workspace is not a bare shell; AA01/FA310/Dispatch/Visit
are tabs not separate pages; no raw PII).

## Blueprint / Product Memory

- Case → Workspace → Modules preserved; Workspace is the case operating surface.
- Visit Manager remains the visit-warning SSOT (read-only); next-action reads
  stored status, never recomputes remaining days.
- **No duplicated business logic**: `caseAbnormalItems` reuses `deriveAbnormal`.

## Verification evidence

- typecheck PASS · lint PASS · tests PASS (81, +7) · build PASS.
- Browser smoke on overdue (`C-0010`) and clean (`C-0017`) cases; both urgency
  paths correct; no console errors.

## Deferred (recorded, not abandoned)

- Genogram production module, full AA01 authoring UI, live Dispatch/Visit APIs,
  Microsoft Graph attachments — tracked in WORKFLOW.md Future Backlog / Milestone
  6 (External Integration). Not required for Milestone 2 acceptance.

## Verdict

**Acceptance PASS** for Milestone 2 — Workspace Work Mode. Release v1.2.0.
