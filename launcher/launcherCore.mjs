// Orbikt Launcher — pure decision logic.
//
// Everything here is a PURE function over plain "facts" objects (file
// existence / mtimes / command results) gathered by server.mjs. Keeping the
// decisions side-effect-free makes them unit-testable and portable: when the
// Launcher later becomes an Electron or Tauri app, these functions move
// unchanged — only the fact-gathering and process-spawning layers are
// replaced.
//
// The Launcher ONLY orchestrates startup. It contains no business rules, no
// data transformations, and never reads raw source file CONTENT (existence
// and modification times only — the browser-facing UI must never receive raw
// data; see CLAUDE.md Data Rules).

/**
 * @typedef {{ exists: boolean, mtimeMs: number | null }} FileFact
 */

/** Dependencies are fresh when npm's install marker is at least as new as the lockfile. */
export function depsDecision(facts) {
  const { nodeModulesMarker, packageLock } = facts;
  if (!nodeModulesMarker.exists) {
    return { fresh: false, reason: "尚未安裝必要元件" };
  }
  if (
    packageLock.exists &&
    packageLock.mtimeMs !== null &&
    nodeModulesMarker.mtimeMs !== null &&
    packageLock.mtimeMs > nodeModulesMarker.mtimeMs
  ) {
    return { fresh: false, reason: "元件版本已更新，需要重新安裝" };
  }
  return { fresh: true, reason: "元件已就緒" };
}

/**
 * Generated data is stale when a generated artifact is missing while its raw
 * input exists, or when the raw input (or import script) is newer than the
 * generated artifact. When the raw input is absent, the committed generated
 * artifact is authoritative (fresh) — regeneration is impossible anyway.
 */
export function generatedDecision(name, rawInputs, generated, scripts = []) {
  if (!generated.exists) {
    const anyRaw = rawInputs.some((f) => f.exists);
    return anyRaw
      ? { fresh: false, reason: `${name}：資料尚未產生` }
      : { fresh: false, reason: `${name}：資料缺漏且無來源檔可產生` };
  }
  const genTime = generated.mtimeMs ?? 0;
  const newerRaw = rawInputs.some(
    (f) => f.exists && f.mtimeMs !== null && f.mtimeMs > genTime
  );
  if (newerRaw) return { fresh: false, reason: `${name}：來源檔已更新，需重新產生` };
  const newerScript = scripts.some(
    (f) => f.exists && f.mtimeMs !== null && f.mtimeMs > genTime
  );
  if (newerScript)
    return { fresh: false, reason: `${name}：匯入程序已更新，需重新產生` };
  return { fresh: true, reason: `${name}：已是最新` };
}

/** The built app is stale when any source file is newer than the built page. */
export function buildDecision(distIndex, newestSourceMtimeMs) {
  if (!distIndex.exists) return { fresh: false, reason: "應用程式尚未建置" };
  const distTime = distIndex.mtimeMs ?? 0;
  if (newestSourceMtimeMs !== null && newestSourceMtimeMs > distTime) {
    return { fresh: false, reason: "內容已更新，需要重新建置" };
  }
  return { fresh: true, reason: "應用程式已是最新" };
}

/**
 * The ordered plan of steps required before the app can be served. Each step
 * name maps to a fixed command in server.mjs — the plan never contains
 * arbitrary commands.
 */
export function startPlan(state) {
  const steps = [];
  if (!state.deps.fresh) steps.push("install");
  if (!state.generatedCases.fresh && state.canRegenerateCases)
    steps.push("seed-cases");
  if (!state.generatedFa310.fresh && state.canRegenerateFa310)
    steps.push("seed-fa310");
  if (!state.build.fresh || steps.length > 0) steps.push("build");
  steps.push("serve");
  return steps;
}

/** Map git status facts to a user-facing sync summary (no git vocabulary). */
export function syncSummary(git) {
  if (!git.available) return { level: "unknown", text: "無法確認版本同步狀態" };
  if (git.dirty) return { level: "warn", text: "本機有尚未儲存的變更" };
  if (git.behind > 0)
    return { level: "warn", text: `有新版本可更新（落後 ${git.behind} 個更新）` };
  if (git.ahead > 0)
    return { level: "warn", text: `本機版本較新（${git.ahead} 個更新待上傳）` };
  return { level: "ok", text: "已是最新版本" };
}

/** Simple PASS/FAIL diagnostics from raw check results. */
export function diagnosticsReport(checks) {
  const items = [
    {
      id: "runtime",
      label: "執行環境",
      pass: checks.nodeOk,
      hint: checks.nodeOk ? checks.nodeVersion : "找不到執行環境，請重新安裝 Orbikt",
    },
    {
      id: "installer",
      label: "元件管理",
      pass: checks.npmOk,
      hint: checks.npmOk ? "可用" : "找不到元件管理工具",
    },
    {
      id: "data",
      label: "資料檔",
      pass: checks.generatedOk,
      hint: checks.generatedOk ? "資料已產生" : "資料尚未產生，啟動時會自動處理",
    },
    {
      id: "browser",
      label: "瀏覽器",
      pass: checks.browserOk,
      hint: checks.browserOk ? "可自動開啟" : "無法自動開啟，請手動輸入網址",
    },
    {
      id: "app",
      label: "Orbikt 應用程式",
      pass: checks.appOk,
      hint: checks.appOk ? "執行中" : "尚未啟動",
    },
  ];
  return { items, allPass: items.every((i) => i.pass) };
}

/** Decide what the update flow must do after a pull, from changed file paths. */
export function updatePlan(changedPaths) {
  const needInstall = changedPaths.some((p) =>
    /^package(-lock)?\.json$/.test(p)
  );
  const needSeeds = changedPaths.some((p) => /^scripts\//.test(p));
  const needBuild =
    changedPaths.length > 0 &&
    changedPaths.some(
      (p) =>
        /^(src|public|index\.html|package\.json|vite\.config|tailwind|postcss|tsconfig)/.test(
          p
        ) || needInstall
    );
  const steps = [];
  if (needInstall) steps.push("install");
  if (needSeeds) steps.push("seed-cases", "seed-fa310");
  if (needBuild || needInstall || needSeeds) steps.push("build");
  return steps;
}
