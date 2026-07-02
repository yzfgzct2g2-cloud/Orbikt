// Planner module — binds the vendored AA01 engine to an Orbikt Case.
//
// This is the "wrap": Orbikt maps a CaseRecord onto the AA01 engine's AA01Form
// and calls the REAL generator/validation. No AA01 rule is reimplemented here.
// The full 8-step authoring wizard stays in the standalone AA01 app (linked);
// V1 produces a case-bound draft from the data Orbikt already holds.

import type { CaseRecord } from "../../adapters/types";
import { externalLinks } from "../../config/externalLinks";
import type { AA01Form } from "./engine/types";
import { buildAA01Draft, generateProblemAnalysis } from "./engine/aa01Generator";
import { buildServiceValidationWarnings } from "./engine/serviceValidation";

export const planner = {
  source: "AA01 撰寫系統 · source-systems/aa01-ai-system",
  url: externalLinks.github.aa01,
  // AA01 source is available and its engine is vendored/integrated.
  status: "integrated" as const,
  engine: "vendored" as const,
};

/**
 * Map an Orbikt case onto the AA01 engine input. Only the case-level fields
 * Orbikt owns are seeded; assessment answers and planned services are authored
 * in the full AA01 wizard (linked). The engine fills unknowns with its own
 * "待補充/待確認" placeholders.
 */
export function caseToAA01Form(c: CaseRecord): AA01Form {
  return {
    caseType: "複評",
    caseNumber: c.id,
    caseName: c.name,
    cmsLevel: c.cmsLevel != null ? String(c.cmsLevel) : "",
    assessmentDate: c.assessmentDate ?? "",
    identityType: c.welfare ?? "",
    services: [],
  };
}

export interface CaseAA01Result {
  form: AA01Form;
  draft: string;
  problems: ReturnType<typeof generateProblemAnalysis>;
  warnings: string[];
}

/** Run the real AA01 engine for a case, bound to its Case ID. */
export function generateCaseAA01(c: CaseRecord): CaseAA01Result {
  const form = caseToAA01Form(c);
  return {
    form,
    draft: buildAA01Draft(form),
    problems: generateProblemAnalysis(form),
    warnings: buildServiceValidationWarnings(form),
  };
}
