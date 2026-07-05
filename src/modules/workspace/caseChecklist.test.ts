import { describe, it, expect } from "vitest";
import {
  caseCompletionChecklist,
  checklistProgress,
} from "./caseChecklist";
import type { CaseRecord } from "../../adapters/types";

function baseCase(overrides: Partial<CaseRecord> = {}): CaseRecord {
  return {
    id: "C-001",
    name: "測試個案",
    managerId: "cm-001",
    cmsLevel: 4,
    status: "active",
    visit: {
      lastVisitDate: "2026-06-01",
      nextDueDate: "2026-08-01",
      remainingDays: 30,
      status: "normal",
    },
    dispatch: { status: "accepted", updatedAt: "2026-07-01T09:00:00+08:00" },
    aa01Status: "approved",
    fa310Status: "approved",
    tags: [],
    updatedAt: "2026-07-01T09:00:00+08:00",
    openDate: "2026-01-10",
    assessmentDate: "2026-01-20",
    ...overrides,
  };
}

describe("caseCompletionChecklist", () => {
  it("marks everything done for a fully processed case", () => {
    const items = caseCompletionChecklist(baseCase());
    expect(items).toHaveLength(6);
    expect(items.every((i) => i.done)).toBe(true);
    expect(checklistProgress(items)).toEqual({ done: 6, total: 6, pct: 100 });
  });

  it("flags unfinished AA01/FA310 with the current status as detail", () => {
    const items = caseCompletionChecklist(
      baseCase({ aa01Status: "draft", fa310Status: "returned" })
    );
    const aa01 = items.find((i) => i.id === "aa01")!;
    const fa310 = items.find((i) => i.id === "fa310")!;
    expect(aa01.done).toBe(false);
    expect(aa01.detail).toContain("草稿");
    expect(fa310.done).toBe(false);
    expect(fa310.detail).toContain("已退件");
    expect(checklistProgress(items).done).toBe(4);
  });

  it("treats overdue/within_30 visits as off-track, within_60 as on-track", () => {
    const overdue = caseCompletionChecklist(
      baseCase({ visit: { ...baseCase().visit, status: "overdue" } })
    ).find((i) => i.id === "visit")!;
    expect(overdue.done).toBe(false);

    const w60 = caseCompletionChecklist(
      baseCase({ visit: { ...baseCase().visit, status: "within_60" } })
    ).find((i) => i.id === "visit")!;
    expect(w60.done).toBe(true);
  });

  it("requires both assessmentDate and cmsLevel for assessment completion", () => {
    const noCms = caseCompletionChecklist(baseCase({ cmsLevel: null })).find(
      (i) => i.id === "assessment"
    )!;
    expect(noCms.done).toBe(false);
    expect(noCms.detail).toContain("CMS 等級未評定");
  });

  it("every item links to a Workspace tab of this case", () => {
    for (const i of caseCompletionChecklist(baseCase())) {
      expect(i.to).toMatch(/^\/workspace\/C-001\//);
    }
  });
});
