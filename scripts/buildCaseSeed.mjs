// Build the V1 case seed from mock-data/CS100.xlsx.
//
//   node scripts/buildCaseSeed.mjs   (or: npm run seed:cases)
//
// Reads the CS100 export, normalizes + sanitizes it (see cs100Normalize.mjs),
// assigns managers by team.json caseload quotas, and writes:
//   src/data/seed/cases.generated.json   — sanitized Case records (bundled)
//   src/data/seed/meta.generated.json    — provenance + distribution stats
//
// The raw xlsx (which contains PII) is NEVER shipped to the browser; only the
// sanitized JSON is imported by the adapter.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import xlsx from "xlsx";
import { buildCases } from "./cs100Normalize.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SEED_TODAY = "2026-07-02";
// Prefer the real raw export in input/ (gitignored, never committed); fall
// back to the legacy local copy for environments without input data.
const SOURCE = existsSync(path.join(root, "input/CS100/CS100.xls"))
  ? "input/CS100/CS100.xls"
  : "mock-data/CS100.xlsx";

const wb = xlsx.readFile(path.join(root, SOURCE));
const sheetName = wb.SheetNames[0];
const ws = wb.Sheets[sheetName];
const rows = xlsx.utils.sheet_to_json(ws, { header: 1, defval: "" });
const dataRows = rows.slice(1).filter((r) => String(r[0]).trim() !== "");

const team = JSON.parse(
  readFileSync(path.join(root, "config/team.json"), "utf8")
);

// Optional secret salt for the idLookupHash (matching against company records).
// Not committed; when absent the hash is omitted entirely.
const idSalt = process.env.ORBIKT_ID_SALT || "";
let cases = buildCases(dataRows, team, SEED_TODAY, { idSalt });

// --- FA310-primary responsible manager (governance data rule) -----------------
// When the FA310 export + manager roster are available, resolve each case's
// real responsible manager (FA310 column S -> roster name -> team.json id).
// Raw IDs are transient; cases get managerSource "fa310" or "fallback".
const FA310_SOURCE = path.join(root, "input/FA310/FA310.xls");
const MANAGER_MAP_SOURCE = path.join(root, "input/manager-map/manager-map.csv");
let managerAssignment = { fa310: 0, fallback: cases.length };
if (existsSync(FA310_SOURCE) && existsSync(MANAGER_MAP_SOURCE)) {
  const { parseManagerMapCsv, buildCaseManagerNames } = await import(
    "./fa310Normalize.mjs"
  );
  const { extractRawId } = await import("./cs100Normalize.mjs");
  const buf = readFileSync(MANAGER_MAP_SOURCE);
  const text = buf.toString("utf8").includes("�")
    ? new TextDecoder("big5").decode(buf)
    : buf.toString("utf8");
  const { map: managerMap } = parseManagerMapCsv(text);

  const fwb = xlsx.readFile(FA310_SOURCE);
  const fws = fwb.Sheets[fwb.SheetNames[0]];
  const frows = xlsx.utils.sheet_to_json(fws, { header: 1, defval: "" });
  const fdata = frows.slice(1).filter((r) => String(r[0]).trim() !== "");
  // raw CASE id -> managerName (transient)
  const nameByRawId = buildCaseManagerNames(fdata, frows[0], managerMap);
  // surrogate case id -> managerName (same row order as buildCases)
  const nameByCaseId = new Map();
  dataRows.forEach((row, i) => {
    const rawId = extractRawId(row);
    const name = rawId ? nameByRawId.get(rawId) : undefined;
    if (name) nameByCaseId.set(`C-${String(i + 1).padStart(4, "0")}`, name);
  });
  const { applyFa310Managers } = await import("./cs100Normalize.mjs");
  cases = applyFa310Managers(cases, team, nameByCaseId);
  managerAssignment = {
    fa310: cases.filter((c) => c.managerSource === "fa310").length,
    fallback: cases.filter((c) => c.managerSource === "fallback").length,
  };
} else {
  cases = cases.map((c) => ({ ...c, managerSource: "fallback" }));
}

function tally(list, key) {
  return list.reduce((acc, item) => {
    const k = key(item);
    acc[k] = (acc[k] ?? 0) + 1;
    return acc;
  }, {});
}

const meta = {
  source: SOURCE,
  sheet: sheetName,
  generatedAt: new Date().toISOString(),
  seedToday: SEED_TODAY,
  count: cases.length,
  note:
    "Sanitized V1 seed. Raw national ID is read transiently at import and NEVER " +
    "emitted — only maskedNationalId (first char + last 4). Birth date / phone / " +
    "street address omitted. visit / dispatch / aa01 / fa310 are deterministic " +
    "seed stand-ins replaced by their SSOT adapters in Phases 5-8.",
  idLookupHashEnabled: Boolean(idSalt),
  managerAssignment,
  byManager: tally(cases, (c) => c.managerId),
  byManagerSource: tally(cases, (c) => c.managerSource ?? "fallback"),
  byCaseStatus: tally(cases, (c) => c.status),
  byVisitStatus: tally(cases, (c) => c.visit.status),
  byDispatchStatus: tally(cases, (c) => c.dispatch.status),
};

const serialized = JSON.stringify(cases, null, 2);

// HARD SAFETY NET: a raw national ID (letter + 9 digits) must never reach the
// emitted seed. If one does, abort the build rather than write PII to disk.
const leak = serialized.match(/[A-Z][0-9]{9}/);
if (leak) {
  throw new Error(
    `Raw national ID pattern "${leak[0].slice(0, 1)}********" detected in seed ` +
      `output — aborting to avoid writing PII.`
  );
}

const outDir = path.join(root, "src/data/seed");
mkdirSync(outDir, { recursive: true });
writeFileSync(path.join(outDir, "cases.generated.json"), serialized + "\n", "utf8");
writeFileSync(
  path.join(outDir, "meta.generated.json"),
  JSON.stringify(meta, null, 2) + "\n",
  "utf8"
);

console.log(`Seed built: ${cases.length} cases from ${SOURCE}`);
console.log("By manager:", meta.byManager);
console.log("By visit status:", meta.byVisitStatus);
console.log("By dispatch status:", meta.byDispatchStatus);
