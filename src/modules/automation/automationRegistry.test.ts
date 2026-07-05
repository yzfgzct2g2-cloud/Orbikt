import { describe, it, expect } from "vitest";
import {
  automationRegistry,
  automationById,
} from "./automationRegistry";

describe("automationRegistry — transparency completeness", () => {
  it("every entry is fully explainable, traceable, and verifiable", () => {
    for (const a of automationRegistry) {
      expect(a.id).not.toBe("");
      expect(a.name).not.toBe("");
      expect(a.rule.length, `${a.id} rule`).toBeGreaterThan(10);
      expect(a.source.length, `${a.id} source`).toBeGreaterThan(3);
      expect(a.surface.length, `${a.id} surface`).toBeGreaterThan(3);
      expect(a.codePath, `${a.id} codePath`).toMatch(/^src\//);
      expect(["nothing", "session-state"]).toContain(a.writes);
    }
  });

  it("ids are unique", () => {
    const ids = automationRegistry.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("covers the known automated derivations", () => {
    for (const id of [
      "today-tasks",
      "abnormal-detection",
      "eisenhower",
      "next-action",
      "completion-checklist",
      "manager-matching",
      "source-warnings",
      "notifications",
      "dashboard-refresh",
    ]) {
      expect(automationById(id), id).toBeDefined();
    }
  });

  it("no automation writes to source systems", () => {
    // "nothing" or session-state only — automation never mutates SSOT data.
    expect(
      automationRegistry.every(
        (a) => a.writes === "nothing" || a.writes === "session-state"
      )
    ).toBe(true);
  });
});
