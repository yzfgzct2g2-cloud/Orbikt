import { describe, expect, it } from "vitest";
import {
  dispatchAttention,
  dispatchCounts,
  dispatchManager,
} from "./dispatchManager";
import type { CaseRecord, DispatchStatus } from "../../adapters/types";

function caseWith(id: string, status: DispatchStatus): CaseRecord {
  return {
    id,
    name: id,
    managerId: "cm-001",
    cmsLevel: null,
    status: "active",
    visit: {
      lastVisitDate: null,
      nextDueDate: null,
      remainingDays: null,
      status: "normal",
    },
    dispatch: { status, updatedAt: "2026-07-02T09:00:00+08:00" },
    aa01Status: "not_started",
    fa310Status: "not_started",
    tags: [],
    updatedAt: "2026-07-02T09:00:00+08:00",
  };
}

describe("dispatch module", () => {
  it("counts statuses in stable display order", () => {
    const cases = [
      caseWith("C-1", "accepted"),
      caseWith("C-2", "dispatching"),
      caseWith("C-3", "accepted"),
      caseWith("C-4", "timeout"),
    ];
    const counts = dispatchCounts(cases);
    expect(counts).toEqual([
      { status: "dispatching", count: 1 },
      { status: "timeout", count: 1 },
      { status: "accepted", count: 2 },
    ]);
  });

  it("flags attention statuses (timeout / no capacity / manual)", () => {
    const cases = [
      caseWith("C-1", "accepted"),
      caseWith("C-2", "timeout"),
      caseWith("C-3", "no_capacity"),
      caseWith("C-4", "manual_required"),
      caseWith("C-5", "waiting"),
    ];
    expect(dispatchAttention(cases).map((c) => c.id)).toEqual([
      "C-2",
      "C-3",
      "C-4",
    ]);
  });

  it("exposes external, API-ready metadata", () => {
    expect(dispatchManager.status).toBe("external");
    expect(dispatchManager.future).toBe("api");
    expect(dispatchManager.url).toContain("http");
  });
});
