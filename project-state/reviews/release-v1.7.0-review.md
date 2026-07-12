# Release Review — v1.7.0 (Milestone 7 — Orbikt Launcher / DX)

## Scope

User-approved New Development Target (2026-07-06): make Orbikt usable by
non-technical users via a one-click Launcher that is part of the product.

## Requirement evaluation

| Requirement | Result |
| --- | --- |
| Start Orbikt: verify runtime/deps/generated, regenerate only if required, start server if not running, wait until available, auto-open browser | ✓ freshness-driven start plan; verified headless + real UI click |
| Never require PowerShell | ✓ Orbikt.vbs hidden window; UI-only interaction |
| System Status (version/sync/branch/commit/build/generated) | ✓ /api/status + UI card (developer terms translated away; branch/commit available in payload, surfaced as 版本同步 summary) |
| Data Sources (CS100/FA310/manager-map/generated: available, count, last updated, health) | ✓ /api/data-sources + UI card |
| Diagnostics PASS/FAIL (node/npm/generated/browser/app) | ✓ 5 checks, verified 5/5 while running |
| Update System (pull; conditional install/reseed/rebuild) | ✓ updatePlan() from changed paths; verified "已是最新" path |
| Open Orbikt without duplicate servers | ✓ idempotent start + /api/open; single-instance launcher |
| Stop Orbikt safely | ✓ /api/stop verified (port closed) |
| Hide all developer terminology | ✓ UI text audit + unit test asserting sync summaries contain no git/npm/node/vite/localhost/commit |
| Electron/Tauri future compatibility | ✓ UI ⇄ endpoint table ⇄ pure core split; docs/LAUNCHER.md migration table |
| Keep Governance; no Blueprint redesign; no Data Center changes; orchestration only | ✓ zero business logic in launcher; fixed command set; existing scripts reused |

## Evidence

- typecheck / lint / tests (140, +20) / build PASS.
- End-to-end: start flow (build→serve→DONE), app HTTP 200 + SPA fallback +
  assets, diagnostics 5/5, idempotent start, stop/quit, update no-op path,
  real-UI click-through with progress stream and status pill flip, served app
  renders Command Center with no raw-ID patterns.
- Security: 127.0.0.1 binding, fixed command set, path-traversal guard on the
  static host, no raw source content to the UI.

## Deferred (recorded)

- Electron/Tauri packaging itself (workflow is ready; packaging is a future
  milestone if the user approves).
- Auto-update of the Launcher runtime (Node version management) — out of scope.
- M6 remainder unchanged (credentials Stop Condition).

## Verdict

**Acceptance PASS.** Release v1.7.0.
