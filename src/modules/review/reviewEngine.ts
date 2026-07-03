// FA310 review engine seam.
//
// SSOT for FA310 review = LongCare-QA-Engine (Python, Evidence-First loop).
// Orbikt must NOT reimplement FA310 rules in React. This module represents the
// engine's result and, in V1, maps a case's existing fa310Status to a
// representative ReviewResult (a stand-in for the engine output). When the
// engine is wired via its adapter/API, `reviewFromStatus` is replaced by the
// real engine call — the ReviewResult contract stays the same.

import type { CaseRecord, ModuleStatus } from "../../adapters/types";
import { externalLinks } from "../../config/externalLinks";
import type { ReviewResult } from "./reviewTypes";

/**
 * Identity label for FA310 identity verification. Consumes the MASKED national
 * ID only (never the raw value, which is not available browser-side). Used by
 * the FA310 tab so a reviewer can confirm they are looking at the right person
 * without exposing the full ID.
 */
export function fa310IdentityLabel(
  c: Pick<CaseRecord, "name" | "id" | "maskedNationalId">
): string {
  return `${c.name}（${c.id}）· 身分證 ${c.maskedNationalId ?? "—"}`;
}

export const reviewManager = {
  source: "LongCare-QA-Engine · Python（Evidence-First）",
  url: externalLinks.github.qaEngine,
  engine: "LongCare-QA-Engine 1.0.0-rc3",
  // FA310 rules live in the engine; React only displays results.
  mode: "adapter" as const,
  note: "FA310 審查規則由 LongCare-QA-Engine 提供，React 端不重建。",
};

/**
 * Map a case's FA310 module status to a representative review result. This does
 * NOT evaluate FA310 content — it only reflects the review state Orbikt already
 * holds. Real findings come from the engine (Extract → Rule → Evidence →
 * Reviewer → Verifier → Modifier), never from React.
 */
export function reviewFromStatus(
  caseId: string,
  fa310Status: ModuleStatus,
  generatedAt: string | null = null
): ReviewResult {
  const base = {
    caseId,
    domain: "fa310" as const,
    engine: reviewManager.engine,
    generatedAt,
  };

  if (fa310Status === "approved") {
    return { ...base, outcome: "pass", findings: [] };
  }

  if (fa310Status === "returned") {
    return {
      ...base,
      outcome: "returned",
      findings: [
        {
          findingId: `fnd-${caseId}-01`,
          source: "ai_review",
          severity: "medium",
          category: "rule_violation",
          location: {
            fieldId: "col_L",
            columnLetter: "L",
            columnName: "問題及建議",
            cell: "L",
          },
          issue:
            "審查引擎回報本案需修正（範例；實際問題與依據由 LongCare-QA-Engine 產出）。",
          suspectedRuleIds: ["fa310-review"],
          evidence: ["fa310-review-contract"],
          confidence: 0.9,
          status: "need_fix",
          suggestion: "依審查結果修正欄位 L 後，經人工 Approve 再重送。",
        },
      ],
    };
  }

  if (fa310Status === "submitted" || fa310Status === "in_progress") {
    return { ...base, outcome: "in_review", findings: [] };
  }

  return { ...base, outcome: "pending", findings: [] };
}
