# Checkpoint CP-0026

## Milestone

Milestone 6 — External Integration (P3) → **partially unblocked**: FA310 +
CS100 file integrations COMPLETED, including full responsible-manager
resolution via the manager roster (governance data rule). Remaining
integrations still Blocked (credentials). Release v1.6.0.

## Session note

This checkpoint spans two sessions: the FA310 import pipeline was built first
(session A, uncommitted), then the governance data-rule correction arrived
(FA310 column S primary + input/manager-map/manager-map.csv) and was folded
into the same release before the first commit — no intermediate contract
(anonymous FA-M* groups) was ever committed; the shipped contract is
managerName / maskedManagerId / managerSource only.

## What shipped

1. **FA310 import pipeline** (`fa310Normalize.mjs` + `buildFa310Seed.mjs`,
   `npm run seed:fa310`): input/FA310/FA310.xls (Requests) → sanitized
   `src/data/seed/fa310.generated.json` + meta. Import-time matching: case
   national ID → CS100 surrogate case ID. Hard privacy guard aborts on any
   raw-ID leak. **390 records / 375 matched / 15 unmatched (reported).**
2. **Manager resolution (governance data rule)**: FA310 column S
   (主責個管員身分證) × `input/manager-map/manager-map.csv` (Big5-aware,
   quoted-CSV parse) → managerName. `buildCaseSeed` applies FA310-PRIMARY
   assignment: **375/378 cases managerSource="fa310"**, 3 fallback. Browser
   contract: managerName / maskedManagerId / managerSource only.
   `config/team.json` names updated to roster full names（房立泓 45・江睿儀
   92・簡淑儀 95・游靜怡 90・王郁琪 53 real caseloads）.
3. **CS100 real source**: buildCaseSeed prefers `input/CS100/CS100.xls`;
   seed regenerated from the real export (378 cases, deterministic).
4. **Data Center**: FA310 已匯入 (real counts, report, unmatched warning);
   matching = FA310-primary with real per-name stats; validation adds FA310
   raw-ID scan + match-rate check; pending sources now 0.
5. **Workspace**: FA310 tab shows real service record + 主責個管員 (FA310);
   Overview 個管員 field shows source label (FA310/暫代). Banner↔FA310-tab
   manager consistency browser-verified (C-0010 → 江睿儀 both paths).
   QA-engine review seam untouched.
6. **Automation registry** manager-matching entry updated to the real pipeline.
7. **Tests**: fa310Normalize (10) + fa310Data contract (7) + adapter/dataCenter
   updates → **120 total**.

## Security event (reported)

`mock-data/CS100.xlsx` — committed since early history — was found to contain
REAL PII (378 valid-format national IDs + phone numbers; 100% ID overlap with
input/CS100/CS100.xls). Actions taken automatically:
- `input/` and `mock-data/` added to .gitignore.
- `git rm --cached mock-data/CS100.xlsx` (file preserved on disk, removed from
  index → absent from all future commits).
- Imports repointed to input/.

**Requires user decision:** the file remains in git HISTORY (local + GitHub).
Purging requires a history rewrite (git filter-repo / BFG) + force-push, which
rewrites the canonical history — not done without explicit authorization. If
the GitHub repo is private, exposure is limited to collaborators; if public,
treat as an active leak and rotate/purge urgently.

## Verification

- typecheck PASS · lint PASS · tests PASS (117) · build PASS.
- Browser (DOM): Data Center shows FA310 已匯入/390/375/15/5 groups, 待匯入 0,
  new validation checks pass; FA310 tab shows real record (2026-06-30,
  電訪＋家訪, FA-M1); no console errors; no raw ID/phone in DOM.
- Generated files PII-scanned clean (rawId=false, phone=false).

## Acceptance (ACCEPTANCE ▸ Data Center — FA310 items)

FA310 imports successfully ✓ · matching completes with understandable
unmatched reporting ✓ · generated data has no raw IDs ✓ · import report/log
recorded ✓ · browser never reads raw Excel ✓.

## Push queue

Auth still intermittent. Queued after this release: v1.3.0…v1.6.0 commits +
tags. Retry: `git push origin main v1.3.0 v1.4.0 v1.5.0 v1.6.0`.

## Next

Remaining M6 integrations still Blocked (credentials per docs/ADAPTERS.md):
Visit GAS JSON mode, Dispatch API, Supabase, Graph, Calendar, LINE, real auth.
Manager roster: RESOLVED this checkpoint (manager-map.csv provided and applied).
