# Release Review — v1.6.0 (FA310 Import + FA310-Primary Manager Resolution)

## Scope

Milestone 6 (External Integration) partial completion: the two file-based
integrations that required no external credentials — FA310 service records and
the real CS100 raw source — plus the governance data-rule correction applied
mid-release: FA310 column S × manager roster = PRIMARY responsible-manager
source.

## Acceptance evaluation

ACCEPTANCE ▸ Data Center (FA310 items):

| Criterion | Result |
| --- | --- |
| FA310 imports successfully | ✓ 390 records from input/FA310/FA310.xls |
| Matching FA310↔CS100 completes | ✓ 375/390 matched; 15 unmatched reported with masked ids |
| Import report / history / log | ✓ fa310.meta.generated.json + Data Center surfaces |
| Generated data: no raw national ID / phone | ✓ import-time hard guard + unit tests + live DOM scan |
| Manager matching rule (FA310 primary, CS100 secondary) | ✓ 375/378 cases managerSource="fa310"; 3 fallback labelled |
| Import failures understandable | ✓ column-resolution errors, roster row errors, unmatched lists |

Governance data rule (this release's correction):

| Rule | Result |
| --- | --- |
| FA310 column S = manager national ID | ✓ resolved by header name（主責個管員身分證, index 18 = S） |
| manager-map.csv maps ID → name | ✓ 5/5 roster entries resolve; unmappedManagerIds = [] |
| FA310 primary; CS100 not primary unless FA310 absent | ✓ fallback only for the 3 cases without FA310 records |
| Raw manager ID import-time only | ✓ roster gitignored (input/); no raw ID in generated/browser |
| Browser exposes only managerName/maskedManagerId/managerSource | ✓ contract enforced by types + tests (managerGroup removed) |

## Evidence

- typecheck / lint / tests (120) / build PASS.
- Regeneration: 378 cases (input CS100), 390 FA310 records; managerAssignment
  {fa310: 375, fallback: 3}; byManagerName 簡淑儀95/江睿儀92/游靜怡90/王郁琪53/
  房立泓45 (closely tracks team.json quotas — cross-validation).
- Browser (DOM): Data Center matching shows real names + 375 assignment; case
  C-0010 banner and FA310 tab agree（江睿儀）; no console errors; no raw
  ID/phone patterns in DOM or generated files.

## Security (carried from this checkpoint)

- `input/` and `mock-data/` gitignored; `mock-data/CS100.xlsx` (real PII)
  untracked from the index. ⚠ REMAINS IN GIT HISTORY — purge requires
  user-authorized history rewrite + force-push; decide separately.

## Blueprint / Product Memory

- Data Center architecture followed (raw → import → normalize → validate →
  match → sanitize → generate → DataAdapter → UI).
- FA310 review rules untouched (LongCare-QA-Engine seam preserved).
- Visit Manager SSOT untouched.

## Deferred (recorded)

- Remaining M6 live integrations (credentials — docs/ADAPTERS.md).
- Case module statuses (aa01Status/fa310Status/visit/dispatch on CaseRecord)
  remain deterministic stand-ins pending their live sources.
- PII history purge — awaiting user authorization.

## Verdict

**Acceptance PASS** for the FA310/CS100 integration scope. Release v1.6.0.
