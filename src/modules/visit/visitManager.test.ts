import { describe, expect, it } from "vitest";
import { bucketVisitWarnings, visitManager } from "./visitManager";
import type { CaseRecord, VisitStatus } from "../../adapters/types";

function caseWith(
  id: string,
  status: VisitStatus,
  remainingDays: number | null
): CaseRecord {
  return {
    id,
    name: id,
    managerId: "cm-001",
    cmsLevel: null,
    status: "active",
    visit: { lastVisitDate: null, nextDueDate: null, remainingDays, status },
    dispatch: { status: "accepted", updatedAt: "2026-07-02T09:00:00+08:00" },
    aa01Status: "not_started",
    fa310Status: "not_started",
    tags: [],
    updatedAt: "2026-07-02T09:00:00+08:00",
  };
}

describe("bucketVisitWarnings", () => {
  it("groups cases by the Visit-Manager-provided status", () => {
    const cases = [
      caseWith("C-1", "overdue", -5),
      caseWith("C-2", "within_30", 10),
      caseWith("C-3", "within_60", 45),
      caseWith("C-4", "normal", 90),
      caseWith("C-5", "scheduled", 5),
    ];
    const b = bucketVisitWarnings(cases);
    expect(b.overdue.map((c) => c.id)).toEqual(["C-1"]);
    expect(b.within_30.map((c) => c.id)).toEqual(["C-2"]);
    expect(b.within_60.map((c) => c.id)).toEqual(["C-3"]);
    expect(b.normal.map((c) => c.id)).toEqual(["C-4"]);
    expect(b.scheduled.map((c) => c.id)).toEqual(["C-5"]);
  });

  it("sorts warning buckets by most urgent (fewest remaining days) first", () => {
    const cases = [
      caseWith("C-a", "within_30", 20),
      caseWith("C-b", "within_30", 3),
      caseWith("C-c", "within_30", 12),
    ];
    const b = bucketVisitWarnings(cases);
    expect(b.within_30.map((c) => c.id)).toEqual(["C-b", "C-c", "C-a"]);
  });

  it("exposes the SSOT source metadata and a read-only mode", () => {
    expect(visitManager.mode).toBe("read_or_link");
    expect(visitManager.url).toContain("script.google.com");
  });
});
