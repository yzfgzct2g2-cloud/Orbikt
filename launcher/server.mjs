// Orbikt Launcher — local orchestrator + app host.
//
//   node launcher/server.mjs        (or double-click Orbikt.vbs)
//
// The Launcher is the OFFICIAL entry point for non-technical users. It runs a
// small localhost-only web server with a simple UI (launcher/ui.html) and a
// fixed set of orchestration endpoints. It also SERVES the built Orbikt app
// itself (static dist/ with SPA fallback) so no developer tooling runs at
// use-time — Vite/npm are only invoked when something needs (re)building.
//
// Security posture: binds 127.0.0.1 only; endpoints execute a FIXED command
// set (never request-supplied strings); the UI receives file existence/mtime
// facts and generated metadata only — never raw source content (Data Rules).
//
// Future compatibility: UI (ui.html) talks to these endpoints over HTTP. In an
// Electron/Tauri packaging the same UI calls the same operations via IPC —
// launcherCore decisions move unchanged.

import http from "node:http";
import { spawn } from "node:child_process";
import {
  existsSync,
  statSync,
  readFileSync,
  readdirSync,
  createReadStream,
} from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  buildDecision,
  depsDecision,
  diagnosticsReport,
  generatedDecision,
  startPlan,
  syncSummary,
  updatePlan,
} from "./launcherCore.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const LAUNCHER_PORT = 5199;
export const APP_PORT = 5198;

const isWin = process.platform === "win32";
const npmCmd = "npm";

// ---------------------------------------------------------------------------
// Fact gathering
// ---------------------------------------------------------------------------

function fileFact(rel) {
  const p = path.join(root, rel);
  try {
    const st = statSync(p);
    return { exists: true, mtimeMs: st.mtimeMs };
  } catch {
    return { exists: false, mtimeMs: null };
  }
}

function newestMtime(dirRel, exts = null) {
  const dir = path.join(root, dirRel);
  if (!existsSync(dir)) return null;
  let newest = null;
  const walk = (d) => {
    for (const e of readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) walk(p);
      else if (!exts || exts.some((x) => e.name.endsWith(x))) {
        const m = statSync(p).mtimeMs;
        if (newest === null || m > newest) newest = m;
      }
    }
  };
  try {
    walk(dir);
  } catch {
    return newest;
  }
  return newest;
}

function readJsonSafe(rel) {
  try {
    return JSON.parse(readFileSync(path.join(root, rel), "utf8"));
  } catch {
    return null;
  }
}

function gatherState() {
  const deps = depsDecision({
    nodeModulesMarker: fileFact("node_modules/.package-lock.json"),
    packageLock: fileFact("package-lock.json"),
  });
  const casesRaw = [fileFact("input/CS100/CS100.xls"), fileFact("mock-data/CS100.xlsx")];
  const fa310Raw = [
    fileFact("input/FA310/FA310.xls"),
    fileFact("input/manager-map/manager-map.csv"),
  ];
  const generatedCases = generatedDecision(
    "個案資料",
    casesRaw,
    fileFact("src/data/seed/cases.generated.json"),
    [fileFact("scripts/buildCaseSeed.mjs"), fileFact("scripts/cs100Normalize.mjs")]
  );
  const generatedFa310 = generatedDecision(
    "FA310 資料",
    fa310Raw,
    fileFact("src/data/seed/fa310.generated.json"),
    [fileFact("scripts/buildFa310Seed.mjs"), fileFact("scripts/fa310Normalize.mjs")]
  );
  const build = buildDecision(
    fileFact("dist/index.html"),
    Math.max(
      newestMtime("src") ?? 0,
      fileFact("package.json").mtimeMs ?? 0,
      fileFact("index.html").mtimeMs ?? 0
    ) || null
  );
  return {
    deps,
    generatedCases,
    generatedFa310,
    build,
    canRegenerateCases: casesRaw.some((f) => f.exists),
    canRegenerateFa310: fa310Raw[0].exists,
  };
}

// ---------------------------------------------------------------------------
// Fixed command execution (never request-supplied)
// ---------------------------------------------------------------------------

function run(cmd, args, timeoutMs = 300000) {
  return new Promise((resolve) => {
    let child;
    try {
      // On Windows, .cmd shims (npm) cannot be spawned with shell:false on
      // modern Node (EINVAL, CVE-2024-27980 mitigation). Routing the FIXED
      // command through cmd /c keeps shell:false semantics without string
      // interpolation — args stay an array, never request-supplied.
      child = isWin
        ? spawn("cmd", ["/c", cmd, ...args], { cwd: root, shell: false })
        : spawn(cmd, args, { cwd: root, shell: false });
    } catch (e) {
      return resolve({ ok: false, out: "", err: String(e) });
    }
    let out = "";
    let err = "";
    const timer = setTimeout(() => {
      child.kill();
      resolve({ ok: false, out, err: err + "\n[逾時]" });
    }, timeoutMs);
    child.stdout?.on("data", (d) => (out += d));
    child.stderr?.on("data", (d) => (err += d));
    child.on("close", (code) => {
      clearTimeout(timer);
      resolve({ ok: code === 0, out, err });
    });
    child.on("error", (e) => {
      clearTimeout(timer);
      resolve({ ok: false, out, err: String(e) });
    });
  });
}

const COMMANDS = {
  install: () => run(npmCmd, ["install"], 600000),
  "seed-cases": () => run(npmCmd, ["run", "seed:cases"]),
  "seed-fa310": () => run(npmCmd, ["run", "seed:fa310"]),
  build: () => run(npmCmd, ["run", "build"], 600000),
};

const STEP_LABELS = {
  install: "安裝必要元件",
  "seed-cases": "整理個案資料",
  "seed-fa310": "整理 FA310 資料",
  build: "準備應用程式",
  serve: "啟動 Orbikt",
};

// ---------------------------------------------------------------------------
// The app host (serves dist/ on APP_PORT with SPA fallback)
// ---------------------------------------------------------------------------

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".png": "image/png",
  ".woff2": "font/woff2",
};

let appServer = null;

function startAppServer() {
  return new Promise((resolve) => {
    if (appServer) return resolve({ ok: true, already: true });
    const dist = path.join(root, "dist");
    const srv = http.createServer((req, res) => {
      const urlPath = decodeURIComponent((req.url ?? "/").split("?")[0]);
      let filePath = path.normalize(path.join(dist, urlPath));
      if (!filePath.startsWith(dist)) {
        res.writeHead(403).end();
        return;
      }
      if (!existsSync(filePath) || statSync(filePath).isDirectory()) {
        filePath = path.join(dist, "index.html"); // SPA fallback
      }
      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, { "Content-Type": MIME[ext] ?? "application/octet-stream" });
      createReadStream(filePath).pipe(res);
    });
    srv.on("error", () => resolve({ ok: false }));
    srv.listen(APP_PORT, "127.0.0.1", () => {
      appServer = srv;
      resolve({ ok: true, already: false });
    });
  });
}

function stopAppServer() {
  return new Promise((resolve) => {
    if (!appServer) return resolve({ ok: true, already: true });
    appServer.close(() => {
      appServer = null;
      resolve({ ok: true, already: false });
    });
    // Sever keep-alive connections so close() completes promptly.
    appServer.closeAllConnections?.();
  });
}

function appRunning() {
  return appServer !== null;
}

function openBrowser(url) {
  // ORBIKT_NO_BROWSER supports headless verification/CI — the launcher works
  // identically, it just skips opening a window.
  if (process.env.ORBIKT_NO_BROWSER === "1") return;
  if (isWin) spawn("cmd", ["/c", "start", "", url], { shell: false });
  else spawn("open", [url]);
}

// ---------------------------------------------------------------------------
// Status / diagnostics / update
// ---------------------------------------------------------------------------

async function gitFacts() {
  const branch = await run("git", ["rev-parse", "--abbrev-ref", "HEAD"], 15000);
  if (!branch.ok) return { available: false };
  const commit = await run("git", ["rev-parse", "--short", "HEAD"], 15000);
  const status = await run("git", ["status", "--porcelain"], 15000);
  // ahead/behind vs upstream (no network; uses last-known remote refs)
  const ab = await run(
    "git",
    ["rev-list", "--left-right", "--count", "HEAD...@{upstream}"],
    15000
  );
  let ahead = 0;
  let behind = 0;
  if (ab.ok) {
    const m = ab.out.trim().match(/^(\d+)\s+(\d+)$/);
    if (m) {
      ahead = Number(m[1]);
      behind = Number(m[2]);
    }
  }
  return {
    available: true,
    branch: branch.out.trim(),
    commit: commit.ok ? commit.out.trim() : "?",
    dirty: status.ok ? status.out.trim().length > 0 : false,
    ahead,
    behind,
  };
}

function dataSourcesView() {
  const casesMeta = readJsonSafe("src/data/seed/meta.generated.json");
  const fa310Meta = readJsonSafe("src/data/seed/fa310.meta.generated.json");
  const src = (rel, label, meta) => {
    const f = fileFact(rel);
    return {
      id: rel,
      label,
      available: f.exists,
      lastUpdated: f.mtimeMs ? new Date(f.mtimeMs).toISOString() : null,
      ...meta,
    };
  };
  return [
    src("input/CS100/CS100.xls", "CS100 個案清冊（來源檔）", {
      recordCount: casesMeta?.count ?? null,
      health: fileFact("input/CS100/CS100.xls").exists ? "ok" : "missing",
    }),
    src("input/FA310/FA310.xls", "FA310 服務紀錄（來源檔）", {
      recordCount: fa310Meta?.records ?? null,
      health: fileFact("input/FA310/FA310.xls").exists ? "ok" : "missing",
    }),
    src("input/manager-map/manager-map.csv", "個管名冊（來源檔）", {
      recordCount: fa310Meta?.managerMapEntries ?? null,
      health: fileFact("input/manager-map/manager-map.csv").exists
        ? "ok"
        : "missing",
    }),
    {
      id: "generated",
      label: "已整理資料（應用程式使用）",
      available:
        fileFact("src/data/seed/cases.generated.json").exists &&
        fileFact("src/data/seed/fa310.generated.json").exists,
      lastUpdated: casesMeta?.generatedAt ?? null,
      recordCount:
        (casesMeta?.count ?? 0) + (fa310Meta?.records ?? 0) || null,
      health:
        gatherState().generatedCases.fresh && gatherState().generatedFa310.fresh
          ? "ok"
          : "stale",
    },
  ];
}

async function runDiagnostics() {
  const npm = await run(npmCmd, ["--version"], 20000);
  const state = gatherState();
  return diagnosticsReport({
    nodeOk: true, // we are running on Node
    nodeVersion: process.version,
    npmOk: npm.ok,
    generatedOk: state.generatedCases.fresh !== false || fileFact("src/data/seed/cases.generated.json").exists,
    browserOk: isWin, // Windows always has a default-browser handler for `start`
    appOk: appRunning(),
  });
}

async function doStart(progress) {
  const state = gatherState();
  const plan = startPlan(state);
  for (const step of plan) {
    progress(STEP_LABELS[step] ?? step);
    if (step === "serve") {
      const r = await startAppServer();
      if (!r.ok) return { ok: false, failedStep: step };
    } else {
      const r = await COMMANDS[step]();
      if (!r.ok) return { ok: false, failedStep: step, detail: r.err.slice(-800) };
    }
  }
  // Wait until the app answers.
  for (let i = 0; i < 60; i++) {
    const ok = await new Promise((res) => {
      http
        .get({ host: "127.0.0.1", port: APP_PORT, path: "/" }, (r) =>
          res((r.statusCode ?? 500) < 500)
        )
        .on("error", () => res(false));
    });
    if (ok) return { ok: true, url: `http://localhost:${APP_PORT}/` };
    await new Promise((r) => setTimeout(r, 500));
  }
  return { ok: false, failedStep: "wait" };
}

async function doUpdate(progress) {
  progress("檢查更新中…");
  const before = await run("git", ["rev-parse", "HEAD"], 15000);
  const pull = await run("git", ["pull", "--ff-only"], 90000);
  if (!pull.ok) {
    return { ok: false, message: "目前無法取得更新（連線或授權問題），可稍後再試。" };
  }
  const after = await run("git", ["rev-parse", "HEAD"], 15000);
  if (before.out.trim() === after.out.trim()) {
    return { ok: true, message: "已是最新版本，不需更新。" };
  }
  const diff = await run(
    "git",
    ["diff", "--name-only", `${before.out.trim()}..${after.out.trim()}`],
    30000
  );
  const changed = diff.ok ? diff.out.trim().split(/\r?\n/).filter(Boolean) : [];
  const steps = updatePlan(changed);
  for (const step of steps) {
    progress(STEP_LABELS[step] ?? step);
    const r = await COMMANDS[step]();
    if (!r.ok)
      return { ok: false, message: `更新時「${STEP_LABELS[step]}」失敗，請重試。` };
  }
  return { ok: true, message: `更新完成（${changed.length} 個檔案已更新）。`, restartApp: appRunning() };
}

// ---------------------------------------------------------------------------
// Launcher HTTP server
// ---------------------------------------------------------------------------

function json(res, code, body) {
  res.writeHead(code, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(body));
}

// Long operations stream progress lines (text/plain chunked) so the UI can
// show what is happening without any polling infrastructure.
function streamText(res) {
  res.writeHead(200, {
    "Content-Type": "text/plain; charset=utf-8",
    "Cache-Control": "no-cache",
    "X-Content-Type-Options": "nosniff",
  });
  return (line) => res.write(line + "\n");
}

export function createLauncherServer() {
  return http.createServer(async (req, res) => {
    const url = (req.url ?? "/").split("?")[0];
    try {
      if (url === "/" || url === "/index.html") {
        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
        res.end(readFileSync(path.join(root, "launcher/ui.html")));
      } else if (url === "/api/ping") {
        json(res, 200, { orbiktLauncher: true });
      } else if (url === "/api/status") {
        const pkg = readJsonSafe("package.json");
        const git = await gitFacts();
        const state = gatherState();
        json(res, 200, {
          version: pkg?.version ?? "?",
          git,
          sync: syncSummary(git),
          deps: state.deps,
          generated: {
            cases: state.generatedCases,
            fa310: state.generatedFa310,
          },
          build: state.build,
          appRunning: appRunning(),
          appUrl: `http://localhost:${APP_PORT}/`,
        });
      } else if (url === "/api/data-sources") {
        json(res, 200, { sources: dataSourcesView() });
      } else if (url === "/api/diagnostics") {
        json(res, 200, await runDiagnostics());
      } else if (url === "/api/start" && req.method === "POST") {
        const write = streamText(res);
        if (appRunning()) {
          write("Orbikt 已在執行中，直接開啟。");
          openBrowser(`http://localhost:${APP_PORT}/`);
          write("DONE http://localhost:" + APP_PORT + "/");
          res.end();
          return;
        }
        const result = await doStart(write);
        if (result.ok) {
          openBrowser(result.url);
          write("DONE " + result.url);
        } else {
          write("FAIL 啟動未完成（" + (STEP_LABELS[result.failedStep] ?? result.failedStep) + "）。請執行系統檢查或重試。");
        }
        res.end();
      } else if (url === "/api/open" && req.method === "POST") {
        if (appRunning()) {
          openBrowser(`http://localhost:${APP_PORT}/`);
          json(res, 200, { ok: true });
        } else {
          json(res, 200, { ok: false, message: "Orbikt 尚未啟動" });
        }
      } else if (url === "/api/stop" && req.method === "POST") {
        const r = await stopAppServer();
        json(res, 200, { ok: r.ok, already: r.already });
      } else if (url === "/api/update" && req.method === "POST") {
        const write = streamText(res);
        const r = await doUpdate(write);
        write((r.ok ? "DONE " : "FAIL ") + r.message);
        res.end();
      } else if (url === "/api/quit" && req.method === "POST") {
        json(res, 200, { ok: true });
        await stopAppServer();
        setTimeout(() => process.exit(0), 300);
      } else {
        json(res, 404, { error: "not found" });
      }
    } catch (e) {
      // If a streaming response already started, headers are gone — just end.
      if (res.headersSent) {
        res.end("\nFAIL 發生未預期的錯誤，請重試。");
      } else {
        json(res, 500, { error: String(e).slice(0, 300) });
      }
    }
  });
}

// ---------------------------------------------------------------------------
// Single-instance entry
// ---------------------------------------------------------------------------

const isMain =
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMain) {
  const srv = createLauncherServer();
  srv.on("error", (e) => {
    if (e.code === "EADDRINUSE") {
      // A launcher is already running — just bring up its page.
      openBrowser(`http://localhost:${LAUNCHER_PORT}/`);
      process.exit(0);
    }
    console.error(String(e));
    process.exit(1);
  });
  srv.listen(LAUNCHER_PORT, "127.0.0.1", () => {
    openBrowser(`http://localhost:${LAUNCHER_PORT}/`);
    console.log(`Orbikt Launcher: http://localhost:${LAUNCHER_PORT}/`);
  });
}
