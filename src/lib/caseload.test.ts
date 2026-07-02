import { describe, expect, it } from "vitest";
import { caseloadByManager } from "./caseload";
import type { CaseRecord, Manager } from "../adapters/types";

const team: Manager[] = [
  { id: "cm-001", name: "A", role: "case_manager", caseload: 2 },
  { id: "cm-002", name: "B", role: "case_manager", caseload: 5 },
];

function caseFor(managerId: string, id: string): CaseRecord {
  return {
    id,
    name: id,
    managerId,
    cmsLevel: null,
    status: "active",
    visit: {
      lastVisitDate: null,
      nextDueDate: null,
      remainingDays: null,
      status: "normal",
    },
    dispatch: { status: "accepted", updatedAt: "2026-07-02T09:00:00+08:00" },
    aa01Status: "not_started",
    fa310Status: "not_started",
    tags: [],
    updatedAt: "2026-07-02T09:00:00+08:00",
  };
}

describe("caseloadByManager", () => {
  it("reports reference (team.json) and assigned (live) counts per manager", () => {
    const cases = [
      caseFor("cm-001", "C-1"),
      caseFor("cm-002", "C-2"),
      caseFor("cm-002", "C-3"),
    ];
    const result = caseloadByManager(cases, team);
    expect(result).toEqual([
      { managerId: "cm-001", name: "A", reference: 2, assigned: 1 },
      { managerId: "cm-002", name: "B", reference: 5, assigned: 2 },
    ]);
  });

  it("returns zero assigned for managers with no cases", () => {
    const result = caseloadByManager([], team);
    expect(result.map((r) => r.assigned)).toEqual([0, 0]);
  });
});
