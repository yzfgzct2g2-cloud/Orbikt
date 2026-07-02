# Planner engine (vendored from aa01-ai-system)

These modules are **vendored verbatim** from `source-systems/aa01-ai-system/src`
(the AA01 撰寫系統). They are the pure-TypeScript rule/generator/validation core
— no React, no external runtime dependencies.

**Do not rewrite this logic.** Per the Blueprint ("preserve generator,
validation, rules, output"; "wrap first, refactor later"), Orbikt reuses the
existing AA01 logic rather than reimplementing it. The only change made during
vendoring was flattening the directory layout and updating relative import
paths accordingly — no business logic was altered.

## Source → vendored mapping

| aa01-ai-system source | vendored file |
|---|---|
| `src/types.ts` | `types.ts` |
| `src/types/caseProfile.ts` | `caseProfile.ts` |
| `src/data/serviceCatalog.ts` | `serviceCatalog.ts` |
| `src/rules/assessmentSummary.ts` | `assessmentSummary.ts` |
| `src/rules/serviceGoalLibrary.ts` | `serviceGoalLibrary.ts` |
| `src/rules/aa01Generator.ts` | `aa01Generator.ts` |
| `src/rules/serviceValidation.ts` | `serviceValidation.ts` |
| `src/rules/problemMatrix.ts` | `problemMatrix.ts` |
| `src/rules/serviceSuggestion.ts` | `serviceSuggestion.ts` |

## Public API used by Orbikt

- `buildAA01Draft(form: AA01Form): string` — the full AA01 plan text.
- `generateProblemAnalysis(form): { care, transport, respite, environment }`.
- `buildServiceValidationWarnings(form): string[]`.

The full 8-step authoring wizard remains in the standalone AA01 app; Orbikt
wraps the engine and binds it to a Case ID (see `../planner.ts`). PDF-import
modules were intentionally not vendored (not needed by the generator).
