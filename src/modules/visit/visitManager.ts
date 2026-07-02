// Visit Manager module — the SINGLE access point for visit warnings in Orbikt.
//
// SSOT = the 家訪倒數網頁 (Google Apps Script). Orbikt READS or LINKS to that
// result; it must never recalculate a second countdown. In V1 the warning
// status/dates come from the case seed (which stands in for the GAS output);
// this module is the one place that groups them, so there is exactly one
// visit-warning code path. When the live GAS read is wired, only the data
// source behind `bucketVisitWarnings` changes — callers stay the same.

import type { CaseRecord, VisitStatus } from "../../adapters/types";
import { externalLinks } from "../../config/externalLinks";
import { integrations } from "../../config/appConfig";

export const visitManager = {
  source: "家訪倒數網頁 · Google Apps Script",
  url: externalLinks.googleAppsScript.visitManager,
  status: integrations.visitManager.status, // "external"
  // V1 reads the warning status the SSOT provides; it does not compute it.
  mode: "read_or_link" as const,
};

export interface VisitBuckets {
  overdue: CaseRecord[];
  within_30: CaseRecord[];
  within_60: CaseRecord[];
  scheduled: CaseRecord[];
  normal: CaseRecord[];
  completed: CaseRecord[];
}

/**
 * Group cases by the visit warning status REPORTED BY Visit Manager. This is a
 * grouping over `case.visit.status`, not a recalculation of the warning.
 */
export function bucketVisitWarnings(cases: CaseRecord[]): VisitBuckets {
  const buckets: VisitBuckets = {
    overdue: [],
    within_30: [],
    within_60: [],
    scheduled: [],
    normal: [],
    completed: [],
  };
  for (const c of cases) {
    buckets[c.visit.status].push(c);
  }
  // Most urgent first within the 30/60/overdue lists.
  const byRemaining = (a: CaseRecord, b: CaseRecord) =>
    (a.visit.remainingDays ?? 0) - (b.visit.remainingDays ?? 0);
  buckets.overdue.sort(byRemaining);
  buckets.within_30.sort(byRemaining);
  buckets.within_60.sort(byRemaining);
  return buckets;
}

export const visitAttentionStatuses: VisitStatus[] = [
  "overdue",
  "within_30",
  "within_60",
];
