// Pure normalization logic for the CS100 case export.
//
// Deliberately dependency-free (no xlsx, no types) so it can be unit-tested and
// reused by scripts/buildCaseSeed.mjs. It takes raw sheet rows (arrays) and
// produces sanitized Case records matching src/adapters/types.ts CaseRecord.
//
// PRIVACY: the national ID (身分證號, col 3), birth date (col 4), phone (col 22)
// and street addresses (cols 21/25) are NEVER read into the output. Only the
// business case number (案號), name, coarse area, and non-identifying fields
// are kept.
//
// PROVENANCE: visit / dispatch / AA01 / FA310 values are V1 SEED STAND-INS,
// generated deterministically from the case number so the dashboard is usable
// before those systems are integrated (Visit Manager = Phase 5, Dispatch =
// Phase 6, AA01 = Phase 7, FA310 = Phase 8). They are NOT authoritative and are
// generated here in the data layer, never recomputed in the UI.

/** Fixed 0-based column indices in the CS100 sheet. */
export const CS100_COLS = {
  caseNo: 0, // 案號
  caseStatus: 1, // 案件狀態
  name: 2, // 姓名
  age: 5, // 年齡
  cms: 6, // CMS
  welfare: 8, // 福利身分
  applyDate: 13, // 申請日期
  openDate: 14, // 開案日期
  assessmentDate: 16, // 評估日期
  serviceItemCount: 17, // 服務項目數
  area: 19, // 居住地
  village: 20, // 居住地(里)
  careCenter: 26, // 照管中心
  govAssessor: 27, // 照管專員
  aUnit: 28, // A單位名稱
  premiumCare: 29, // 照顧及專業服務特別從優
  premiumTransport: 30, // 交通特別從優
  premiumDevice: 31, // 輔具特別從優
  premiumRespite: 32, // 喘息特別從優
  premiumIcf: 33, // ICF從優
  serviceCodes: 35, // 服務代碼
};

const EMPTY = new Set(["", "-", "－", "無", "否", "(空)", "N/A"]);

export function blankToNull(v) {
  const s = String(v ?? "").trim();
  return EMPTY.has(s) ? null : s;
}

/** ROC date "115/06/30" -> ISO "2026-06-30". Returns null when unparseable. */
export function rocToIso(v) {
  const s = String(v ?? "").trim();
  const m = s.match(/^(\d{2,3})[/.-](\d{1,2})[/.-](\d{1,2})$/);
  if (!m) return null;
  const year = Number(m[1]) + 1911;
  const month = String(Number(m[2])).padStart(2, "0");
  const day = String(Number(m[3])).padStart(2, "0");
  if (Number(m[2]) < 1 || Number(m[2]) > 12) return null;
  if (Number(m[3]) < 1 || Number(m[3]) > 31) return null;
  return `${year}-${month}-${day}`;
}

/** "4級" -> 4 ; "-" -> null. */
export function parseCms(v) {
  const m = String(v ?? "").match(/(\d+)/);
  if (!m) return null;
  const n = Number(m[1]);
  return n >= 1 && n <= 8 ? n : null;
}

/** "82歲" -> 82 ; else null. */
export function parseAge(v) {
  const m = String(v ?? "").match(/(\d+)/);
  return m ? Number(m[1]) : null;
}

export function parseIntOrNull(v) {
  const m = String(v ?? "").match(/(\d+)/);
  return m ? Number(m[1]) : null;
}

/** Map 案件狀態 to the Orbikt CaseStatus enum. */
export function mapCaseStatus(v) {
  const s = String(v ?? "");
  if (s.includes("結案")) return "closed";
  if (s.includes("暫停") || s.includes("停案")) return "suspended";
  if (s.includes("開案") || s.includes("服務中")) return "active";
  if (s.includes("評估") || s.includes("申請") || s.includes("派案"))
    return "pending";
  return "active";
}

export function deriveTags(row) {
  const tags = [];
  if (blankToNull(row[CS100_COLS.premiumCare])) tags.push("照顧從優");
  if (blankToNull(row[CS100_COLS.premiumTransport])) tags.push("交通從優");
  if (blankToNull(row[CS100_COLS.premiumDevice])) tags.push("輔具從優");
  if (blankToNull(row[CS100_COLS.premiumRespite])) tags.push("喘息從優");
  if (blankToNull(row[CS100_COLS.premiumIcf])) tags.push("ICF從優");
  const welfare = blankToNull(row[CS100_COLS.welfare]);
  if (welfare) tags.push(welfare);
  return tags;
}

/** Deterministic 32-bit FNV-1a hash of a string. */
export function hashString(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

function addDays(iso, days) {
  const d = new Date(iso + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

// --- V1 seed stand-ins (deterministic; replaced by real SSOT adapters) ---

export function genVisit(caseNo, seedToday) {
  const b = hashString(caseNo + "|visit") % 100;
  const n = hashString(caseNo + "|visitn");
  let status;
  let remainingDays;
  if (b < 8) {
    status = "overdue";
    remainingDays = -(5 + (n % 36));
  } else if (b < 20) {
    status = "within_30";
    remainingDays = 1 + (n % 30);
  } else if (b < 40) {
    status = "within_60";
    remainingDays = 31 + (n % 30);
  } else if (b < 47) {
    status = "scheduled";
    remainingDays = 3 + (n % 18);
  } else {
    status = "normal";
    remainingDays = 61 + (n % 110);
  }
  const nextDueDate = addDays(seedToday, remainingDays);
  const lastVisitDate =
    status === "scheduled" ? null : addDays(nextDueDate, -60);
  return { lastVisitDate, nextDueDate, remainingDays, status };
}

export function genDispatch(caseNo, seedToday) {
  const b = hashString(caseNo + "|dispatch") % 100;
  let status;
  if (b < 34) status = "accepted";
  else if (b < 54) status = "closed";
  else if (b < 68) status = "dispatching";
  else if (b < 80) status = "waiting";
  else if (b < 88) status = "no_capacity";
  else if (b < 95) status = "timeout";
  else status = "manual_required";
  const daysAgo = hashString(caseNo + "|dd") % 14;
  const updatedAt = `${addDays(seedToday, -daysAgo)}T09:00:00+08:00`;
  return { status, updatedAt };
}

export function genModuleStatus(caseNo, kind) {
  const b = hashString(caseNo + "|" + kind) % 100;
  if (kind === "aa01") {
    if (b < 40) return "approved";
    if (b < 60) return "submitted";
    if (b < 75) return "in_progress";
    if (b < 88) return "draft";
    if (b < 96) return "not_started";
    return "returned";
  }
  // fa310
  if (b < 30) return "approved";
  if (b < 50) return "submitted";
  if (b < 68) return "in_progress";
  if (b < 82) return "not_started";
  if (b < 92) return "draft";
  return "returned";
}

/**
 * Normalize a single raw row into a Case record (without manager or public id).
 *
 * The raw 案號 is used ONLY as an internal hash key (`srcKey`) — it is never
 * placed in the output, because for many rows it embeds the national ID
 * (format "CSMS-P<national-id><suffix>"). buildCases() assigns a surrogate id.
 */
export function normalizeRow(row, seedToday) {
  const caseNo = String(row[CS100_COLS.caseNo] ?? "").trim();
  if (!caseNo) return null;
  const visit = genVisit(caseNo, seedToday);
  const dispatch = genDispatch(caseNo, seedToday);
  return {
    srcKey: caseNo, // internal only; stripped by buildCases
    name: String(row[CS100_COLS.name] ?? "").trim() || "(未命名)",
    managerId: "", // assigned later from team.json quotas
    cmsLevel: parseCms(row[CS100_COLS.cms]),
    status: mapCaseStatus(row[CS100_COLS.caseStatus]),
    visit,
    dispatch,
    aa01Status: genModuleStatus(caseNo, "aa01"),
    fa310Status: genModuleStatus(caseNo, "fa310"),
    tags: deriveTags(row),
    updatedAt: dispatch.updatedAt,
    age: parseAge(row[CS100_COLS.age]),
    welfare: blankToNull(row[CS100_COLS.welfare]) ?? undefined,
    area: blankToNull(row[CS100_COLS.area]) ?? undefined,
    village: blankToNull(row[CS100_COLS.village]) ?? undefined,
    openDate: rocToIso(row[CS100_COLS.openDate]),
    assessmentDate: rocToIso(row[CS100_COLS.assessmentDate]),
    serviceItemCount: parseIntOrNull(row[CS100_COLS.serviceItemCount]),
    careCenter: blankToNull(row[CS100_COLS.careCenter]) ?? undefined,
    govAssessor: blankToNull(row[CS100_COLS.govAssessor]) ?? undefined,
    aUnit: blankToNull(row[CS100_COLS.aUnit]) ?? undefined,
    serviceCodes: blankToNull(row[CS100_COLS.serviceCodes]) ?? undefined,
  };
}

/**
 * Assign managers from team.json. Cases are distributed across managers to fill
 * each manager's caseload quota (team.json remains the caseload SSOT). If the
 * quotas do not cover all cases, the remainder cycles through the team.
 */
export function assignManagers(cases, team) {
  const queue = [];
  for (const m of team) {
    for (let i = 0; i < m.caseload; i++) queue.push(m.id);
  }
  return cases.map((c, i) => ({
    ...c,
    managerId: queue[i] ?? team[i % team.length]?.id ?? "unassigned",
  }));
}

/**
 * Assign a non-PII surrogate id ("C-0001", …) by stable file order and strip
 * the internal `srcKey`. This guarantees no national ID (which some raw 案號
 * embed) can reach the output.
 */
export function assignSurrogateIds(cases) {
  return cases.map((c, i) => {
    const rest = { ...c };
    delete rest.srcKey;
    return { id: `C-${String(i + 1).padStart(4, "0")}`, ...rest };
  });
}

/** Full pipeline: raw data rows (no header) -> sanitized, manager-assigned cases. */
export function buildCases(dataRows, team, seedToday) {
  const normalized = dataRows
    .map((r) => normalizeRow(r, seedToday))
    .filter((c) => c !== null);
  return assignManagers(assignSurrogateIds(normalized), team);
}
