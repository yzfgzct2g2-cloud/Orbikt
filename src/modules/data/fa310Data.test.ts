import { describe, it, expect } from "vitest";
import { fa310ForCase, fa310Meta, fa310Records } from "./fa310Data";
import seed from "../../data/seed/cases.generated.json";

const caseIds = new Set((seed as { id: string }[]).map((c) => c.id));

describe("fa310Data — generated seed contract", () => {
  it("record count matches the import meta", () => {
    expect(fa310Records.length).toBe(fa310Meta.records);
  });

  it("contains no raw national ID or phone patterns", () => {
    const flat = JSON.stringify({ fa310Records, fa310Meta });
    expect(/[A-Z][12]\d{8}/.test(flat)).toBe(false);
    expect(/09\d{8}/.test(flat)).toBe(false);
  });

  it("every matched caseId resolves to a real case in the case seed", () => {
    for (const r of fa310Records) {
      if (r.caseId !== null) expect(caseIds.has(r.caseId)).toBe(true);
    }
  });

  it("matched + unmatched counts are consistent", () => {
    const matched = fa310Records.filter((r) => r.caseId !== null).length;
    expect(matched).toBe(fa310Meta.matchedCases);
    expect(fa310Records.length - matched).toBe(fa310Meta.unmatchedRecords);
  });

  it("manager exposure follows the governance data rule (name/masked/source only)", () => {
    for (const r of fa310Records) {
      expect(["fa310", "unresolved"]).toContain(r.managerSource);
      if (r.managerSource === "fa310") {
        expect(r.managerName).toBeTruthy();
        expect(r.maskedManagerId).toMatch(/^[A-Z]\*{5}\d{4}$/);
      }
      // The removed anonymous-group field must not resurface.
      expect("managerGroup" in r).toBe(false);
    }
    expect(fa310Meta.distinctManagers).toBeGreaterThan(0);
    expect(Object.keys(fa310Meta.byManagerName).length).toBe(
      fa310Meta.distinctManagers
    );
  });

  it("all manager names resolve against the roster (no unmapped managers)", () => {
    expect(fa310Meta.unmappedManagerIds).toHaveLength(0);
  });

  it("fa310ForCase returns the record for a matched case", () => {
    const someMatched = fa310Records.find((r) => r.caseId !== null)!;
    expect(fa310ForCase(someMatched.caseId!)).toBe(someMatched);
    expect(fa310ForCase("C-9999")).toBeUndefined();
  });
});
