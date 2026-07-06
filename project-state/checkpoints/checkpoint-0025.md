# Checkpoint CP-0025

## Milestone

Milestone 6 — External Integration (P3) → still **BLOCKED (Stop Condition)** —
now with concrete probe evidence.

## Version

v1.5.0 (checkpoint — no version bump; no milestone work possible)

## What happened this session

1. **Sync:** git pull — already up to date; no new commits from other machines.
2. **Push retry:** still hangs on GitHub write auth (60s + 40s windows).
   Queue: commits fc78bfa (v1.3.0), 0b1d50c (v1.4.0), 1661c02 (v1.5.0),
   bdbdcdd (CP-0024) + tags v1.3.0/v1.4.0/v1.5.0. Remote main = 3d28c2d.
3. **Unblock check:** no `.env`, no `input/FA310/` — credentials still absent.
4. **Visit Manager GAS probe (read-only GET, no credentials needed):** the exec
   URL returns the full HtmlService web app（伊甸基金會個案訪視管理系統, HTTP
   200 text/html）— **no JSON API exists at this URL**. Live visit integration
   therefore requires the GAS project owner to add a JSON doGet mode or a
   second API deployment (documented in docs/ADAPTERS.md ▸ Visit Manager,
   including the required safe-field payload shape).
5. **Dispatch service probe:** denied by the environment's permission system
   (external endpoint probing requires user review outside auto mode) —
   consistent with the Stop Condition: external integration needs the user.

## Conclusion

Milestone 6 remains Blocked. The block is now evidence-based, not assumed:
- Visit GAS: no machine-readable contract exists (verified).
- All other integrations: credentials/authorization absent (verified).
- Endpoint exploration beyond this requires user-supervised execution.

## Unblock paths (unchanged, refined)

- FA310 raw files → `input/FA310/` (no external credentials needed).
- GAS owner adds JSON mode per docs/ADAPTERS.md payload spec.
- Supply API/OAuth credentials via `.env` per docs/ADAPTERS.md table.
- Or approve a WORKFLOW §18 backlog item for promotion.
