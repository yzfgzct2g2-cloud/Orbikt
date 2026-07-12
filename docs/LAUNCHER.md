# Orbikt Launcher

The Launcher is the **official entry point** for Orbikt. It exists so that a
case manager can use Orbikt without ever seeing PowerShell, npm, Node,
localhost, Vite, or Git.

## Using it

Double-click **`Orbikt.vbs`** in the Orbikt folder. A browser page named
「Orbikt 啟動器」 opens. Press **「開始使用 Orbikt」** — Orbikt opens in the
browser when ready. That is the entire workflow.

- 開啟 Orbikt 視窗 — reopen the app window (no duplicate servers ever start).
- 停止 Orbikt — safe shutdown of the app.
- 檢查更新 — fetches the latest version and rebuilds only what changed.
- 系統檢查 — simple PASS/FAIL diagnostics.

If the runtime is missing entirely, `Orbikt.vbs` shows a friendly install
message instead of failing silently.

## Architecture

```
Orbikt.vbs (hidden, double-click entry; runtime presence check)
   └─ node launcher/server.mjs           ← localhost-only HTTP, port 5199
        ├─ launcher/ui.html              ← non-technical UI (no build step)
        ├─ launcher/launcherCore.mjs     ← PURE decisions (fully unit-tested)
        │    deps / generated / build freshness · start plan · update plan
        │    sync summary · diagnostics
        └─ app host                      ← serves dist/ statically, port 5198
             SPA fallback; no Vite at use-time
```

Principles (Governance-aligned):

- **Orchestration only.** The Launcher contains no business rules and does not
  touch Data Center logic. It runs the existing fixed commands
  (`npm install`, `npm run seed:cases`, `npm run seed:fa310`, `npm run build`)
  only when its freshness decisions require them.
- **Fixed command set.** HTTP endpoints never execute request-supplied
  strings; the server binds 127.0.0.1 only.
- **Data rules.** The UI receives file existence/mtimes and generated metadata
  only — never raw source content. The app it serves is the sanitized `dist/`.
- **Single instance.** A second launch detects the running Launcher and simply
  opens its page. Start is idempotent — it never spawns duplicate servers.

## Endpoints (UI ⇄ orchestrator contract)

| Endpoint | Method | Purpose |
| --- | --- | --- |
| `/api/ping` | GET | instance detection |
| `/api/status` | GET | version, sync summary, deps/generated/build freshness, app state |
| `/api/data-sources` | GET | CS100 / FA310 / manager-map / generated availability, counts, health |
| `/api/diagnostics` | GET | PASS/FAIL: runtime, installer, data, browser, app |
| `/api/start` | POST | freshness-driven start plan; streams progress lines; opens browser |
| `/api/open` | POST | open browser to the running app |
| `/api/stop` | POST | stop the app host |
| `/api/update` | POST | pull → conditional install/reseed/rebuild; streams progress |
| `/api/quit` | POST | stop everything and exit the Launcher |

`ORBIKT_NO_BROWSER=1` suppresses browser-opening (headless verification/CI).

## Electron / Tauri path

The workflow is already split the way a desktop shell wants it:

- `ui.html` becomes the renderer/webview page unchanged.
- The endpoint table above becomes the IPC command table 1:1.
- `launcherCore.mjs` (pure decisions) moves unchanged; only fact-gathering
  and process-spawning move into the main process (Electron) or Rust commands
  (Tauri).
- The app host can remain a static file server or be replaced by the shell's
  own protocol handler.

No workflow change is required — only transport (HTTP → IPC).
