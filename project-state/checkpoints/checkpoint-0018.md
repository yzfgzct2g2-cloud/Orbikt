# Checkpoint CP-0018

## Sprint

V1.0.3 Acceptance Correction Sprint

## Status

V1_0_3_STABLE (tagged v1.0.3)

## Items fixed (acceptance review)

1. **Settings ▸ Data Sources** — CS100 (ok) + FA310 (pending) status, last
   imported, record count, import report link, safe-import instructions, raw
   `input/` vs sanitized `generated/` locations. No browser upload of raw PII.
2. **FA310 ↔ CS100 matching rule** — manager primarily from FA310 (national ID
   → case → name), CS100 secondary. Raw ID import-time only; browser exposes
   only maskedNationalId. `docs/DATA_MATCHING.md` + `caseManagerMatch.ts`.
3. **Command Center → compact one-screen dashboard** — KPI strip + dense panels
   with internal scroll (Today Tasks, 異常通知, Eisenhower, Dispatch, Schedule,
   Visit). Required sections all visible: caseload, overdue, 30/60-day, today
   tasks, abnormal, Eisenhower, dispatch, schedule.
4. **Today Tasks corrected** — forward-looking (meetings, care plans to finish,
   dispatch follow-ups, scheduled visits). Overdue moved to 異常通知.
5. **異常通知 (Abnormal Notifications)** — overdue, dispatch timeout/no-capacity,
   missing AA01, FA310 failed, missing/stale source. Global Notifications kept.
6. **Eisenhower Matrix** — classifies the above signals into 4 quadrants; items
   link to case/tab.
7. **Cases vs Workspace** — Cases = registry/triage ("個案登記冊") with sort +
   count (table-oriented); Workspace = distinct "case file" banner.
8. **Header search** — retained; supports name / id / maskedNationalId / last-4.

## Verification

- typecheck / lint / test (62) / build all pass. No console errors.
- Smoke (browser eval): `/` = Command Center; compact dashboard; Eisenhower
  present + clickable; Today Tasks = meetings/plans (no 逾期); 異常通知 present;
  Cases (registry) and Workspace (case file) distinct; Settings ▸ Data Sources
  present; no `[A-Z]\d{9}` raw ID in browser data.

## Release

- Version 1.0.3 (package.json + sidebar). Tag `v1.0.3`.
- Push: see git remote status in final report.

## Known limitations (carried)

FA310 live import pending (adapter seam ready); AA01 draft-mode; Knowledge
practical index + external link; Visit/Dispatch read-or-link; Documents
link-first; Genogram placeholder; mock auth.
