// Dispatch module — the SINGLE access point for dispatch status in Orbikt.
//
// SSOT = the external Dispatch system (console today, API later). Orbikt shows
// status and links out; it must not rebuild dispatch logic. In V1 the status
// comes from the case seed (standing in for the Dispatch system); this module
// is the one place that groups/labels it. When the Dispatch API is wired, only
// the data source behind these helpers changes — callers stay the same.

import type { CaseRecord, DispatchStatus } from "../../adapters/types";
import { externalLinks } from "../../config/externalLinks";
import { integrations } from "../../config/appConfig";

export const dispatchManager = {
  source: "派案系統 · 外部主控台",
  url: externalLinks.googleAppsScript.dispatchConsole,
  status: integrations.dispatch.status, // "external"
  future: integrations.dispatch.future ?? "api", // API-ready
  mode: "read_or_link" as const,
};

// Statuses that need a case manager's attention on the Command Center.
export const dispatchAttentionStatuses: DispatchStatus[] = [
  "timeout",
  "no_capacity",
  "manual_required",
];

const DISPATCH_ORDER: DispatchStatus[] = [
  "dispatching",
  "waiting",
  "timeout",
  "no_capacity",
  "manual_required",
  "accepted",
  "closed",
];

/** Count cases by dispatch status, in a stable display order. */
export function dispatchCounts(
  cases: CaseRecord[]
): { status: DispatchStatus; count: number }[] {
  const counts = new Map<DispatchStatus, number>();
  for (const c of cases) {
    counts.set(c.dispatch.status, (counts.get(c.dispatch.status) ?? 0) + 1);
  }
  return DISPATCH_ORDER.filter((s) => counts.has(s)).map((status) => ({
    status,
    count: counts.get(status) ?? 0,
  }));
}

/** Cases whose dispatch status needs attention (timeout / no capacity / manual). */
export function dispatchAttention(cases: CaseRecord[]): CaseRecord[] {
  return cases.filter((c) =>
    dispatchAttentionStatuses.includes(c.dispatch.status)
  );
}
