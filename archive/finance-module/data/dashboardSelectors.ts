import type { DashboardData } from "./mockDashboardData";
import type { OrbiktModule, OrbiktModuleId } from "../modules/types";

export function getEnabledModuleIds(
  modules: OrbiktModule[]
): OrbiktModuleId[] {
  return modules
    .filter((module) => module.enabled)
    .map((module) => module.id);
}

function isEnabled(
  enabledModuleIds: Set<OrbiktModuleId>,
  item: { moduleId: OrbiktModuleId }
) {
  return enabledModuleIds.has(item.moduleId);
}

export function buildDashboardViewModel(
  modules: OrbiktModule[],
  data: DashboardData
) {
  const enabledModules = modules.filter((module) => module.enabled);
  const enabledModuleIds = new Set(enabledModules.map((module) => module.id));

  return {
    enabledModules,
    todayHighlights: data.todayHighlights.filter((item) =>
      isEnabled(enabledModuleIds, item)
    ),
    kpis: data.kpis.filter((item) => isEnabled(enabledModuleIds, item)),
    moduleWidgets: data.moduleWidgets.filter((item) =>
      isEnabled(enabledModuleIds, item)
    ),
    eisenhowerQuadrants: data.eisenhowerQuadrants.map((quadrant) => ({
      ...quadrant,
      tasks: quadrant.tasks.filter((task) => isEnabled(enabledModuleIds, task)),
    })),
    recentActivities: data.recentActivities.filter((item) =>
      isEnabled(enabledModuleIds, item)
    ),
    quickActions: data.quickActions.filter((item) =>
      isEnabled(enabledModuleIds, item)
    ),
    chartSeries: data.chartSeries.filter((item) =>
      isEnabled(enabledModuleIds, item)
    ),
    donutSlices: data.donutSlices.filter((item) =>
      isEnabled(enabledModuleIds, item)
    ),
    aiSuggestion: data.aiSuggestion,
  };
}
