import { describe, expect, it } from "vitest";
import { mockDashboardData } from "./mockDashboardData";
import {
  buildDashboardViewModel,
  getEnabledModuleIds,
} from "./dashboardSelectors";
import { orbiktModules } from "../modules/registry";

describe("Orbikt modular dashboard data selection", () => {
  it("starts with care and finance enabled by default", () => {
    expect(getEnabledModuleIds(orbiktModules)).toEqual(["care", "finance"]);
  });

  it("only returns dashboard content for enabled modules", () => {
    const careOnlyModules = orbiktModules.map((module) => ({
      ...module,
      enabled: module.id === "care",
    }));

    const viewModel = buildDashboardViewModel(
      careOnlyModules,
      mockDashboardData
    );

    expect(viewModel.enabledModules.map((module) => module.id)).toEqual([
      "care",
    ]);
    expect(viewModel.moduleWidgets.map((widget) => widget.moduleId)).toEqual([
      "care",
    ]);
    expect(viewModel.kpis.every((kpi) => kpi.moduleId === "care")).toBe(true);
    expect(viewModel.quickActions.every((action) => action.moduleId === "care")).toBe(
      true
    );
    expect(viewModel.recentActivities.every((activity) => activity.moduleId === "care")).toBe(
      true
    );
    expect(
      viewModel.eisenhowerQuadrants.every((quadrant) =>
        quadrant.tasks.every((task) => task.moduleId === "care")
      )
    ).toBe(true);
  });

  it("adds module-specific widgets when another module is enabled", () => {
    const careFinanceAnalyticsModules = orbiktModules.map((module) => ({
      ...module,
      enabled: ["care", "finance", "analytics"].includes(module.id),
    }));

    const viewModel = buildDashboardViewModel(
      careFinanceAnalyticsModules,
      mockDashboardData
    );

    expect(viewModel.enabledModules.map((module) => module.id)).toEqual([
      "care",
      "finance",
      "analytics",
    ]);
    expect(viewModel.moduleWidgets.map((widget) => widget.moduleId)).toEqual([
      "care",
      "finance",
      "analytics",
    ]);
    expect(viewModel.quickActions.map((action) => action.moduleId)).toContain(
      "analytics"
    );
    expect(viewModel.chartSeries.map((series) => series.moduleId)).toContain(
      "analytics"
    );
  });
});
