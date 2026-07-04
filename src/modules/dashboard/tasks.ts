// Today Tasks — FORWARD-LOOKING planned work for today.
//
// Deliberately NOT "overdue by X days" (that is an abnormality — see abnormal.ts).
// Today Tasks = meeting notices, care plans to complete, cases to dispatch,
// scheduled visits, and planned work for today.

import type { CaseRecord, ScheduleEvent, TaskItem } from "../../adapters/types";
import { SEED_TODAY } from "../../config/appTime";

interface RankedTask extends TaskItem {
  rank: number;
}

/**
 * Build today's planned work from the case set and today's schedule.
 * `schedule` should already be filtered to today's events.
 */
export function deriveTodayTasks(
  cases: CaseRecord[],
  schedule: ScheduleEvent[],
  day: string = SEED_TODAY
): TaskItem[] {
  const out: RankedTask[] = [];

  // 1. Meeting notices (from the calendar) — 會議通知
  for (const ev of schedule) {
    if (ev.kind === "meeting" || ev.kind === "review") {
      out.push({
        id: `TT-${ev.id}`,
        caseId: null,
        title: `會議：${ev.title}`,
        due: day,
        type: "meeting",
        done: false,
        to: "/notifications",
        rank: 0,
      });
    }
  }

  // 2. Scheduled visits today — 今日排定家訪
  for (const ev of schedule) {
    if (ev.kind === "visit" && ev.caseId) {
      out.push({
        id: `TT-${ev.id}`,
        caseId: ev.caseId,
        title: `今日家訪：${ev.title.replace(/ 家訪$/, "")}`,
        due: day,
        type: "visit",
        done: false,
        to: `/workspace/${ev.caseId}/visit`,
        rank: 1,
      });
    }
  }

  // 3. Care plans to complete — 待完成照顧計畫（AA01 草稿 / 進行中）
  for (const c of cases) {
    if (
      c.status === "active" &&
      (c.aa01Status === "draft" || c.aa01Status === "in_progress")
    ) {
      out.push({
        id: `TT-${c.id}-aa01`,
        caseId: c.id,
        title: `完成照顧計畫 AA01：${c.name}`,
        due: day,
        type: "plan",
        done: false,
        to: `/workspace/${c.id}/aa01`,
        rank: 2,
      });
    }
  }

  // 4. Cases to dispatch / follow up — 待派送 / 跟進派案（等待回覆中）
  for (const c of cases) {
    if (c.dispatch.status === "waiting" || c.dispatch.status === "dispatching") {
      out.push({
        id: `TT-${c.id}-dispatch`,
        caseId: c.id,
        title: `派案跟進：${c.name}`,
        due: day,
        type: "dispatch",
        done: false,
        to: `/workspace/${c.id}/dispatch`,
        rank: 3,
      });
    }
  }

  return out
    .sort((a, b) => a.rank - b.rank)
    .slice(0, 12)
    .map((t) => ({
      id: t.id,
      caseId: t.caseId,
      title: t.title,
      due: t.due,
      type: t.type,
      done: t.done,
      to: t.to,
    }));
}
