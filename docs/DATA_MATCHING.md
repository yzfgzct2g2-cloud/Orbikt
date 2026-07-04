# FA310 ↔ CS100 case-manager matching rule

## Goal

When both **FA310** and **CS100** are available, determine the responsible case
manager for a case correctly and safely.

## Sources

| Source | Manager field contains | Role |
|---|---|---|
| **FA310** (LongCare-QA-Engine) | **national ID** | **primary** — responsible manager |
| **CS100** (個案清冊) | manager **name** | secondary reference |

## Rule

1. The responsible case manager is determined **primarily from FA310**.
2. **CS100 is a secondary reference** (name map) used when FA310 does not
   resolve a manager.
3. FA310's manager field is a **national ID**. To turn it into a manager we:
   - match the raw national ID → case (via the raw ID → caseId map built from
     the raw CS100 file **at import time**),
   - take the manager name (FA310 primary; CS100 name map fallback),
   - resolve the manager id from `config/team.json`.

## Privacy (non-negotiable)

- The **raw national ID may exist ONLY during import-time processing.**
- After matching, the raw ID is **discarded**; it is never written to the seed
  JSON, adapter output, logs, timeline, UI, or tests.
- **Browser-facing data exposes only `maskedNationalId`** (e.g. `A*****6789`).
- Optional salted `idLookupHash` (build-time salt only) may be used for
  import-time matching; it is omitted from the browser bundle by default.

## Implementation

- Import-time resolver: `resolveManagerAtImport(rawNationalId, rawIdToCaseId,
  caseIdToManagerName, fa310IdToManagerName?)` in
  `src/modules/data/caseManagerMatch.ts` — pure, raw ID passed in and never
  returned; caller must discard it.
- Browser-safe view: `caseManagerView(case)` — reads the already-assigned
  `managerId` on the sanitized case record and resolves the display name from
  `team.json`; exposes only `maskedNationalId`.
- V1 seed: `scripts/buildCaseSeed.mjs` assigns managers by team.json caseload
  quotas today; when FA310 is imported, the resolver above takes over as the
  primary source. See `docs/SOURCE_SYSTEMS.md` and Settings ▸ Data Sources.

## Status

FA310 import is **pending** (see Settings ▸ Data Sources). Until FA310 is
imported, managers come from the CS100-derived assignment; the matching seam is
in place for when FA310 data lands.
