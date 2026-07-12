# Checkpoint CP-0027

## Milestone

Milestone 7 — Launcher (Developer Experience, user-approved) → **COMPLETED**

## Version

v1.7.0

## What shipped

1. **`Orbikt.vbs`** — double-click official entry; hidden window; friendly
   Traditional-Chinese message with install link when the runtime is missing.
2. **`launcher/server.mjs`** — zero-dependency localhost-only orchestrator
   (port 5199):
   - Serves the launcher UI and the BUILT app itself (static dist/, port 5198,
     SPA fallback) — no Vite/npm at use-time.
   - Endpoints: ping / status / data-sources / diagnostics / start / open /
     stop / update / quit. Long operations stream progress lines.
   - Fixed command set only (install, seed:cases, seed:fa310, build); never
     executes request-supplied strings; binds 127.0.0.1.
   - Single instance (EADDRINUSE → open existing page); idempotent start.
3. **`launcher/launcherCore.mjs`** — pure decisions: deps/generated/build
   freshness, start plan, update plan from changed paths, sync summary
   (no git vocabulary), diagnostics aggregation. **20 unit tests.**
4. **`launcher/ui.html`** — primary action 開始使用 Orbikt; System Status,
   Data Sources (CS100/FA310/manager-map/generated: available, count, last
   updated, health), PASS/FAIL diagnostics, update, stop. Zero developer
   terminology (tested: sync summaries must not contain git/npm/node/vite/
   localhost/commit).
5. **`docs/LAUNCHER.md`** — architecture + endpoint table + 1:1 Electron/Tauri
   migration path (UI unchanged; endpoints → IPC; pure core moves as-is).
6. `npm run launcher`; `ORBIKT_NO_BROWSER=1` headless mode; vitest include
   extended to launcher/.

## Defect found & fixed during verification

Modern Node (24) refuses `spawn("npm.cmd", …, {shell:false})` (EINVAL,
CVE-2024-27980). First start-flow crashed the launcher (streaming response +
error path tried to re-send headers). Fixed: fixed commands routed through
`cmd /c` with array args; run() never throws; handler honours headersSent.

## End-to-end verification (real behaviour, not claims)

- `/api/status` — correct version/sync/freshness facts (honest "本機有尚未
  儲存的變更" on a dirty tree).
- `/api/data-sources` — CS100 378 · FA310 390 · 名冊 5 · generated 768, all ok.
- `/api/start` (headless) — build → serve → DONE; app 200 on :5198; SPA
  fallback 200; hashed asset 200.
- Idempotent start — "已在執行中，直接開啟", no duplicate server.
- `/api/diagnostics` — 5/5 PASS while running.
- `/api/stop` — app port refused afterwards. `/api/quit` — process exits.
- `/api/update` — "已是最新版本，不需更新。"
- Real UI click-through (browser): 開始使用 Orbikt → progress stream →
  status pill 執行中; app at :5198 renders Command Center (Eisenhower present,
  no raw-ID patterns).

## QA

typecheck PASS · lint PASS · tests PASS (140) · build PASS.

## Governance

Launcher orchestrates only — no business rules, Data Center logic untouched,
Blueprint unchanged. Milestone recorded in WORKFLOW.md §11b (user-approved).
M6 remainder stays Blocked (credentials) — unchanged.

## Next

M6 remainder (credentials) or next user-approved target.
