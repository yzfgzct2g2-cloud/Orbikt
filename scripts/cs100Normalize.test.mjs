import { describe, expect, it } from "vitest";
import {
  assignManagers,
  blankToNull,
  buildCases,
  deriveTags,
  genDispatch,
  genModuleStatus,
  genVisit,
  hashString,
  mapCaseStatus,
  parseAge,
  parseCms,
  rocToIso,
  CS100_COLS,
} from "./cs100Normalize.mjs";

const SEED = "2026-07-02";

describe("cs100Normalize field parsers", () => {
  it("converts ROC dates to ISO", () => {
    expect(rocToIso("115/06/30")).toBe("2026-06-30");
    expect(rocToIso("032/09/11")).toBe("1943-09-11");
    expect(rocToIso("-")).toBeNull();
    expect(rocToIso("")).toBeNull();
    expect(rocToIso("115/13/30")).toBeNull();
  });

  it("parses CMS level", () => {
    expect(parseCms("4級")).toBe(4);
    expect(parseCms("-")).toBeNull();
    expect(parseCms("")).toBeNull();
    expect(parseCms("9級")).toBeNull();
  });

  it("parses age", () => {
    expect(parseAge("82歲")).toBe(82);
    expect(parseAge("-")).toBeNull();
  });

  it("maps case status", () => {
    expect(mapCaseStatus("開案服務中-督導重新指派")).toBe("active");
    expect(mapCaseStatus("結案")).toBe("closed");
    expect(mapCaseStatus("暫停服務")).toBe("suspended");
  });

  it("treats sentinel values as blank", () => {
    expect(blankToNull("-")).toBeNull();
    expect(blankToNull("否")).toBeNull();
    expect(blankToNull("宜蘭縣")).toBe("宜蘭縣");
  });

  it("derives tags from premium flags + welfare", () => {
    const row = [];
    row[CS100_COLS.premiumTransport] = "是";
    row[CS100_COLS.premiumCare] = "-";
    row[CS100_COLS.welfare] = "第三類";
    expect(deriveTags(row)).toContain("交通從優");
    expect(deriveTags(row)).toContain("第三類");
    expect(deriveTags(row)).not.toContain("照顧從優");
  });
});

describe("deterministic seed generators", () => {
  it("hashString is stable", () => {
    expect(hashString("115B03131")).toBe(hashString("115B03131"));
  });

  it("genVisit returns a valid status and consistent dates", () => {
    const v = genVisit("115B03131", SEED);
    expect([
      "normal",
      "within_60",
      "within_30",
      "overdue",
      "scheduled",
      "completed",
    ]).toContain(v.status);
    expect(v.nextDueDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("genDispatch returns a valid status", () => {
    const d = genDispatch("115B03131", SEED);
    expect([
      "dispatching",
      "waiting",
      "timeout",
      "accepted",
      "no_capacity",
      "manual_required",
      "closed",
    ]).toContain(d.status);
  });

  it("genModuleStatus returns a valid module status", () => {
    for (const kind of ["aa01", "fa310"]) {
      const s = genModuleStatus("115B03131", kind);
      expect([
        "not_started",
        "draft",
        "in_progress",
        "submitted",
        "approved",
        "returned",
      ]).toContain(s);
    }
  });
});

describe("assignManagers + buildCases", () => {
  const team = [
    { id: "cm-001", name: "A", role: "case_manager", caseload: 2 },
    { id: "cm-002", name: "B", role: "case_manager", caseload: 3 },
  ];

  it("fills manager quotas in order", () => {
    const cases = Array.from({ length: 5 }, (_, i) => ({ id: `C-${i}` }));
    const assigned = assignManagers(cases, team);
    expect(assigned.map((c) => c.managerId)).toEqual([
      "cm-001",
      "cm-001",
      "cm-002",
      "cm-002",
      "cm-002",
    ]);
  });

  it("buildCases assigns surrogate ids and never leaks the national ID", () => {
    // Row where 案號 embeds a national ID (SYNTHETIC value, mirrors the real
    // CS100 format "CSMS-P<national-id><suffix>"). A123456789 is a fake id.
    const row = [];
    row[CS100_COLS.caseNo] = "CSMS-PA1234567890";
    row[CS100_COLS.name] = "王小明";
    row[CS100_COLS.cms] = "4級";
    row[CS100_COLS.caseStatus] = "開案服務中";
    const cases = buildCases([row], team, SEED);
    expect(cases).toHaveLength(1);
    expect(cases[0].id).toBe("C-0001");
    // No field may contain the national-ID pattern or the raw 案號.
    const json = JSON.stringify(cases[0]);
    expect(json).not.toMatch(/[A-Z][0-9]{9}/);
    expect(json).not.toContain("CSMS-P");
    expect(json).not.toContain("A123456789");
    expect(cases[0].srcKey).toBeUndefined();
  });
});
