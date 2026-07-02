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

  it("uses non-PII surrogate ids and never exposes a national ID", async () => {
    const cases = await adapter.listCases();
    const json = JSON.stringify(cases);
    expect(json).not.toMatch(/[A-Z][0-9]{9}/);
    for (const c of cases) {
      expect(c.id).toMatch(/^C-\d{4}$/);
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

  it("derives tasks that reference real cases", async () => {
    const cases = await adapter.listCases();
    const ids = new Set(cases.map((c) => c.id));
    const tasks = await adapter.listTasks();
    expect(tasks.length).toBeGreaterThan(0);
    for (const t of tasks) {
      expect(t.caseId === null || ids.has(t.caseId)).toBe(true);
    }
  });

  it("derives notifications with a bounded, sorted list", async () => {
    const notes = await adapter.listNotifications();
    expect(notes.length).toBeLessThanOrEqual(12);
    const times = notes.map((n) => n.createdAt);
    const sorted = [...times].sort((a, b) => (a < b ? 1 : -1));
    expect(times).toEqual(sorted);
  });

  it("builds a newest-first timeline for a case", async () => {
    const cases = await adapter.listCases();
    const events = await adapter.listTimeline(cases[0].id);
    const times = events.map((e) => e.at);
    const sorted = [...times].sort((a, b) => (a < b ? 1 : -1));
    expect(times).toEqual(sorted);
  });
});
