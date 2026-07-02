import { describe, expect, it } from "vitest";
import { caseToAA01Form, generateCaseAA01, planner } from "./planner";
import { buildAA01Draft } from "./engine/aa01Generator";
import type { CaseRecord } from "../../adapters/types";

const sample: CaseRecord = {
  id: "C-0123",
  name: "測試個案",
  managerId: "cm-001",
  cmsLevel: 5,
  status: "active",
  visit: {
    lastVisitDate: "2026-05-01",
    nextDueDate: "2026-07-30",
    remainingDays: 27,
    status: "within_30",
  },
  dispatch: { status: "accepted", updatedAt: "2026-07-01T09:00:00+08:00" },
  aa01Status: "in_progress",
  fa310Status: "not_started",
  tags: [],
  updatedAt: "2026-07-01T09:00:00+08:00",
  welfare: "第三類",
  assessmentDate: "2026-06-15",
};

describe("planner (vendored AA01 engine wrap)", () => {
  it("maps a case onto the AA01Form, bound to Case ID", () => {
    const form = caseToAA01Form(sample);
    expect(form.caseNumber).toBe("C-0123");
    expect(form.caseName).toBe("測試個案");
    expect(form.cmsLevel).toBe("5");
    expect(form.identityType).toBe("第三類");
    expect(form.assessmentDate).toBe("2026-06-15");
  });

  it("runs the REAL AA01 generator and binds the draft to the case", () => {
    const result = generateCaseAA01(sample);
    expect(typeof result.draft).toBe("string");
    expect(result.draft.length).toBeGreaterThan(100);
    // Case identity is bound into the output.
    expect(result.draft).toContain("C-0123");
    expect(result.draft).toContain("測試個案");
    // Known AA01 section headings prove the vendored generator produced this.
    expect(result.draft).toContain("個案現況評估");
    expect(result.draft).toContain("計畫執行規劃");
    expect(Array.isArray(result.warnings)).toBe(true);
  });

  it("delegates to the vendored buildAA01Draft (same output)", () => {
    const form = caseToAA01Form(sample);
    expect(generateCaseAA01(sample).draft).toBe(buildAA01Draft(form));
  });

  it("reports the engine as vendored/integrated", () => {
    expect(planner.engine).toBe("vendored");
    expect(planner.status).toBe("integrated");
  });
});
