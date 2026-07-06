import { describe, it, expect } from "vitest";
import {
  buildCaseManagerNames,
  buildFa310,
  parseFlag,
  parseManagerMapCsv,
  resolveFa310Cols,
  rocCompactToIso,
} from "./fa310Normalize.mjs";

// Synthetic header matching the real FA310 Requests export ordering.
const HEADER = [
  "身分證字號",
  "服務日期",
  "服務項目-電訪",
  "服務項目-家訪",
  "服務項目-其他",
  "主責個管員身分證",
  "追蹤服務適應與介入情形",
  "各項服務目標及整體計畫目標達成情形",
];

// Synthetic (fake) IDs — valid format, not real people.
const CASE_A = "A100000001";
const CASE_B = "B200000002";
const CASE_X = "C100000009"; // not in CS100
const MGR_1 = "D200000003";
const MGR_2 = "E100000004";

function row(caseId, date, phone, home, mgr, tracking = "已追蹤", goals = "達成") {
  return [caseId, date, phone, home, "", mgr, tracking, goals];
}

const rawIdToCaseId = new Map([
  [CASE_A, "C-0001"],
  [CASE_B, "C-0002"],
]);

describe("fa310Normalize — primitives", () => {
  it("parses ROC compact dates", () => {
    expect(rocCompactToIso("1150630")).toBe("2026-06-30");
    expect(rocCompactToIso("1140101")).toBe("2025-01-01");
    expect(rocCompactToIso("1151332")).toBeNull(); // month 13
    expect(rocCompactToIso("garbage")).toBeNull();
  });

  it("parses V flags", () => {
    expect(parseFlag("V")).toBe(true);
    expect(parseFlag(" v ")).toBe(true);
    expect(parseFlag("")).toBe(false);
  });

  it("resolves columns by name and fails loudly when missing", () => {
    expect(resolveFa310Cols(HEADER).managerRawId).toBe(5);
    expect(() => resolveFa310Cols(["foo", "bar"])).toThrow(/找不到必要欄位/);
  });

  it("parses the manager roster CSV (quoted fields, header, bad rows)", () => {
    const csv = [
      '"managerNationalId","managerName"',
      `"${MGR_1}","王小明"`,
      `"${MGR_2}","李小華"`,
      '"not-an-id","壞資料"',
    ].join("\n");
    const { map, errors } = parseManagerMapCsv(csv);
    expect(map.get(MGR_1)).toBe("王小明");
    expect(map.get(MGR_2)).toBe("李小華");
    expect(map.size).toBe(2);
    expect(errors).toHaveLength(1);
  });

  it("builds the raw-case-id → managerName map for case assignment", () => {
    const managerMap = new Map([[MGR_1, "王小明"]]);
    const data = [
      row(CASE_A, "1150630", "V", "", MGR_1),
      row(CASE_B, "1150601", "", "V", MGR_2), // manager not in roster
    ];
    const m = buildCaseManagerNames(data, HEADER, managerMap);
    expect(m.get(CASE_A)).toBe("王小明");
    expect(m.has(CASE_B)).toBe(false);
  });
});

describe("fa310Normalize — buildFa310", () => {
  const data = [
    row(CASE_A, "1150630", "V", "", MGR_1),
    row(CASE_B, "1150601", "", "V", MGR_2),
    row(CASE_X, "1150515", "V", "", MGR_1), // unmatched case
  ];

  it("matches cases to surrogate ids and counts unmatched", () => {
    const managerMap = new Map([
      [MGR_1, "王小明"],
      [MGR_2, "李小華"],
    ]);
    const { records, meta } = buildFa310(data, HEADER, rawIdToCaseId, {
      generatedAt: "2026-07-06T00:00:00Z",
      managerMap,
    });
    expect(records).toHaveLength(3);
    expect(records[0].caseId).toBe("C-0001");
    expect(records[1].caseId).toBe("C-0002");
    expect(records[2].caseId).toBeNull();
    expect(meta.matchedCases).toBe(2);
    expect(meta.unmatchedRecords).toBe(1);
    // distinctManagers counts resolved names on MATCHED records; the unmatched
    // row's manager does not count toward matched-case stats.
    expect(meta.distinctManagers).toBe(2);
  });

  it("emits masked ids only — no raw national ID anywhere in the output", () => {
    const managerMap = new Map([
      [MGR_1, "王小明"],
      [MGR_2, "李小華"],
    ]);
    const out = buildFa310(data, HEADER, rawIdToCaseId, { managerMap });
    const flat = JSON.stringify(out);
    for (const raw of [CASE_A, CASE_B, CASE_X, MGR_1, MGR_2]) {
      expect(flat).not.toContain(raw);
    }
    expect(out.records[0].maskedNationalId).toBe("A*****0001");
    expect(out.records[0].maskedManagerId).toBe("D*****0003");
    expect(out.records[0].managerName).toBe("王小明");
    expect(out.records[0].managerSource).toBe("fa310");
    expect(out.meta.byManagerName["王小明"]).toBe(1);
  });

  it("marks records unresolved when the manager is not in the roster", () => {
    const managerMap = new Map([[MGR_1, "王小明"]]);
    const out = buildFa310(data, HEADER, rawIdToCaseId, { managerMap });
    const rec = out.records[1]; // MGR_2 not in roster
    expect(rec.managerName).toBeNull();
    expect(rec.managerSource).toBe("unresolved");
    expect(out.meta.unmappedManagerIds).toHaveLength(1);
    expect(out.meta.unmappedManagerIds[0]).toMatch(/^[A-Z]\*{5}\d{4}$/);
  });

  it("parses service fields", () => {
    const { records } = buildFa310(data, HEADER, rawIdToCaseId);
    expect(records[0]).toMatchObject({
      serviceDate: "2026-06-30",
      phoneVisit: true,
      homeVisit: false,
      hasTracking: true,
      hasGoals: true,
    });
    expect(records[1]).toMatchObject({ phoneVisit: false, homeVisit: true });
  });

  it("skips rows without a valid case id (counted as invalid)", () => {
    const { meta } = buildFa310(
      [row("not-an-id", "1150630", "V", "", MGR_1), ...data],
      HEADER,
      rawIdToCaseId
    );
    expect(meta.invalidRows).toBe(1);
    expect(meta.records).toBe(3);
  });
});
