import { describe, expect, it } from "vitest";
import { deriveTodayTasks } from "./tasks";
import { deriveAbnormal } from "./abnormal";
import { classifyEisenhower, groupByQuadrant } from "./eisenhower";
import type { CaseRecord, ScheduleEvent } from "../../adapters/types";

function mkCase(over: Partial<CaseRecord> & { id: string }): CaseRecord {
  return {
    name: over.name ?? over.id,
    managerId: "cm-001",
    cmsLevel: 5,
    status: "active",
    visit: { lastVisitDate: null, nextDueDate: "2026-07-02", remainingDays: 5, status: "within_30" },
    dispatch: { status: "accepted", updatedAt: "2026-07-02T09:00:00+08:00" },
    aa01Status: "approved",
    fa310Status: "approved",
    tags: [],
    updatedAt: "2026-07-02T09:00:00+08:00",
    ...over,
  };
}

const schedule: ScheduleEvent[] = [
  { id: "m1", caseId: null, title: "個管晨會", start: "2026-07-02T09:00:00+08:00", end: null, kind: "meeting" },
  { id: "v1", caseId: "C-1", title: "王 家訪", start: "2026-07-02T10:00:00+08:00", end: null, kind: "visit" },
];

describe("deriveTodayTasks (forward-looking)", () => {
  it("includes meetings, scheduled visits, and unfinished plans — not overdue", () => {
    const cases = [
      mkCase({ id: "C-1", aa01Status: "draft" }),
      mkCase({ id: "C-2", visit: { lastVisitDate: null, nextDueDate: "2026-05-01", remainingDays: -20, status: "overdue" } }),
    ];
    const tasks = deriveTodayTasks(cases, schedule, "2026-07-02");
    const types = tasks.map((t) => t.type);
    expect(types).toContain("meeting");
    expect(types).toContain("visit");
    expect(types).toContain("plan");
    // no overdue-day task text
    expect(tasks.every((t) => !/逾期/.test(t.title))).toBe(true);
  });
});

describe("deriveAbnormal (異常通知)", () => {
  it("captures overdue / timeout / missing AA01 / FA310 failed", () => {
    const cases = [
      mkCase({ id: "C-1", visit: { lastVisitDate: null, nextDueDate: "2026-05-01", remainingDays: -20, status: "overdue" } }),
      mkCase({ id: "C-2", dispatch: { status: "timeout", updatedAt: "2026-07-01T09:00:00+08:00" } }),
      mkCase({ id: "C-3", aa01Status: "not_started" }),
      mkCase({ id: "C-4", fa310Status: "returned" }),
    ];
    const kinds = deriveAbnormal(cases).map((a) => a.kind);
    expect(kinds).toContain("overdue_visit");
    expect(kinds).toContain("dispatch_timeout");
    expect(kinds).toContain("missing_aa01");
    expect(kinds).toContain("fa310_failed");
  });
});

describe("classifyEisenhower", () => {
  it("places overdue in urgent+important and 60-day in important+not-urgent", () => {
    const cases = [
      mkCase({ id: "C-1", visit: { lastVisitDate: null, nextDueDate: "2026-05-01", remainingDays: -20, status: "overdue" } }),
      mkCase({ id: "C-2", visit: { lastVisitDate: null, nextDueDate: "2026-08-20", remainingDays: 49, status: "within_60" } }),
    ];
    const grouped = groupByQuadrant(classifyEisenhower(cases));
    expect(grouped.urgent_important.total).toBeGreaterThan(0);
    expect(grouped.important_not_urgent.total).toBeGreaterThan(0);
    // every item has a navigation target
    for (const q of Object.values(grouped))
      for (const it of q.shown) expect(it.to).toMatch(/^\/workspace\//);
  });
});
