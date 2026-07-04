// Abnormal notifications (異常通知) — things that are WRONG and need attention.
// Distinct from forward-looking Today Tasks. Feeds the Command Center panel and
// the Eisenhower Matrix.

import type { AbnormalItem, CaseRecord } from "../../adapters/types";
import { dataSources } from "../data/dataSources";

const severityRank = { high: 0, medium: 1, low: 2 } as const;

export function deriveAbnormal(cases: CaseRecord[]): AbnormalItem[] {
  const out: AbnormalItem[] = [];

  for (const c of cases) {
    // Overdue visits
    if (c.visit.status === "overdue") {
      out.push({
        id: `AB-${c.id}-visit`,
        kind: "overdue_visit",
        title: "家訪逾期",
        body: `${c.name}（${c.id}）逾期 ${Math.abs(c.visit.remainingDays ?? 0)} 天`,
        severity: "high",
        caseId: c.id,
        to: `/workspace/${c.id}/visit`,
      });
    }
    // Dispatch timeout
    if (c.dispatch.status === "timeout") {
      out.push({
        id: `AB-${c.id}-dispatch`,
        kind: "dispatch_timeout",
        title: "派案 Timeout",
        body: `${c.name}（${c.id}）派案逾時未回覆`,
        severity: "high",
        caseId: c.id,
        to: `/workspace/${c.id}/dispatch`,
      });
    } else if (c.dispatch.status === "no_capacity") {
      out.push({
        id: `AB-${c.id}-dispatch`,
        kind: "dispatch_no_capacity",
        title: "派案全數無人力",
        body: `${c.name}（${c.id}）無可用服務單位`,
        severity: "medium",
        caseId: c.id,
        to: `/workspace/${c.id}/dispatch`,
      });
    }
    // Missing AA01 (active case, not started)
    if (c.status === "active" && c.aa01Status === "not_started") {
      out.push({
        id: `AB-${c.id}-aa01`,
        kind: "missing_aa01",
        title: "AA01 未建立",
        body: `${c.name}（${c.id}）尚未建立照顧計畫`,
        severity: "medium",
        caseId: c.id,
        to: `/workspace/${c.id}/aa01`,
      });
    }
    // FA310 review failed / returned
    if (c.fa310Status === "returned") {
      out.push({
        id: `AB-${c.id}-fa310`,
        kind: "fa310_failed",
        title: "FA310 退件",
        body: `${c.name}（${c.id}）FA310 審查未通過`,
        severity: "high",
        caseId: c.id,
        to: `/workspace/${c.id}/fa310`,
      });
    }
  }

  // Source-level abnormalities (missing source data / import abnormality)
  for (const s of dataSources) {
    if (s.status === "missing" || s.status === "stale") {
      out.push({
        id: `AB-src-${s.id}`,
        kind: s.status === "missing" ? "missing_source" : "import_abnormal",
        title: s.status === "missing" ? "來源資料缺漏" : "匯入異常",
        body: `${s.name}：${s.status === "missing" ? "尚無可用資料" : "資料可能過期"}`,
        severity: "medium",
        caseId: null,
        to: "/settings",
      });
    } else if (s.status === "pending") {
      out.push({
        id: `AB-src-${s.id}`,
        kind: "missing_source",
        title: "來源尚未匯入",
        body: `${s.name} 尚未匯入，部分審查/比對功能待啟用`,
        severity: "low",
        caseId: null,
        to: "/settings",
      });
    }
  }

  return out
    .sort((a, b) => severityRank[a.severity] - severityRank[b.severity])
    .slice(0, 20);
}
