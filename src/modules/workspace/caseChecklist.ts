// Case completion checklist — answers "what remains unfinished for this case?"
// (WORKFLOW.md Milestone 4). Every item is DERIVED from the case's stored state,
// explainable (carries the current state as detail), and navigable (links to
// the Workspace tab where the work happens).
//
// SSOT is respected: items READ stored statuses (visit from Visit Manager,
// dispatch from the external console, AA01/FA310 module statuses) — nothing is
// recomputed or duplicated here.

import type { CaseRecord } from "../../adapters/types";
import {
  dispatchStatusLabel,
  moduleStatusLabel,
  visitStatusLabel,
} from "../../lib/labels";

export interface ChecklistItem {
  id: string;
  label: string;
  done: boolean;
  detail: string; // current state — why the item is (not) done
  to: string; // Workspace tab where this is worked on
}

export interface ChecklistProgress {
  done: number;
  total: number;
  pct: number; // 0–100
}

export function caseCompletionChecklist(c: CaseRecord): ChecklistItem[] {
  const tab = (t: string) => `/workspace/${c.id}/${t}`;

  const opened = Boolean(c.openDate);
  const assessed = Boolean(c.assessmentDate) && c.cmsLevel !== null;
  const aa01Done = c.aa01Status === "approved";
  const fa310Done = c.fa310Status === "approved";
  const dispatchDone =
    c.dispatch.status === "accepted" || c.dispatch.status === "closed";
  // Visit is "on track" when the SSOT reports no warning. within_60 counts as
  // on track (informational); within_30 / overdue need action.
  const visitOnTrack =
    c.visit.status === "normal" ||
    c.visit.status === "completed" ||
    c.visit.status === "scheduled" ||
    c.visit.status === "within_60";

  return [
    {
      id: "open",
      label: "開案建檔",
      done: opened,
      detail: opened ? `開案日期 ${c.openDate}` : "尚無開案日期",
      to: tab("overview"),
    },
    {
      id: "assessment",
      label: "評估完成（CMS）",
      done: assessed,
      detail: assessed
        ? `評估日期 ${c.assessmentDate} · CMS ${c.cmsLevel}`
        : c.assessmentDate
          ? "已有評估日期，CMS 等級未評定"
          : "尚未評估",
      to: tab("overview"),
    },
    {
      id: "aa01",
      label: "AA01 照顧計畫核定",
      done: aa01Done,
      detail: `目前狀態：${moduleStatusLabel[c.aa01Status]}`,
      to: tab("aa01"),
    },
    {
      id: "fa310",
      label: "FA310 審查通過",
      done: fa310Done,
      detail: `目前狀態：${moduleStatusLabel[c.fa310Status]}`,
      to: tab("fa310"),
    },
    {
      id: "dispatch",
      label: "派案完成",
      done: dispatchDone,
      detail: `目前狀態：${dispatchStatusLabel[c.dispatch.status]}`,
      to: tab("dispatch"),
    },
    {
      id: "visit",
      label: "訪視在軌（Visit Manager）",
      done: visitOnTrack,
      detail: `警戒狀態：${visitStatusLabel[c.visit.status]}${
        c.visit.nextDueDate ? ` · 下次 ${c.visit.nextDueDate}` : ""
      }`,
      to: tab("visit"),
    },
  ];
}

export function checklistProgress(items: ChecklistItem[]): ChecklistProgress {
  const done = items.filter((i) => i.done).length;
  const total = items.length;
  return { done, total, pct: total > 0 ? Math.round((done / total) * 100) : 0 };
}
