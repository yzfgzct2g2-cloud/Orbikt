import { describe, it, expect } from "vitest";
import {
  applyTriageFilter,
  triageFilterFromParams,
  triageFilterLabel,
} from "./caseFilters";
import type { CaseRecord, DispatchStatus, VisitStatus } from "../adapters/types";

function makeCase(
  id: string,
  visit: VisitStatus,
  dispatch: DispatchStatus
): CaseRecord {
  return {
    id,
    name: `個案 ${id}`,
    managerId: "cm-001",
    cmsLevel: 3,
    status: "active",
    visit: {
      lastVisitDate: null,
      nextDueDate: null,
      remainingDays: null,
      status: visit,
    },
    dispatch: { status: dispatch, updatedAt: "2026-07-01T09:00:00+08:00" },
    aa01Status: "draft",
    fa310Status: "draft",
    tags: [],
    updatedAt: "2026-07-01T09:00:00+08:00",
  };
}

const cases = [
  makeCase("C-1", "overdue", "accepted"),
  makeCase("C-2", "within_30", "timeout"),
  makeCase("C-3", "normal", "no_capacity"),
  makeCase("C-4", "normal", "closed"),
];

describe("triageFilterFromParams", () => {
  it("parses a valid visit status", () => {
    expect(triageFilterFromParams(new URLSearchParams("visit=overdue"))).toEqual(
      { visit: "overdue" }
    );
  });

  it("ignores unknown values (no crash, no filter)", () => {
    expect(triageFilterFromParams(new URLSearchParams("visit=bogus"))).toEqual(
      {}
    );
    expect(
      triageFilterFromParams(new URLSearchParams("dispatch=bogus"))
    ).toEqual({});
  });

  it("parses dispatch=attention", () => {
    expect(
      triageFilterFromParams(new URLSearchParams("dispatch=attention"))
    ).toEqual({ dispatch: "attention" });
  });
});

describe("applyTriageFilter", () => {
  it("filters by visit status", () => {
    const out = applyTriageFilter(cases, { visit: "overdue" });
    expect(out.map((c) => c.id)).toEqual(["C-1"]);
  });

  it("filters dispatch attention via dispatchAttention (reused, not duplicated)", () => {
    const out = applyTriageFilter(cases, { dispatch: "attention" });
    // timeout and no_capacity need attention; accepted/closed do not.
    expect(out.map((c) => c.id)).toContain("C-2");
    expect(out.map((c) => c.id)).toContain("C-3");
    expect(out.map((c) => c.id)).not.toContain("C-1");
    expect(out.map((c) => c.id)).not.toContain("C-4");
  });

  it("returns everything for an empty filter", () => {
    expect(applyTriageFilter(cases, {})).toHaveLength(cases.length);
  });
});

describe("triageFilterLabel", () => {
  it("labels an active filter and returns null when empty", () => {
    expect(triageFilterLabel({ visit: "overdue" })).toContain("已逾期");
    expect(triageFilterLabel({ dispatch: "attention" })).toContain("需關注");
    expect(triageFilterLabel({})).toBeNull();
  });
});
