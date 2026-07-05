// Workspace case focus — the two things that make Workspace feel like a case
// file rather than a list: (1) the case-specific abnormal items, and (2) the
// single most important NEXT ACTION for this case.
//
// Both are DERIVED from the case's stored state and are explainable/traceable
// (they carry a reason and a navigation target). Abnormal detection reuses
// deriveAbnormal — we do NOT duplicate that business logic here.

import type { AbnormalItem, CaseRecord } from "../../adapters/types";
import { deriveAbnormal } from "../dashboard/abnormal";

/** Abnormal items scoped to a single case (source-level items excluded). */
export function caseAbnormalItems(c: CaseRecord): AbnormalItem[] {
  return deriveAbnormal([c]).filter((a) => a.caseId === c.id);
}

export type NextActionUrgency = "high" | "medium" | "low" | "none";

export interface NextAction {
  title: string; // what to do next
  reason: string; // why — explainable
  to: string; // where clicking goes (a Workspace tab)
  urgency: NextActionUrgency;
}

// Map a case abnormal item to the concrete next action it implies.
function actionFromAbnormal(a: AbnormalItem): NextAction {
  switch (a.kind) {
    case "overdue_visit":
      return { title: "立即安排逾期家訪", reason: a.body, to: a.to, urgency: "high" };
    case "dispatch_timeout":
      return { title: "處理派案逾時", reason: a.body, to: a.to, urgency: "high" };
    case "fa310_failed":
      return { title: "修正 FA310 退件", reason: a.body, to: a.to, urgency: "high" };
    case "dispatch_no_capacity":
      return {
        title: "協調派案人力",
        reason: a.body,
        to: a.to,
        urgency: "medium",
      };
    case "missing_aa01":
      return {
        title: "建立 AA01 照顧計畫",
        reason: a.body,
        to: a.to,
        urgency: "medium",
      };
    default:
      return { title: a.title, reason: a.body, to: a.to, urgency: "medium" };
  }
}

/**
 * The single next action for a case. Abnormal items (already severity-sorted)
 * take precedence; otherwise fall back to the natural module progression
 * (AA01 → FA310 → visit). Always returns something explainable.
 */
export function nextCaseAction(c: CaseRecord): NextAction {
  const abnormal = caseAbnormalItems(c);
  if (abnormal.length > 0) {
    return actionFromAbnormal(abnormal[0]);
  }

  // No abnormalities — suggest the next step in the case lifecycle.
  if (c.aa01Status === "draft" || c.aa01Status === "in_progress") {
    return {
      title: "完成 AA01 照顧計畫並送審",
      reason: `AA01 目前為${c.aa01Status === "draft" ? "草稿" : "進行中"}，尚未送審。`,
      to: `/workspace/${c.id}/aa01`,
      urgency: "low",
    };
  }
  if (
    (c.aa01Status === "submitted" || c.aa01Status === "approved") &&
    c.fa310Status === "not_started"
  ) {
    return {
      title: "送出 FA310 審查",
      reason: "AA01 已送審／通過，FA310 尚未送審。",
      to: `/workspace/${c.id}/fa310`,
      urgency: "low",
    };
  }
  if (c.visit.status === "within_30") {
    return {
      title: "準備 30 日內到期家訪",
      reason: `家訪將於 ${c.visit.nextDueDate ?? "近期"} 到期。`,
      to: `/workspace/${c.id}/visit`,
      urgency: "medium",
    };
  }
  if (c.visit.status === "within_60" || c.visit.status === "scheduled") {
    return {
      title: "安排家訪",
      reason:
        c.visit.status === "scheduled"
          ? "家訪已排程，確認準備事項。"
          : `家訪將於 ${c.visit.nextDueDate ?? "60 日內"} 到期。`,
      to: `/workspace/${c.id}/visit`,
      urgency: "low",
    };
  }

  return {
    title: "本案暫無待處理事項",
    reason: "無異常，且各模組狀態正常。",
    to: `/workspace/${c.id}/overview`,
    urgency: "none",
  };
}
