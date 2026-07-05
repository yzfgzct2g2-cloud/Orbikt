// Triage filters for the Cases registry, driven by URL search params so that
// Command Center KPI chips can click through to the exact case list they count
// (ACCEPTANCE ▸ Morning Workflow: clicking any dashboard item opens the correct
// destination). Pure functions — the Cases page owns presentation.

import type { CaseRecord, VisitStatus } from "../adapters/types";
import { dispatchAttention } from "../modules/dispatch/dispatchManager";
import { visitStatusLabel } from "./labels";

export interface TriageFilter {
  visit?: VisitStatus;
  dispatch?: "attention";
}

const VISIT_STATUSES: VisitStatus[] = [
  "normal",
  "within_60",
  "within_30",
  "overdue",
  "scheduled",
  "completed",
];

/** Parse a triage filter from URL search params. Unknown values are ignored. */
export function triageFilterFromParams(params: URLSearchParams): TriageFilter {
  const filter: TriageFilter = {};
  const visit = params.get("visit");
  if (visit && (VISIT_STATUSES as string[]).includes(visit)) {
    filter.visit = visit as VisitStatus;
  }
  if (params.get("dispatch") === "attention") {
    filter.dispatch = "attention";
  }
  return filter;
}

/** Apply a triage filter. Dispatch "attention" reuses dispatchAttention (SSOT). */
export function applyTriageFilter(
  cases: CaseRecord[],
  filter: TriageFilter
): CaseRecord[] {
  let out = cases;
  if (filter.visit) {
    out = out.filter((c) => c.visit.status === filter.visit);
  }
  if (filter.dispatch === "attention") {
    const attention = new Set(dispatchAttention(out).map((c) => c.id));
    out = out.filter((c) => attention.has(c.id));
  }
  return out;
}

/** Human label for the active-filter chip; null when no filter is active. */
export function triageFilterLabel(filter: TriageFilter): string | null {
  const parts: string[] = [];
  if (filter.visit) parts.push(`訪視：${visitStatusLabel[filter.visit]}`);
  if (filter.dispatch === "attention") parts.push("派案：需關注");
  return parts.length > 0 ? parts.join("・") : null;
}
