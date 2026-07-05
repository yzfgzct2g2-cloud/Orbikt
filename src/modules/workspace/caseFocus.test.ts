import { describe, it, expect } from "vitest";
import { caseAbnormalItems, nextCaseAction } from "./caseFocus";
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
    maskedNationalId: "A*****6789",
    ...overrides,
  };
}

describe("caseFocus — case-scoped abnormal items", () => {
  it("returns only items for this case (no source-level items)", () => {
    const c = baseCase({ visit: { ...baseCase().visit, status: "overdue", remainingDays: -5 } });
    const items = caseAbnormalItems(c);
    expect(items.length).toBeGreaterThan(0);
    expect(items.every((a) => a.caseId === c.id)).toBe(true);
  });

  it("is empty for a clean case", () => {
    expect(caseAbnormalItems(baseCase())).toHaveLength(0);
  });
});

describe("caseFocus — next action", () => {
  it("prioritises a high-severity abnormal (overdue visit)", () => {
    const c = baseCase({
      visit: { ...baseCase().visit, status: "overdue", remainingDays: -5 },
    });
    const action = nextCaseAction(c);
    expect(action.urgency).toBe("high");
    expect(action.to).toBe(`/workspace/${c.id}/visit`);
    expect(action.reason).not.toBe("");
  });

  it("routes FA310 returned to the fa310 tab", () => {
    const c = baseCase({ fa310Status: "returned" });
    const action = nextCaseAction(c);
    expect(action.title).toContain("FA310");
    expect(action.to).toBe(`/workspace/${c.id}/fa310`);
  });

  it("falls back to AA01 completion when a draft exists", () => {
    const c = baseCase({ aa01Status: "draft" });
    const action = nextCaseAction(c);
    expect(action.to).toBe(`/workspace/${c.id}/aa01`);
    expect(action.urgency).toBe("low");
  });

  it("suggests FA310 submission after AA01 is submitted", () => {
    const c = baseCase({ aa01Status: "submitted", fa310Status: "not_started" });
    expect(nextCaseAction(c).to).toBe(`/workspace/${c.id}/fa310`);
  });

  it("returns a 'nothing to do' action for a clean case", () => {
    const action = nextCaseAction(baseCase());
    expect(action.urgency).toBe("none");
    expect(action.title).toContain("暫無");
  });
});
