// Data source management — status of the import sources that feed Orbikt.
//
// Raw files live in input/ (never shipped to the browser); sanitized/generated
// files live in generated/ (browser-safe). The browser only ever sees the
// sanitized artifacts (e.g. src/data/seed/cases.generated.json with
// maskedNationalId only). This module is metadata + status for Settings and for
// abnormal detection — it does NOT read raw files.

export type DataSourceStatus = "ok" | "pending" | "stale" | "missing";

export interface DataSourceInfo {
  id: string;
  name: string;
  kind: string;
  status: DataSourceStatus;
  lastImported: string | null; // ISO datetime, null if never
  recordCount: number | null;
  rawLocation: string; // input/
  sanitizedLocation: string; // generated/
  importCommand: string;
  reportLink: string | null; // import report path/URL
  note: string;
}

// Import/report locations (repo-relative). Raw = input/, sanitized = generated/.
export const dataPaths = {
  rawRoot: "input/",
  sanitizedRoot: "generated/",
};

export const dataSources: DataSourceInfo[] = [
  {
    id: "cs100",
    name: "CS100 個案清冊",
    kind: "Excel（個案主檔）",
    status: "ok",
    lastImported: "2026-07-02T08:00:00+08:00",
    recordCount: 378,
    rawLocation: "input/CS100.xlsx",
    sanitizedLocation: "generated/cases.generated.json（maskedNationalId only）",
    importCommand: "npm run seed:cases",
    reportLink: "src/data/seed/meta.generated.json",
    note: "原始檔含身分證號等 PII，僅於匯入時處理；瀏覽器只取得去識別化後資料。",
  },
  {
    id: "fa310",
    name: "FA310 審查資料",
    kind: "LongCare-QA-Engine（Python，Adapter）",
    status: "pending",
    lastImported: null,
    recordCount: null,
    rawLocation: "input/FA310/*.xlsx",
    sanitizedLocation: "generated/fa310.*.json（去識別化）",
    importCommand: "（於 LongCare-QA-Engine 匯入，Orbikt 以 Adapter 介接）",
    reportLink: null,
    note: "FA310 個管欄位為身分證號；匯入時比對 CS100 姓名，瀏覽器僅顯示 maskedNationalId。尚未匯入。",
  },
];

export function dataSourceById(id: string): DataSourceInfo | undefined {
  return dataSources.find((s) => s.id === id);
}
