// Pure normalization logic for the FA310 service-record export (Requests sheet).
//
// Dependency-free (no xlsx) so it can be unit-tested and reused by
// scripts/buildFa310Seed.mjs. Takes raw sheet rows (arrays) and produces
// SANITIZED per-case FA310 summaries.
//
// PRIVACY: the case national ID (身分證字號) and the manager national ID
// (主責個管員身分證) are RAW PII — they are used transiently for matching and
// grouping, then discarded. Output contains only the surrogate caseId, the
// masked case ID, a masked manager ID, and an anonymous manager group key.
// A hard guard (assertNoRawIds) refuses to emit output containing a raw ID.
//
// SCOPE: this is Orbikt's DATA import (record counts, dates, visit types,
// manager grouping). FA310 REVIEW rules stay in LongCare-QA-Engine — none are
// implemented here (see DECISIONS.md / Product Memory).

import { maskNationalId } from "./cs100Normalize.mjs";

/** Resolve column indices from the header row by name prefix (robust to reorder). */
export function resolveFa310Cols(headerRow) {
  const col = (prefix) =>
    headerRow.findIndex((h) => String(h ?? "").startsWith(prefix));
  const cols = {
    caseRawId: col("身分證字號"),
    serviceDate: col("服務日期"),
    phoneVisit: col("服務項目-電訪"),
    homeVisit: col("服務項目-家訪"),
    managerRawId: col("主責個管員身分證"),
    tracking: col("追蹤服務適應與介入情形"),
    goals: col("各項服務目標及整體計畫目標達成情形"),
  };
  const missing = Object.entries(cols)
    .filter(([, i]) => i < 0)
    .map(([k]) => k);
  if (missing.length > 0) {
    throw new Error(
      `FA310 匯入失敗：找不到必要欄位 ${missing.join("、")}。請確認來源檔為 FA310 Requests 匯出格式。`
    );
  }
  return cols;
}

/** ROC compact date "1150630" -> ISO "2026-06-30". Returns null when unparseable. */
export function rocCompactToIso(v) {
  const s = String(v ?? "").trim();
  const m = s.match(/^(\d{3})(\d{2})(\d{2})$/);
  if (!m) return null;
  const year = Number(m[1]) + 1911;
  const month = Number(m[2]);
  const day = Number(m[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/** FA310 checkbox: "V" (any case, trimmed) = true. */
export function parseFlag(v) {
  return String(v ?? "").trim().toUpperCase() === "V";
}

const RAW_ID = /^[A-Z][0-9]{9}$/;

function readRawId(v) {
  const s = String(v ?? "").trim().toUpperCase();
  return RAW_ID.test(s) ? s : null;
}

/**
 * Parse the manager roster CSV ("managerNationalId","managerName") into a
 * rawId -> managerName Map. The raw IDs exist only inside the returned Map,
 * which callers must use transiently at import time. Malformed rows are
 * collected so the import report can explain them.
 */
export function parseManagerMapCsv(text) {
  const lines = String(text ?? "")
    .trim()
    .split(/\r?\n/);
  const unquote = (f) => String(f ?? "").trim().replace(/^"|"$/g, "").trim();
  const map = new Map();
  const errors = [];
  for (const [i, line] of lines.entries()) {
    if (i === 0 && /managerNationalId/i.test(line)) continue; // header
    if (!line.trim()) continue;
    const parts = line.split(",").map(unquote);
    const [id, name] = parts;
    if (!RAW_ID.test(String(id ?? "").toUpperCase()) || !name) {
      errors.push(`第 ${i + 1} 行格式不正確（需 managerNationalId,managerName）`);
      continue;
    }
    map.set(id.toUpperCase(), name);
  }
  return { map, errors };
}

/**
 * Build the per-case manager assignment from FA310 (import-time, transient):
 * raw CASE national ID -> managerName (via 主責個管員身分證 + roster). Used by
 * buildCaseSeed so the case list carries the FA310-primary responsible
 * manager. Raw IDs never leave the returned Map's keys (caller discards).
 */
export function buildCaseManagerNames(dataRows, headerRow, managerMap) {
  const cols = resolveFa310Cols(headerRow);
  const out = new Map();
  for (const row of dataRows) {
    const rawCaseId = readRawId(row[cols.caseRawId]);
    const rawMgrId = readRawId(row[cols.managerRawId]);
    if (!rawCaseId || !rawMgrId) continue;
    const name = managerMap.get(rawMgrId);
    if (name) out.set(rawCaseId, name);
  }
  return out;
}

/**
 * Full pipeline: FA310 data rows (no header) + rawId->surrogate case map +
 * manager roster -> { records, meta }. Records are per-case sanitized
 * summaries; meta carries matching statistics for the import report.
 *
 * DATA RULE (governance): browser/generated data may expose ONLY managerName,
 * maskedManagerId, and managerSource for the responsible manager. No raw ID
 * appears anywhere in the output (hard-guarded).
 */
export function buildFa310(dataRows, headerRow, rawIdToCaseId, opts = {}) {
  const cols = resolveFa310Cols(headerRow);
  const generatedAt = opts.generatedAt ?? new Date().toISOString();
  const managerMap = opts.managerMap ?? new Map();

  const records = [];
  const unmatchedMasked = [];
  const unmappedManagerMasked = new Set();
  let invalidRows = 0;

  for (const row of dataRows) {
    const rawCaseId = readRawId(row[cols.caseRawId]);
    if (!rawCaseId) {
      invalidRows += 1;
      continue;
    }
    const caseId = rawIdToCaseId.get(rawCaseId) ?? null;
    const rawMgrId = readRawId(row[cols.managerRawId]);
    const managerName = rawMgrId ? (managerMap.get(rawMgrId) ?? null) : null;
    if (rawMgrId && !managerName)
      unmappedManagerMasked.add(maskNationalId(rawMgrId));
    const record = {
      caseId,
      maskedNationalId: maskNationalId(rawCaseId),
      serviceDate: rocCompactToIso(row[cols.serviceDate]),
      phoneVisit: parseFlag(row[cols.phoneVisit]),
      homeVisit: parseFlag(row[cols.homeVisit]),
      managerName,
      maskedManagerId: rawMgrId ? maskNationalId(rawMgrId) : null,
      managerSource: managerName ? "fa310" : "unresolved",
      hasTracking: String(row[cols.tracking] ?? "").trim() !== "",
      hasGoals: String(row[cols.goals] ?? "").trim() !== "",
    };
    if (caseId === null) unmatchedMasked.push(record.maskedNationalId);
    records.push(record);
  }

  const matched = records.filter((r) => r.caseId !== null);
  const byManagerName = {};
  for (const r of matched) {
    if (r.managerName)
      byManagerName[r.managerName] = (byManagerName[r.managerName] ?? 0) + 1;
  }

  const meta = {
    generatedAt,
    totalRows: dataRows.length,
    invalidRows,
    records: records.length,
    matchedCases: matched.length,
    unmatchedRecords: unmatchedMasked.length,
    unmatchedMaskedIds: unmatchedMasked,
    distinctManagers: Object.keys(byManagerName).length,
    byManagerName,
    unmappedManagerIds: [...unmappedManagerMasked],
    note:
      "Sanitized FA310 import. Raw case/manager national IDs are read transiently for matching (FA310 column S ↔ input/manager-map/manager-map.csv) and NEVER emitted — output carries only surrogate caseId, masked IDs, managerName, and managerSource. FA310 is the PRIMARY responsible-manager source. FA310 REVIEW rules remain in LongCare-QA-Engine.",
  };

  assertNoRawIds({ records, meta });
  return { records, meta };
}

/** Hard privacy guard: refuse any output containing a raw national ID pattern. */
export function assertNoRawIds(output) {
  const flat = JSON.stringify(output);
  if (/[A-Z][12]\d{8}/.test(flat)) {
    throw new Error(
      "FA310 匯入中止：輸出偵測到原始身分證號格式，違反隱私規則（不寫出任何檔案）。"
    );
  }
}
