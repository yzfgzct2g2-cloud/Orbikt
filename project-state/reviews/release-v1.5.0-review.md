# Release Review — v1.5.0 (Milestone 5 — Automation)

## Scope

Complete Milestone 5 per WORKFLOW.md §10 and ACCEPTANCE.md ▸ Automation.
Orbikt's automation was already in place as pure derivations (M1–M4); this
release makes explainability/traceability explicit and defines refresh
semantics.

## Acceptance evaluation (ACCEPTANCE ▸ Automation)

| Criterion | Result |
| --- | --- |
| Automation is explainable | ✓ registry rule per automation; Next Action shows reason inline; abnormal items name case + condition |
| Automation is traceable | ✓ data source per entry; Data Center matching/validation traceable to generated artifacts |
| Automation can be verified by users | ✓ Settings ▸ 自動化透明度 lists rule/source/surface/code path |
| Never silently changes important data | ✓ all automations read-only; refresh merges (preserves) user done-marks |
| Abnormal cases remain visible | ✓ 異常通知 / 個案異常 unchanged |
| User can understand why a result occurred | ✓ |

WORKFLOW §10 expected output: matching automated ✓ · reminders automatic ✓
(tasks/notifications) · abnormal detection automatic ✓ · **dashboard refresh
behavior defined** ✓ NEW (manual re-derivation, done-marks preserved, last
refreshed shown, no fake polling) · workflow suggestions explainable ✓.

## Safety review

- Registry test enforces: every entry complete, ids unique, no automation
  writes beyond session state.
- Refresh done-merge covered by unit test and browser-verified (1/12 survives ↻).
- Nothing writes to source systems; Visit Manager / Dispatch SSOT untouched.

## Evidence

typecheck / lint / tests (101) / build PASS · DOM verification of refresh and
transparency section · no console errors · no raw PII.

## Deferred (recorded, not abandoned)

- Live auto-refresh (polling/webhooks) — meaningful only with live adapters →
  Milestone 6.
- Persisted task done-state across sessions → Supabase (Milestone 6 / backlog).

## Verdict

**Acceptance PASS** for Milestone 5 — Automation. Release v1.5.0.
