export type OrbiktModuleCategory =
  | "care"
  | "finance"
  | "project"
  | "knowledge"
  | "analytics";

export type OrbiktModuleId = OrbiktModuleCategory;

export type OrbiktModule = {
  id: OrbiktModuleId;
  name: string;
  description: string;
  category: OrbiktModuleCategory;
  enabled: boolean;
  icon: string;
  color: string;
  softColor: string;
  routes: string[];
  dashboardWidgets: string[];
  quickActions: string[];
  aiCapabilities: string[];
};
