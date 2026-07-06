import { describe, it, expect } from "vitest";
import {
  dataHealthSummary,
  importHistory,
  importLog,
  importReport,
  matchingResult,
  sourceIssues,
  validationResults,
} from "./dataCenter";
import { dataSources } from "./dataSources";
import seed from "../../data/seed/cases.generated.json";

describe("dataCenter — health summary", () => {
  it("counts every source and reports safe record total", () => {
    const h = dataHealthSummary();
    expect(h.total).toBe(dataSources.length);
    const summed =
      h.byStatus.ok +
      h.byStatus.pending +
      h.byStatus.seed +
      h.byStatus.stale +
      h.byStatus.missing;
    expect(summed).toBe(dataSources.length);
    expect(h.totalRecords).toBeGreaterThan(0);
  });

  it("covers all six required source systems", () => {
    const ids = dataSources.map((s) => s.id).sort();
    expect(ids).toEqual(
      ["aa01", "cs100", "dispatch", "fa310", "knowledge", "visit"].sort()
    );
  });
});

describe("dataCenter — import report", () => {
  it("reports the real CS100 generation with breakdowns", () => {
    const r = importReport();
    expect(r.count).toBeGreaterThan(0);
    expect(r.breakdown.byManager.length).toBeGreaterThan(0);
    expect(r.breakdown.byVisitStatus.length).toBeGreaterThan(0);
    // Breakdown is sorted descending by count.
    const values = r.breakdown.byManager.map((row) => Number(row.value));
    const sorted = [...values].sort((a, b) => b - a);
    expect(values).toEqual(sorted);
  });
});

describe("dataCenter — history + log", () => {
  it("produces one history entry per source", () => {
    expect(importHistory()).toHaveLength(dataSources.length);
  });

  it("marks FA310 as imported (success) in history", () => {
    const fa310 = importHistory().find((h) => h.id === "imp-fa310");
    expect(fa310?.result).toBe("success");
    expect(fa310?.count).toBeGreaterThan(0);
  });

  it("sorts the log newest first with null timestamps last", () => {
    const lines = importLog();
    const withTime = lines.filter((l) => l.at);
    for (let i = 1; i < withTime.length; i += 1) {
      expect(withTime[i - 1].at! >= withTime[i].at!).toBe(true);
    }
    // Any null-timestamp lines are at the tail.
    const firstNull = lines.findIndex((l) => !l.at);
    if (firstNull >= 0) {
      expect(lines.slice(firstNull).every((l) => !l.at)).toBe(true);
    }
  });
});

describe("dataCenter — validation (privacy evidence)", () => {
  it("passes: no raw national ID or phone in the browser seed", () => {
    const v = validationResults();
    expect(v.find((c) => c.id === "v-raw-id")?.status).toBe("pass");
    expect(v.find((c) => c.id === "v-phone")?.status).toBe("pass");
  });

  it("record count matches the import report", () => {
    expect(validationResults().find((c) => c.id === "v-count")?.status).toBe(
      "pass"
    );
  });

  it("guards directly against a raw TW national ID pattern in the seed", () => {
    expect(/[A-Z][12]\d{8}/.test(JSON.stringify(seed))).toBe(false);
  });
});

describe("dataCenter — matching", () => {
  it("FA310 is the primary manager source with real per-name stats", () => {
    const m = matchingResult();
    expect(m.status).toBe("matched");
    expect(m.assignedCases).toBeGreaterThan(0);
    expect(m.managerCount).toBeGreaterThan(0);
    expect(m.detail).toContain("FA310 為個管主要來源");
    // Real manager names appear in the explanation.
    expect(m.detail).toMatch(/案個管由 FA310 指派/);
  });
});

describe("dataCenter — source issues", () => {
  it("no longer flags FA310 as a source issue (imported ok)", () => {
    // FA310 is imported; unmatched records surface via errors/validation, not
    // as a missing-source warning.
    expect(sourceIssues().some((i) => i.source.includes("FA310"))).toBe(false);
  });

  it("does not flag CS100 (ok)", () => {
    expect(sourceIssues().some((i) => i.source.includes("CS100"))).toBe(false);
  });
});

describe("dataCenter — FA310 validation", () => {
  it("FA310 generated data passes the raw-ID scan", () => {
    expect(validationResults().find((c) => c.id === "v-fa310-raw")?.status).toBe(
      "pass"
    );
  });

  it("reports the FA310↔CS100 match result with unmatched detail", () => {
    const v = validationResults().find((c) => c.id === "v-fa310-match");
    expect(v).toBeDefined();
    expect(["pass", "warn"]).toContain(v!.status);
    expect(v!.detail).toMatch(/對應/);
  });
});
