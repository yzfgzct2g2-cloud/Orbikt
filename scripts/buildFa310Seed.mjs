// Build the sanitized FA310 seed from input/FA310/FA310.xls.
//
//   node scripts/buildFa310Seed.mjs   (or: npm run seed:fa310)
//
// Reads the FA310 Requests export AND the raw CS100 export (to build the
// import-time national-ID -> surrogate-case-ID map; the surrogate assignment
// replicates buildCaseSeed.mjs exactly: stable file order, C-0001…). Writes:
//   src/data/seed/fa310.generated.json       — sanitized per-case summaries
//   src/data/seed/fa310.meta.generated.json  — provenance + matching stats
//
// Raw national IDs (case + manager) exist ONLY inside this process and are
// never written out; buildFa310() hard-fails if a raw ID reaches the output.

import { writeFileSync, readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import xlsx from "xlsx";
import { extractRawId } from "./cs100Normalize.mjs";
import { buildFa310, parseManagerMapCsv } from "./fa310Normalize.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const FA310_SOURCE = "input/FA310/FA310.xls";
const MANAGER_MAP_SOURCE = "input/manager-map/manager-map.csv";
// Prefer the real raw CS100 in input/; fall back to the legacy local copy.
const CS100_SOURCE = existsSync(path.join(root, "input/CS100/CS100.xls"))
  ? "input/CS100/CS100.xls"
  : "mock-data/CS100.xlsx";

if (!existsSync(path.join(root, FA310_SOURCE))) {
  console.error(
    `FA310 匯入失敗：找不到 ${FA310_SOURCE}。請將 FA310 匯出檔放入 input/FA310/。`
  );
  process.exit(1);
}

/** Read a small text file tolerating Big5 (common for TW exports) or UTF-8. */
export function readTextAutoEncoding(absPath) {
  const buf = readFileSync(absPath);
  const utf8 = buf.toString("utf8");
  if (!utf8.includes("�")) return utf8;
  return new TextDecoder("big5").decode(buf);
}

// --- Manager roster (raw manager national ID -> manager name; import-time only)
let managerMap = new Map();
let managerMapErrors = [];
if (existsSync(path.join(root, MANAGER_MAP_SOURCE))) {
  const parsed = parseManagerMapCsv(
    readTextAutoEncoding(path.join(root, MANAGER_MAP_SOURCE))
  );
  managerMap = parsed.map;
  managerMapErrors = parsed.errors;
} else {
  console.warn(
    `警告：找不到 ${MANAGER_MAP_SOURCE} — 個管姓名將無法解析（managerSource=unresolved）。`
  );
}

// --- CS100: raw national ID -> surrogate case id (same order as buildCaseSeed)
const cwb = xlsx.readFile(path.join(root, CS100_SOURCE));
const cws = cwb.Sheets[cwb.SheetNames[0]];
const crows = xlsx.utils.sheet_to_json(cws, { header: 1, defval: "" });
const cdata = crows.slice(1).filter((r) => String(r[0]).trim() !== "");

const rawIdToCaseId = new Map();
cdata.forEach((row, i) => {
  const rawId = extractRawId(row); // transient — never persisted
  if (rawId) rawIdToCaseId.set(rawId, `C-${String(i + 1).padStart(4, "0")}`);
});

// --- FA310: normalize + match + sanitize
const fwb = xlsx.readFile(path.join(root, FA310_SOURCE));
const fws = fwb.Sheets[fwb.SheetNames[0]];
const frows = xlsx.utils.sheet_to_json(fws, { header: 1, defval: "" });
const header = frows[0];
const fdata = frows.slice(1).filter((r) => String(r[0]).trim() !== "");

const { records, meta } = buildFa310(fdata, header, rawIdToCaseId, {
  managerMap,
});

const fullMeta = {
  source: FA310_SOURCE,
  cs100Source: CS100_SOURCE,
  managerMapSource: MANAGER_MAP_SOURCE,
  managerMapEntries: managerMap.size,
  managerMapErrors,
  sheet: fwb.SheetNames[0],
  ...meta,
};

const outDir = path.join(root, "src/data/seed");
writeFileSync(
  path.join(outDir, "fa310.generated.json"),
  JSON.stringify(records, null, 2) + "\n",
  "utf8"
);
writeFileSync(
  path.join(outDir, "fa310.meta.generated.json"),
  JSON.stringify(fullMeta, null, 2) + "\n",
  "utf8"
);

console.log(
  `FA310 seed: ${records.length} records (${meta.matchedCases} matched, ` +
    `${meta.unmatchedRecords} unmatched, ${meta.distinctManagers} managers) ` +
    `→ src/data/seed/fa310.generated.json`
);
