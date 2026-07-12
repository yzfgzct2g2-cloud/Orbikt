import { describe, it, expect } from "vitest";
import {
  buildDecision,
  depsDecision,
  diagnosticsReport,
  generatedDecision,
  startPlan,
  syncSummary,
  updatePlan,
} from "./launcherCore.mjs";

const f = (exists, mtimeMs = null) => ({ exists, mtimeMs });

describe("launcherCore — deps", () => {
  it("needs install when node_modules marker is missing", () => {
    expect(
      depsDecision({ nodeModulesMarker: f(false), packageLock: f(true, 10) }).fresh
    ).toBe(false);
  });
  it("needs install when the lockfile is newer than the marker", () => {
    expect(
      depsDecision({ nodeModulesMarker: f(true, 5), packageLock: f(true, 10) }).fresh
    ).toBe(false);
  });
  it("is fresh when the marker is up to date", () => {
    expect(
      depsDecision({ nodeModulesMarker: f(true, 20), packageLock: f(true, 10) }).fresh
    ).toBe(true);
  });
});

describe("launcherCore — generated data", () => {
  it("is stale when raw input is newer than the generated artifact", () => {
    const d = generatedDecision("X", [f(true, 100)], f(true, 50));
    expect(d.fresh).toBe(false);
  });
  it("is stale when the import script is newer", () => {
    const d = generatedDecision("X", [f(true, 10)], f(true, 50), [f(true, 90)]);
    expect(d.fresh).toBe(false);
  });
  it("is fresh when generated is newest", () => {
    const d = generatedDecision("X", [f(true, 10)], f(true, 50), [f(true, 20)]);
    expect(d.fresh).toBe(true);
  });
  it("is fresh when no raw input exists (committed artifact authoritative)", () => {
    expect(generatedDecision("X", [f(false)], f(true, 50)).fresh).toBe(true);
  });
  it("is stale-but-regenerable when generated missing and raw present", () => {
    const d = generatedDecision("X", [f(true, 10)], f(false));
    expect(d.fresh).toBe(false);
    expect(d.reason).toContain("尚未產生");
  });
});

describe("launcherCore — build + start plan", () => {
  it("build is stale when source is newer than dist", () => {
    expect(buildDecision(f(true, 50), 100).fresh).toBe(false);
    expect(buildDecision(f(true, 150), 100).fresh).toBe(true);
    expect(buildDecision(f(false), 100).fresh).toBe(false);
  });

  it("plans only serve when everything is fresh", () => {
    const plan = startPlan({
      deps: { fresh: true },
      generatedCases: { fresh: true },
      generatedFa310: { fresh: true },
      build: { fresh: true },
      canRegenerateCases: true,
      canRegenerateFa310: true,
    });
    expect(plan).toEqual(["serve"]);
  });

  it("plans the full chain when everything is stale", () => {
    const plan = startPlan({
      deps: { fresh: false },
      generatedCases: { fresh: false },
      generatedFa310: { fresh: false },
      build: { fresh: true }, // still rebuilt because earlier steps ran
      canRegenerateCases: true,
      canRegenerateFa310: true,
    });
    expect(plan).toEqual(["install", "seed-cases", "seed-fa310", "build", "serve"]);
  });

  it("never plans regeneration when raw inputs are absent", () => {
    const plan = startPlan({
      deps: { fresh: true },
      generatedCases: { fresh: false },
      generatedFa310: { fresh: false },
      build: { fresh: true },
      canRegenerateCases: false,
      canRegenerateFa310: false,
    });
    expect(plan).toEqual(["serve"]);
  });
});

describe("launcherCore — sync summary (no git vocabulary)", () => {
  it("reports clean-and-synced as ok", () => {
    const s = syncSummary({ available: true, dirty: false, ahead: 0, behind: 0 });
    expect(s.level).toBe("ok");
  });
  it("reports behind as update available", () => {
    const s = syncSummary({ available: true, dirty: false, ahead: 0, behind: 2 });
    expect(s.level).toBe("warn");
    expect(s.text).toContain("新版本");
  });
  it("never leaks developer terms", () => {
    for (const g of [
      { available: false },
      { available: true, dirty: true, ahead: 0, behind: 0 },
      { available: true, dirty: false, ahead: 3, behind: 0 },
    ]) {
      const t = syncSummary(g).text.toLowerCase();
      for (const term of ["git", "npm", "node", "vite", "localhost", "commit"])
        expect(t).not.toContain(term);
    }
  });
});

describe("launcherCore — diagnostics + update plan", () => {
  it("aggregates PASS/FAIL", () => {
    const r = diagnosticsReport({
      nodeOk: true, nodeVersion: "v24", npmOk: true,
      generatedOk: true, browserOk: true, appOk: false,
    });
    expect(r.allPass).toBe(false);
    expect(r.items).toHaveLength(5);
    expect(r.items.find((i) => i.id === "app")?.pass).toBe(false);
  });

  it("update plan: lockfile change forces install + build", () => {
    expect(updatePlan(["package-lock.json"])).toEqual(["install", "build"]);
  });
  it("update plan: script change forces reseed + build", () => {
    expect(updatePlan(["scripts/fa310Normalize.mjs"])).toEqual([
      "seed-cases", "seed-fa310", "build",
    ]);
  });
  it("update plan: docs-only change needs nothing", () => {
    expect(updatePlan(["CHANGELOG.md", "docs/ADAPTERS.md"])).toEqual([]);
  });
  it("update plan: src change needs build only", () => {
    expect(updatePlan(["src/pages/Cases.tsx"])).toEqual(["build"]);
  });
});
