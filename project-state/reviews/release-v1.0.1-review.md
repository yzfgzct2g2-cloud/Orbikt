# Release Review — Orbikt v1.0.1 (Correction Sprint)

## Objective

Fix acceptance gaps from external review and restore the Blueprint architecture,
then release v1.0.1. No redesign; Blueprint / Decisions / Migration Map preserved.

## What changed vs v1.0.0

| Area | Correction |
|---|---|
| Blueprint restore | Archived the alternate 記帳/發票 module-dashboard prototype (`archive/finance-module/`); restored Command Center as the homepage and the entry files |
| Git hygiene | `source-systems/` git-ignored + `docs/SOURCE_SYSTEMS.md`; clean tree |
| Command Center | First row = Total Caseload · Today Tasks · 30-Day · 60-Day (separate cards); overdue kept in row 2 |
| FA310 | Shows `maskedNationalId` for identity (never raw); rules stay in QA-Engine adapter; tests added |
| External links | Single machine-readable SSOT `config/external-links.json`; UI reads it |
| Unrelated data | 發票 mock data removed from production `src/` (archived) |
| Knowledge | Honestly labeled "practical index + external full-platform link"; citations kept |
| AA01 | Honestly labeled "engine-integrated draft mode; full authoring UI external" |

## Known limitations (V1 scope, carried to V1.1)

- **AA01**: engine-integrated **draft** only; full 8-step authoring UI (assessment
  entry, PDF import, service planning) remains in the external AA01 app.
- **Knowledge**: 21-topic practical index + external link; full platform
  (regulations/appendices/assistive/graph/AI Q&A) is external, not embedded.
- **Visit / Dispatch / FA310**: read-or-link + adapter seams; live GAS/API/engine
  calls require external runtime/auth (V1.1).
- **Documents**: OneDrive link-first; Microsoft Graph deferred to V1.1; some
  sub-folder/calendar links still pending in external-links.

## Verification

- typecheck / test (58) / lint / build all PASS.

## Environmental note

A concurrent external process kept re-generating the archived finance-dashboard
files and re-editing entry files during the sprint; they were re-archived and
the entry files re-restored. That process should be stopped to keep the tree
clean.

## Verdict

**v1.0.1 release-ready.** Blueprint restored; acceptance gaps corrected; scope
labeled honestly.
