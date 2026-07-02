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

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import xlsx from "xlsx";
import { buildCases } from "./cs100Normalize.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SEED_TODAY = "2026-07-02";
const SOURCE = "mock-data/CS100.xlsx";

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
const cases = buildCases(dataRows, team, SEED_TODAY, { idSalt });

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
  byManager: tally(cases, (c) => c.managerId),
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
