// Data source management — status of the import sources that feed Orbikt.
//
// Raw files live in input/ (never shipped to the browser); sanitized/generated
// files live in generated/ (browser-safe). The browser only ever sees the
// sanitized artifacts (e.g. src/data/seed/cases.generated.json with
// maskedNationalId only). This module is metadata + status for the Data Center
// and for abnormal detection — it does NOT read raw files.

import meta from "../../data/seed/meta.generated.json";
import topics from "../knowledge/topics.generated.json";

// Statuses, honest about how each source currently supplies data:
//  ok      — imported/generated, browser-safe data available now
//  pending — source not yet imported / awaiting live wiring (no data)
//  seed    — provisional deterministic seed stand-in in place; live source
//            (SSOT adapter) not yet wired, but the app has usable data
//  stale   — imported but possibly outdated
//  missing — no data at all
export type DataSourceStatus = "ok" | "pending" | "seed" | "stale" | "missing";

// How the source feeds the app today (integration mode).
export type DataSourceMode =
  | "imported" // local import script → generated artifact
  | "index" // built search/reference index
  | "engine" // vendored computation engine
  | "adapter" // adapter seam to an external system (not yet live)
  | "external"; // external SSOT read via seed stand-in until API is wired

export interface DataSourceInfo {
  id: string;
  name: string;
  kind: string;
  mode: DataSourceMode;
  status: DataSourceStatus;
  lastImported: string | null; // ISO datetime, null if never
  recordCount: number | null;
  rawLocation: string; // input/
  sanitizedLocation: string; // generated/
  importCommand: string;
  reportLink: string | null; // import report path/URL
  errors: string[]; // import errors / blocking notes (empty = none)
  dependsOn: string[]; // other source ids this one relies on
  note: string;
}

// Import/report locations (repo-relative). Raw = input/, sanitized = generated/.
export const dataPaths = {
  rawRoot: "input/",
  sanitizedRoot: "generated/",
};

// Record counts are read from the generated artifacts (never hardcoded twice)
// so this registry stays in sync with what the import actually produced.
const CS100_COUNT = meta.count;
const KNOWLEDGE_COUNT = (topics as unknown[]).length;
const VISIT_COUNT = Object.values(meta.byVisitStatus ?? {}).reduce(
  (a, b) => a + b,
  0
);
const DISPATCH_COUNT = Object.values(meta.byDispatchStatus ?? {}).reduce(
  (a, b) => a + b,
  0
);
const CS100_IMPORTED_AT = meta.generatedAt;

export const dataSources: DataSourceInfo[] = [
  {
    id: "cs100",
    name: "CS100 個案清冊",
    kind: "Excel（個案主檔）",
    mode: "imported",
    status: "ok",
    lastImported: CS100_IMPORTED_AT,
    recordCount: CS100_COUNT,
    rawLocation: "input/CS100.xlsx",
    sanitizedLocation: "generated/cases.generated.json（maskedNationalId only）",
    importCommand: "npm run seed:cases",
    reportLink: "src/data/seed/meta.generated.json",
    errors: [],
    dependsOn: [],
    note: "原始檔含身分證號等 PII，僅於匯入時處理；瀏覽器只取得去識別化後資料。",
  },
  {
    id: "fa310",
    name: "FA310 審查資料",
    kind: "LongCare-QA-Engine（Python，Adapter）",
    mode: "adapter",
    status: "pending",
    lastImported: null,
    recordCount: null,
    rawLocation: "input/FA310/*.xlsx",
    sanitizedLocation: "generated/fa310.*.json（去識別化）",
    importCommand: "（於 LongCare-QA-Engine 匯入，Orbikt 以 Adapter 介接）",
    reportLink: null,
    errors: ["尚未匯入：FA310 原始檔尚未複製到 input/FA310/。"],
    dependsOn: ["cs100"],
    note: "FA310 個管欄位為身分證號；匯入時比對 CS100 姓名，瀏覽器僅顯示 maskedNationalId。尚未匯入。",
  },
  {
    id: "aa01",
    name: "AA01 照顧計畫引擎",
    kind: "aa01-ai-system（vendored engine）",
    mode: "engine",
    status: "seed",
    lastImported: CS100_IMPORTED_AT,
    recordCount: CS100_COUNT,
    rawLocation: "—（引擎為程式碼，非匯入檔）",
    sanitizedLocation: "src/modules/planner/engine/*",
    importCommand: "（引擎已內含；每案 aa01Status 為暫代種子）",
    reportLink: null,
    errors: [],
    dependsOn: ["cs100"],
    note: "AA01 引擎已內含（草稿模式）；每案 aa01Status 目前為種子暫代，完整編修於 Workspace。",
  },
  {
    id: "knowledge",
    name: "Knowledge 知識庫",
    kind: "practical-topics 索引",
    mode: "index",
    status: "ok",
    lastImported: null,
    recordCount: KNOWLEDGE_COUNT,
    rawLocation: "source-systems/knowledge/*",
    sanitizedLocation: "src/modules/knowledge/topics.generated.json",
    importCommand: "npm run seed:knowledge",
    reportLink: "src/modules/knowledge/topics.generated.json",
    errors: [],
    dependsOn: [],
    note: "實務主題索引已建立並保留來源引用；完整知識平台以外部連結呈現。",
  },
  {
    id: "dispatch",
    name: "Dispatch 派案",
    kind: "外部派案主控台 / API",
    mode: "external",
    status: "seed",
    lastImported: CS100_IMPORTED_AT,
    recordCount: DISPATCH_COUNT,
    rawLocation: "—（外部系統）",
    sanitizedLocation: "generated/cases.generated.json（每案 dispatch 狀態）",
    importCommand: "（外部主控台；V1 以種子暫代，API 於後續里程碑接入）",
    reportLink: null,
    errors: [],
    dependsOn: ["cs100"],
    note: "派案為外部系統，V1 每案派案狀態為種子暫代；即時 API 於外部整合里程碑接入。",
  },
  {
    id: "visit",
    name: "Visit Manager 家訪警戒",
    kind: "Google Apps Script（訪視警戒 SSOT）",
    mode: "external",
    status: "seed",
    lastImported: CS100_IMPORTED_AT,
    recordCount: VISIT_COUNT,
    rawLocation: "—（外部系統）",
    sanitizedLocation: "generated/cases.generated.json（每案 visit 狀態）",
    importCommand: "（家訪倒數 GAS；V1 以種子暫代，讀取不重算）",
    reportLink: null,
    errors: [],
    dependsOn: ["cs100"],
    note: "訪視警戒 SSOT 為家訪倒數 GAS；Orbikt 只讀取不重算。V1 每案 visit 狀態為種子暫代。",
  },
];

export function dataSourceById(id: string): DataSourceInfo | undefined {
  return dataSources.find((s) => s.id === id);
}
