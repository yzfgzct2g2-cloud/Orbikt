# Checkpoint CP-0004

## Type

Security hardening — National ID handling policy (owner clarification)

## Status

COMPLETE

## Policy implemented

Raw national ID may be read **transiently** during import/normalization, but
must NEVER be emitted to browser-facing data. The normalized case model stores:

- surrogate case id (`C-0001`…) — unchanged from CP-0002
- `maskedNationalId` — first char + last 4, e.g. `A*****6789`
- `idLookupHash` (optional) — salted one-way hash, only when a build-time salt
  is supplied; omitted otherwise

## Implementation

- `scripts/cs100Normalize.mjs`
  - `extractRawId(row)` — reads col 3 (身分證號), falls back to the ID embedded
    in 案號. **Transient**: the return value lives only inside `normalizeRow`.
  - `maskNationalId(raw)` → `A*****6789`.
  - `idHash(raw, salt)` — salted SHA-256 (32 hex chars); returns undefined
    without a salt (an unsalted hash of a low-entropy national ID would be
    brute-forceable, so it is simply not produced).
  - `normalizeRow` derives masked + optional hash, then lets `rawId` fall out of
    scope — it is never assigned to the record.
- `scripts/buildCaseSeed.mjs`
  - Reads optional `ORBIKT_ID_SALT` from the environment (not committed).
  - **HARD SAFETY NET**: aborts the build if any `[A-Z][0-9]{9}` pattern appears
    in the serialized seed, so raw PII can never be written to disk/committed.
  - `meta.generated.json` records `idLookupHashEnabled`.
- `src/adapters/types.ts` — `maskedNationalId?` and `idLookupHash?` on CaseRecord.
- Frontend search (`Cases.tsx`) — name / caseId / maskedNationalId / last-4
  digits only. Raw ID is never available client-side. Added a masked 身分證
  column; Workspace Overview shows the masked value too.

## Verification

- Regenerated seed: 378/378 have `maskedNationalId` (e.g. `G*****1601`); no
  `[A-Z][0-9]{9}` pattern anywhere; `idLookupHash` absent (no salt committed).
- With `ORBIKT_ID_SALT` set: `idLookupHash` is 32-hex, does not contain and
  cannot be trivially reversed to the raw id; still no raw pattern in output.
- Build/Typecheck/Tests (25)/Lint all PASS. Runtime: masked IDs render in
  Cases + Workspace, last-4 search works, no console errors.

## Notes

- Raw ID matching against company Excel is an import-time-only operation and is
  not part of the browser bundle.
- Full names remain visible (workspace needs them); this is unchanged and can be
  revisited if policy requires.
