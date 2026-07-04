import { describe, expect, it } from "vitest";
import { Cs100DataAdapter } from "./Cs100DataAdapter";
import team from "../../config/team.json";

const adapter = new Cs100DataAdapter();

describe("Cs100DataAdapter", () => {
  it("loads the full CS100 seed", async () => {
    const cases = await adapter.listCases();
    const expected = team.reduce((sum, m) => sum + m.caseload, 0);
    expect(cases.length).toBe(expected); // 378
  });

  it("uses non-PII surrogate ids and never exposes a raw national ID", async () => {
    const cases = await adapter.listCases();
    const json = JSON.stringify(cases);
    expect(json).not.toMatch(/[A-Z][0-9]{9}/);
    for (const c of cases) {
      expect(c.id).toMatch(/^C-\d{4}$/);
    }
  });

  it("emits only masked national IDs, never raw or a lookup hash (no salt)", async () => {
    const cases = await adapter.listCases();
    for (const c of cases) {
      if (c.maskedNationalId) {
        expect(c.maskedNationalId).toMatch(/^[A-Z]\*+\d{4}$/);
      }
      expect(c.idLookupHash).toBeUndefined();
    }
  });

  it("assigns every case to a known manager, matching team.json quotas", async () => {
    const cases = await adapter.listCases();
    const counts: Record<string, number> = {};
    for (const c of cases) counts[c.managerId] = (counts[c.managerId] ?? 0) + 1;
    for (const m of team) {
      expect(counts[m.id]).toBe(m.caseload);
    }
  });

  it("passes visit info through unchanged (Visit Manager is SSOT)", async () => {
    const cases = await adapter.listCases();
    const sample = cases[0];
    const visit = await adapter.getVisit(sample.id);
    expect(visit).toEqual(sample.visit);
  });

  it("returns forward-looking Today Tasks (no overdue-day items) referencing real cases", async () => {
    const cases = await adapter.listCases();
    const ids = new Set(cases.map((c) => c.id));
    const tasks = await adapter.listTasks();
    expect(tasks.length).toBeGreaterThan(0);
    for (const t of tasks) {
      expect(t.caseId === null || ids.has(t.caseId)).toBe(true);
      // Today Tasks must NOT be defined as "overdue X days".
      expect(t.title).not.toMatch(/逾期/);
      expect(["visit", "meeting", "plan", "dispatch", "general"]).toContain(t.type);
    }
  });

  it("returns abnormal notifications (異常通知) that reference real cases", async () => {
    const cases = await adapter.listCases();
    const ids = new Set(cases.map((c) => c.id));
    const abnormal = await adapter.listAbnormal();
    expect(abnormal.length).toBeGreaterThan(0);
    for (const a of abnormal) {
      expect(a.caseId === null || ids.has(a.caseId)).toBe(true);
      expect(["high", "medium", "low"]).toContain(a.severity);
      expect(a.to).toMatch(/^\//);
    }
    // overdue lives in abnormal, not tasks
    expect(abnormal.some((a) => a.kind === "overdue_visit")).toBe(true);
  });

  it("returns per-case tasks scoped to one case (uncapped)", async () => {
    const cases = await adapter.listCases();
    // find a case that should generate at least one task
    const target =
      cases.find(
        (c) =>
          c.visit.status === "overdue" ||
          c.dispatch.status === "timeout" ||
          c.fa310Status === "returned"
      ) ?? cases[0];
    const tasks = await adapter.listCaseTasks(target.id);
    for (const t of tasks) {
      expect(t.caseId).toBe(target.id);
    }
    // unknown case -> no tasks
    expect(await adapter.listCaseTasks("C-9999")).toEqual([]);
  });

  it("derives notifications with a bounded, sorted list", async () => {
    const notes = await adapter.listNotifications();
    expect(notes.length).toBeLessThanOrEqual(12);
    const times = notes.map((n) => n.createdAt);
    const sorted = [...times].sort((a, b) => (a < b ? 1 : -1));
    expect(times).toEqual(sorted);
  });

  it("returns a sorted schedule with standing meetings for a day", async () => {
    const events = await adapter.listSchedule("2026-07-02");
    expect(events.length).toBeGreaterThanOrEqual(2); // two standing meetings
    const kinds = events.map((e) => e.kind);
    expect(kinds).toContain("meeting");
    const starts = events.map((e) => e.start);
    const sorted = [...starts].sort();
    expect(starts).toEqual(sorted);
    // Any visit events must reference a real case and fall on the day.
    const cases = await adapter.listCases();
    const ids = new Set(cases.map((c) => c.id));
    for (const e of events) {
      if (e.kind === "visit") {
        expect(e.caseId && ids.has(e.caseId)).toBe(true);
        expect(e.start.startsWith("2026-07-02")).toBe(true);
      }
    }
  });

  it("builds a newest-first timeline for a case", async () => {
    const cases = await adapter.listCases();
    const events = await adapter.listTimeline(cases[0].id);
    const times = events.map((e) => e.at);
    const sorted = [...times].sort((a, b) => (a < b ? 1 : -1));
    expect(times).toEqual(sorted);
  });
});
