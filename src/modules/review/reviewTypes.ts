// FA310 Review types — the adapter contract between Orbikt and the
// LongCare-QA-Engine (Python). These mirror the engine's Evidence-First finding
// contract (docs/contracts/schemas/finding.schema.json) so a live engine result
// maps onto this shape directly. FA310 review RULES are NOT modeled or executed
// here — Orbikt only represents/displays the engine's output.

export type FindingSource =
  | "hard_rule"
  | "soft_rule"
  | "ai_review"
  | "manual_review";

export type FindingSeverity = "low" | "medium" | "high";

export type FindingCategory =
  | "missing"
  | "inconsistent"
  | "rule_violation"
  | "out_of_quota"
  | "code_mismatch"
  | "unclear"
  | "other";

export type FindingStatus =
  | "need_fix"
  | "manual_review"
  | "ignored"
  | "pass"
  | "error";

export interface FindingLocation {
  fieldId: string;
  columnLetter?: string;
  columnName?: string;
  cell?: string;
}

export interface ReviewFinding {
  findingId: string;
  source: FindingSource;
  severity: FindingSeverity;
  category: FindingCategory;
  location: FindingLocation;
  issue: string;
  suspectedRuleIds: string[];
  // Evidence / knowledge citation ids — Evidence-First: no finding without evidence.
  evidence: string[];
  confidence: number; // 0..1
  status: FindingStatus;
  // Correction suggestion (from the engine's Modifier stage), when available.
  suggestion?: string;
}

export type ReviewOutcome = "pass" | "returned" | "in_review" | "pending";

export interface ReviewResult {
  caseId: string;
  domain: "fa310";
  outcome: ReviewOutcome;
  findings: ReviewFinding[];
  engine: string; // e.g. "LongCare-QA-Engine 1.0.0-rc3"
  generatedAt: string | null; // ISO datetime, null when not yet reviewed
}
