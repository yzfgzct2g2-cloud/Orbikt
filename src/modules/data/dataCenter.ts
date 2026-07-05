// Data Center derivations.
//
// Everything here is derived from the GENERATED (browser-safe) artifacts —
// meta.generated.json, cases.generated.json, topics.generated.json — and the
// source registry (dataSources.ts). No raw file is ever read. Each derivation
// is explainable and traceable back to a generated artifact so the Data Center
// can present real evidence, never fabricated "live" status.

import meta from "../../data/seed/meta.generated.json";
import seed from "../../data/seed/cases.generated.json";
import { dataSources, type DataSourceStatus } from "./dataSources";

// --- Data health summary -----------------------------------------------------

export interface DataHealthSummary {
  total: number;
  byStatus: Record<DataSourceStatus, number>;
  totalRecords: number;
  hasErrors: boolean;
}

export function dataHealthSummary(): DataHealthSummary {
  const byStatus: Record<DataSourceStatus, number> = {
    ok: 0,
    pending: 0,
    seed: 0,
    stale: 0,
    missing: 0,
  };
  let totalRecords = 0;
  let hasErrors = false;
  for (const s of dataSources) {
    byStatus[s.status] += 1;
    totalRecords += s.recordCount ?? 0;
    if (s.errors.length > 0) hasErrors = true;
  }
  return { total: dataSources.length, byStatus, totalRecords, hasErrors };
}

// --- Import report (latest CS100 generation) ---------------------------------

export interface ImportReportRow {
  label: string;
  value: string;
}

export interface ImportReport {
  source: string;
  sheet: string;
  generatedAt: string;
  count: number;
  breakdown: {
    byManager: ImportReportRow[];
    byCaseStatus: ImportReportRow[];
    byVisitStatus: ImportReportRow[];
    byDispatchStatus: ImportReportRow[];
  };
  note: string;
}

function toRows(obj: Record<string, number> | undefined): ImportReportRow[] {
  if (!obj) return [];
  return Object.entries(obj)
    .sort((a, b) => b[1] - a[1])
    .map(([label, value]) => ({ label, value: String(value) }));
}

export function importReport(): ImportReport {
  return {
    source: meta.source,
    sheet: meta.sheet,
    generatedAt: meta.generatedAt,
    count: meta.count,
    breakdown: {
      byManager: toRows(meta.byManager),
      byCaseStatus: toRows(meta.byCaseStatus),
      byVisitStatus: toRows(meta.byVisitStatus),
      byDispatchStatus: toRows(meta.byDispatchStatus),
    },
    note: meta.note,
  };
}

// --- Import history + log -----------------------------------------------------

export type ImportResult = "success" | "pending" | "skipped";

export interface ImportHistoryEntry {
  id: string;
  source: string;
  at: string | null; // ISO datetime, null if never run
  count: number | null;
  result: ImportResult;
  command: string;
  note: string;
}

export function importHistory(): ImportHistoryEntry[] {
  // History is derived from the source registry — one entry per source, with
  // the real generatedAt/recordCount when available.
  return dataSources.map((s) => ({
    id: `imp-${s.id}`,
    source: s.name,
    at: s.lastImported,
    count: s.recordCount,
    result:
      s.status === "pending"
        ? "pending"
        : s.lastImported
          ? "success"
          : "skipped",
    command: s.importCommand,
    note: s.errors[0] ?? s.note,
  }));
}

export type LogLevel = "info" | "warn" | "error";

export interface ImportLogLine {
  id: string;
  at: string | null;
  level: LogLevel;
  source: string;
  message: string;
}

export function importLog(): ImportLogLine[] {
  const lines: ImportLogLine[] = [];
  for (const s of dataSources) {
    if (s.errors.length > 0) {
      for (const [i, e] of s.errors.entries()) {
        lines.push({
          id: `log-${s.id}-err-${i}`,
          at: s.lastImported,
          level: "warn",
          source: s.name,
          message: e,
        });
      }
    } else if (s.lastImported) {
      lines.push({
        id: `log-${s.id}-ok`,
        at: s.lastImported,
        level: "info",
        source: s.name,
        message: `匯入完成，共 ${s.recordCount ?? 0} 筆。`,
      });
    } else {
      lines.push({
        id: `log-${s.id}-idle`,
        at: null,
        level: "info",
        source: s.name,
        message: "尚未執行匯入。",
      });
    }
  }
  // Newest first; null timestamps sink to the bottom.
  return lines.sort((a, b) => {
    if (a.at === b.at) return 0;
    if (!a.at) return 1;
    if (!b.at) return -1;
    return a.at < b.at ? 1 : -1;
  });
}

// --- Validation results (privacy + integrity, real evidence) -----------------

export type ValidationStatus = "pass" | "warn" | "fail";

export interface ValidationCheck {
  id: string;
  label: string;
  status: ValidationStatus;
  detail: string;
}

// Raw Taiwan national ID pattern: 1 letter + 9 digits. Must NEVER appear in the
// browser-facing seed. Scanned live so the check is evidence, not a claim.
const RAW_NATIONAL_ID = /[A-Z][12]\d{8}/;
// Loose phone / birth-date patterns that also must not appear.
const RAW_PHONE = /09\d{8}/;

function scanSeed(pattern: RegExp): boolean {
  return pattern.test(JSON.stringify(seed));
}

export function validationResults(): ValidationCheck[] {
  const count = (seed as unknown[]).length;
  const noRawId = !scanSeed(RAW_NATIONAL_ID);
  const noPhone = !scanSeed(RAW_PHONE);
  const countMatches = count === meta.count;
  const maskedOk = (seed as { maskedNationalId?: string | null }[]).every(
    (c) => c.maskedNationalId == null || /\*{2,}/.test(c.maskedNationalId)
  );

  return [
    {
      id: "v-count",
      label: "筆數一致",
      status: countMatches ? "pass" : "warn",
      detail: countMatches
        ? `種子 ${count} 筆與匯入報告 ${meta.count} 筆一致。`
        : `種子 ${count} 筆與匯入報告 ${meta.count} 筆不一致，請重新匯入。`,
    },
    {
      id: "v-raw-id",
      label: "無原始身分證號",
      status: noRawId ? "pass" : "fail",
      detail: noRawId
        ? "瀏覽器資料未發現原始身分證號格式（英文字母＋9 碼數字）。"
        : "偵測到原始身分證號格式，違反隱私規則，匯入需修正。",
    },
    {
      id: "v-phone",
      label: "無原始電話",
      status: noPhone ? "pass" : "fail",
      detail: noPhone
        ? "瀏覽器資料未發現手機號碼格式（09xxxxxxxx）。"
        : "偵測到手機號碼格式，違反隱私規則。",
    },
    {
      id: "v-masked",
      label: "maskedNationalId 格式",
      status: maskedOk ? "pass" : "warn",
      detail: maskedOk
        ? "身分識別僅以遮罩後的 maskedNationalId 呈現。"
        : "部分 maskedNationalId 未遮罩，請檢查匯入腳本。",
    },
  ];
}

// --- Matching result (FA310 ↔ CS100 manager assignment) ----------------------

export interface MatchingResult {
  status: "matched" | "staged" | "unavailable";
  primary: string;
  secondary: string;
  assignedCases: number;
  managerCount: number;
  detail: string;
}

export function matchingResult(): MatchingResult {
  const fa310 = dataSources.find((s) => s.id === "fa310");
  const managerCount = Object.keys(meta.byManager ?? {}).length;
  const assignedCases = Object.values(meta.byManager ?? {}).reduce(
    (a, b) => a + b,
    0
  );
  // Rule: manager PRIMARILY from FA310 when available; CS100 secondary. FA310 is
  // pending, so current assignment is staged on CS100 until FA310 is imported.
  const fa310Ready = fa310 != null && fa310.status !== "pending";
  return {
    status: fa310Ready ? "matched" : "staged",
    primary: "FA310（個管身分證號 → 個案 → 姓名）",
    secondary: "CS100（個管姓名）",
    assignedCases,
    managerCount,
    detail: fa310Ready
      ? `已依 FA310 為主、CS100 為輔完成比對，涵蓋 ${assignedCases} 案 / ${managerCount} 位個管。`
      : `FA310 尚未匯入，目前以 CS100 為個管來源（${assignedCases} 案 / ${managerCount} 位個管）；FA310 匯入後將以其為主重新比對。原始身分證號僅於匯入時使用，瀏覽器僅顯示 maskedNationalId。`,
  };
}

// --- Source-level abnormalities (for the Data Center) ------------------------

export interface SourceIssue {
  id: string;
  source: string;
  severity: "high" | "medium" | "low";
  message: string;
}

export function sourceIssues(): SourceIssue[] {
  const out: SourceIssue[] = [];
  for (const s of dataSources) {
    if (s.status === "missing") {
      out.push({
        id: `iss-${s.id}`,
        source: s.name,
        severity: "high",
        message: "來源資料缺漏，尚無可用資料。",
      });
    } else if (s.status === "stale") {
      out.push({
        id: `iss-${s.id}`,
        source: s.name,
        severity: "medium",
        message: "資料可能過期，建議重新匯入。",
      });
    } else if (s.status === "pending") {
      out.push({
        id: `iss-${s.id}`,
        source: s.name,
        severity: "low",
        message: s.errors[0] ?? "尚未匯入，部分功能待啟用。",
      });
    } else if (s.status === "seed") {
      out.push({
        id: `iss-${s.id}`,
        source: s.name,
        severity: "low",
        message: "使用暫代種子資料，尚未連接即時來源。",
      });
    }
  }
  const rank = { high: 0, medium: 1, low: 2 } as const;
  return out.sort((a, b) => rank[a.severity] - rank[b.severity]);
}
