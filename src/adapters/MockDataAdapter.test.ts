import { describe, expect, it } from "vitest";
import { MockDataAdapter } from "./MockDataAdapter";

const adapter = new MockDataAdapter();

describe("MockDataAdapter", () => {
  it("lists cases with the expected shape", async () => {
    const cases = await adapter.listCases();
    expect(cases.length).toBeGreaterThan(0);
    for (const c of cases) {
      expect(c.id).toMatch(/^C-\d+$/);
      expect(c.managerId).toMatch(/^cm-\d+$/);
      expect(c.visit).toBeTruthy();
      expect(c.dispatch).toBeTruthy();
    }
  });

  it("returns null for an unknown case", async () => {
    expect(await adapter.getCase("nope")).toBeNull();
  });

  it("passes visit info through unchanged (Visit Manager is SSOT)", async () => {
    const cases = await adapter.listCases();
    const sample = cases[0];
    const visit = await adapter.getVisit(sample.id);
    expect(visit).toEqual(sample.visit);
  });

  it("returns dispatch info from the external source shape", async () => {
    const dispatch = await adapter.getDispatch("C-1002");
    expect(dispatch?.status).toBe("dispatching");
  });

  it("sorts timeline newest-first", async () => {
    const events = await adapter.listTimeline("C-1001");
    const times = events.map((e) => e.at);
    const sorted = [...times].sort((a, b) => (a < b ? 1 : -1));
    expect(times).toEqual(sorted);
  });
});
