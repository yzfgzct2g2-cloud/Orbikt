# Checkpoint CP-0009

## Current Phase

Phase 7 — AA01 (Planner) integration

## Status

PHASE_7_COMPLETE

## Summary

Integrated AA01 into the Workspace by VENDORING the existing AA01 rule engine
(pure TypeScript) into `src/modules/planner/engine` and binding it to the Case
ID. No AA01 rule was rewritten — Orbikt runs the real generator/validation.

## Delivered

- Vendored engine (`src/modules/planner/engine/`), verbatim except flattened
  import paths (9 files, ~1,536 lines):
  types, caseProfile, serviceCatalog, assessmentSummary, serviceGoalLibrary,
  aa01Generator, serviceValidation, problemMatrix, serviceSuggestion. PDF-import
  modules intentionally not vendored (not needed). Provenance in engine/README.md.
- `src/modules/planner/planner.ts` — `caseToAA01Form(case)` maps an Orbikt case
  onto `AA01Form`; `generateCaseAA01(case)` runs the real `buildAA01Draft` +
  `generateProblemAnalysis` + `buildServiceValidationWarnings`.
- Workspace AA01 tab now renders the case-bound draft (現況評估 / 問題及需求 /
  計畫執行規劃 / 擬核定服務), service-validation warnings, a copy button, and a
  link to the full AA01 authoring app.
- Tests: `planner.test.ts` (mapping, real-generator output binds Case ID,
  delegation equals `buildAA01Draft`, engine=vendored/integrated).
- ESLint ignores the vendored engine dir (third-party code, preserved verbatim).

## Blueprint compliance

- "Preserve generator, validation, rules, output" — logic vendored unchanged.
- "Bind AA01 data to Case ID" — form seeded from the case; draft embeds 案號/姓名.
- "Do not rewrite AA01 rules / no separate AA01 homepage" — engine reused; AA01
  lives only inside the Workspace tab.
- "Wrap first, refactor later" — full 8-step wizard stays in the standalone app
  (linked); Orbikt wraps the engine.

## Build / Type Check / Tests / Lint

- Build: PASS (bundle ~464 kB / gzip 105 kB — up from the vendored engine +
  service catalog).
- Typecheck: PASS (vendored engine compiles under Orbikt strict config).
- Tests: 38/38 PASS. Lint: PASS.
- Runtime smoke: AA01 tab renders the real generator output bound to the case;
  no console errors.

## Next Step

Phase 8 — Integrate FA310 (Review) through a LongCare-QA-Engine adapter seam.
FA310 rules must NOT be reimplemented in React; the adapter represents the
Python engine's review result. Live engine calls require external runtime; the
seam will be mock/link in V1.
