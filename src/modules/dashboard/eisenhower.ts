// Eisenhower Matrix classification for the Command Center.
//
// Classifies action signals — abnormalities, visit warnings, dispatch items,
// AA01 unfinished, FA310 failed — into the four quadrants. Each item carries a
// navigation target so clicking opens the relevant case/tab.

import type { CaseRecord } from "../../adapters/types";

export type Quadrant =
  | "urgent_important" // 立即處理
  | "important_not_urgent" // 排程處理
  | "urgent_not_important" // 儘快處理
  | "not_urgent_not_important"; // 待辦

export interface EisenhowerItem {
  id: string;
  label: string;
  to: string;
  quadrant: Quadrant;
}

export const quadrantMeta: Record<
  Quadrant,
  { title: string; subtitle: string; className: string }
> = {
  urgent_important: {
    title: "緊急 × 重要",
    subtitle: "立即處理",
    className: "bg-red-50 border-red-200",
  },
  important_not_urgent: {
    title: "重要 × 不緊急",
    subtitle: "排程處理",
    className: "bg-blue-50 border-blue-200",
  },
  urgent_not_important: {
    title: "緊急 × 不重要",
    subtitle: "儘快處理",
    className: "bg-amber-50 border-amber-200",
  },
  not_urgent_not_important: {
    title: "不緊急 × 不重要",
    subtitle: "待辦",
    className: "bg-slate-50 border-slate-200",
  },
};

export const quadrantOrder: Quadrant[] = [
  "urgent_important",
  "important_not_urgent",
  "urgent_not_important",
  "not_urgent_not_important",
];

export function classifyEisenhower(cases: CaseRecord[]): EisenhowerItem[] {
  const items: EisenhowerItem[] = [];
  const push = (
    id: string,
    label: string,
    to: string,
    quadrant: Quadrant
  ) => items.push({ id, label, to, quadrant });

  for (const c of cases) {
    // Urgent + important: overdue visit, dispatch timeout, FA310 failed
    if (c.visit.status === "overdue")
      push(`E-${c.id}-ov`, `家訪逾期：${c.name}`, `/workspace/${c.id}/visit`, "urgent_important");
    if (c.dispatch.status === "timeout")
      push(`E-${c.id}-dt`, `派案 Timeout：${c.name}`, `/workspace/${c.id}/dispatch`, "urgent_important");
    if (c.fa310Status === "returned")
      push(`E-${c.id}-fa`, `FA310 退件：${c.name}`, `/workspace/${c.id}/fa310`, "urgent_important");

    // Important + not urgent: missing/unfinished AA01, 60-day visits
    if (c.status === "active" && c.aa01Status === "not_started")
      push(`E-${c.id}-ma`, `AA01 未建立：${c.name}`, `/workspace/${c.id}/aa01`, "important_not_urgent");
    else if (c.aa01Status === "draft" || c.aa01Status === "in_progress")
      push(`E-${c.id}-ua`, `完成 AA01：${c.name}`, `/workspace/${c.id}/aa01`, "important_not_urgent");
    if (c.visit.status === "within_60")
      push(`E-${c.id}-v60`, `60 日內家訪：${c.name}`, `/workspace/${c.id}/visit`, "important_not_urgent");

    // Urgent + not important: 30-day visits, dispatch follow-up
    if (c.visit.status === "within_30")
      push(`E-${c.id}-v30`, `30 日內家訪：${c.name}`, `/workspace/${c.id}/visit`, "urgent_not_important");
    if (c.dispatch.status === "waiting")
      push(`E-${c.id}-dw`, `派案跟進：${c.name}`, `/workspace/${c.id}/dispatch`, "urgent_not_important");

    // Not urgent + not important: scheduled visits
    if (c.visit.status === "scheduled")
      push(`E-${c.id}-vs`, `已排程家訪：${c.name}`, `/workspace/${c.id}/visit`, "not_urgent_not_important");
  }

  return items;
}

/** Group classified items by quadrant, capped per quadrant for a compact view. */
export function groupByQuadrant(
  items: EisenhowerItem[],
  perQuadrant = 4
): Record<Quadrant, { shown: EisenhowerItem[]; total: number }> {
  const result = {} as Record<
    Quadrant,
    { shown: EisenhowerItem[]; total: number }
  >;
  for (const q of quadrantOrder) {
    const all = items.filter((i) => i.quadrant === q);
    result[q] = { shown: all.slice(0, perQuadrant), total: all.length };
  }
  return result;
}
