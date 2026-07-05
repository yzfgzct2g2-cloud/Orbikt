# Checkpoint CP-0024

## Milestone

Milestone 6 — External Integration (P3) → **BLOCKED (Stop Condition)**

## Version

v1.5.0 (checkpoint — no version bump; milestone not complete)

## What happened

Milestone 6 requires live integrations (Visit Manager GAS, Dispatch API, FA310
QA Engine, Microsoft Graph, Supabase, Google Calendar, LINE, real auth). Repo
inspection confirms **no credentials exist** (no `.env`, no keys — correct per
privacy rules), and the available URLs are UI links, not documented API
contracts. Per WORKFLOW §11 Integration Rule ("If credentials are missing,
stop and report. Do not fake live integration.") this is a genuine Stop
Condition.

## Credential-free work completed

- **`docs/ADAPTERS.md`** — every adapter boundary documented (M6 completion
  criterion 1): contract location, current implementation, live target,
  required credentials, safe fallback — for DataAdapter/Supabase, Visit
  Manager GAS, Dispatch API, FA310 QA Engine, Microsoft Graph, Google
  Calendar, LINE, and auth. Includes the Stop Condition table of exactly what
  the user must supply per integration.
- WORKFLOW.md Milestone 6 marked **Blocked** with unblock instructions.

## M6 criteria status

- Adapter boundaries documented ✓ (docs/ADAPTERS.md)
- Missing credentials trigger Stop Condition ✓ (this checkpoint)
- Safe fallback read/link mode remains ✓ (seed adapters + IntegrationNotice)
- No fake live connection presented as real ✓ (暫代種子 labels, notices)
- Live wiring ✗ — awaiting credentials/authorization

## Session summary (2026-07-06)

Milestones completed this session: M3 Morning Workflow (v1.3.0), M4 Case
Workflow (v1.4.0), M5 Automation (v1.5.0). All P0–P2 milestones (M1–M5) are
now COMPLETED. M6 (P3) is Blocked on credentials.

## Push queue

GitHub push authentication is intermittent. Pushed through v1.2.0 earlier;
v1.3.0 / v1.4.0 / v1.5.0 commits + tags are committed locally and queued.
Retry per session: `git push origin main v1.3.0 v1.4.0 v1.5.0`.

## Next

Unblock Milestone 6 by supplying credentials per docs/ADAPTERS.md, or direct
work to a backlog item (WORKFLOW §18) with explicit approval.
