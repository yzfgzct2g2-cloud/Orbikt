# Checkpoint CP-0013

## Current Phase

Phase 11 — Document Center

## Status

PHASE_11_COMPLETE

## Summary

Built the Document Center as OneDrive link-first: categorized document shortcuts
(available vs. pending links surfaced honestly) and a per-case Attachments
shortcut bound to the Case ID. Microsoft Graph API remains deferred to V1.1.

## Delivered

- `src/modules/documents/documents.ts` — `documentsManager` metadata
  (`v1_link_only`), `documentShortcuts` (shared folder available; AA01 範本 /
  法規資料 / 常用表單 / 教育訓練 pending until links are provided),
  `availableDocumentLinks()` (for the Command Center card / adapter), and
  `caseAttachmentLink(case)` (per-case shortcut; per-case subfolder pending).
- `Cs100DataAdapter.listDocuments` now returns `availableDocumentLinks()`.
- Documents page: available shortcuts by category + a "待補連結" section listing
  the shortcuts whose OneDrive URLs are not yet in external-links.md.
- Workspace Attachments tab: case-bound shortcut with an honest note that the
  per-case subfolder link is pending.
- Tests: `documents.test.ts` (link-first status, available links are URLs,
  pending surfaced, case attachment binding).

## Blueprint compliance

- "V1 先支援 OneDrive 共用資料夾捷徑" — link-first delivered.
- "Documents accessible; case attachments accessible from Workspace" — both.
- Microsoft Graph API deferred to V1.1 — respected (no Graph calls).
- No faked links: pending shortcuts are shown as pending, not fabricated.

## Build / Type Check / Tests / Lint

- Build: PASS (bundle ~480 kB / gzip 112 kB).
- Typecheck: PASS · Tests: 54/54 PASS · Lint: PASS.
- Runtime smoke: Documents page shows categorized shortcuts + pending; Attachments
  tab is case-bound; no console errors.

## Next Step

Phase 12 — Final polish + release: whole-app QA pass, set version to v1.0.0,
final checkpoint/review, commit (and tag).
