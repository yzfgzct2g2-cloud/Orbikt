# Phase 8 Review — FA310 (Review) via QA-Engine Adapter

## Objective

Integrate FA310 review through the LongCare-QA-Engine adapter, WITHOUT
reimplementing FA310 rules in React.

## Approach

Modeled the QA Engine's Evidence-First finding contract as Orbikt types, added a
review engine seam (`reviewFromStatus`) that REPRESENTS the engine result by
mapping the case's stored FA310 status, and a `ReviewAdapter` (mock now, live
later). The FA310 tab displays the result.

## Delivered

- `reviewTypes.ts`, `reviewEngine.ts`, `reviewAdapter.ts`.
- FA310 Workspace tab: outcome + Evidence-First findings + QA Engine link.
- `review.test.ts` (mapping, Evidence-First invariants, adapter binding).

## Blueprint compliance

FA310 rules are not duplicated in React; the module only represents/displays the
engine's output contract. Evidence-First (location + issue + evidence +
confidence) preserved. Review status is bound to the Case ID and surfaced across
the app.

## Quality gates

- Build: PASS · Typecheck: PASS · Tests: 44/44 PASS · Lint: PASS
- Runtime smoke: PASS (returned-case finding rendered, no console errors).

## Carried forward

- Live QA-Engine call (HTTP/CLI) requires external runtime; contract + seam are
  ready.
- Knowledge Hub — Phase 9.

## Verdict

**Phase 8 COMPLETE.** Proceeding to Phase 9 (Knowledge Hub).
