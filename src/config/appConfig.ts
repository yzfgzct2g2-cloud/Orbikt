// Typed access to the repository config files.
//
// The JSON files under /config are the authoring source of truth. We import
// them directly (Zero Duplicate Input) rather than re-typing their contents.

import teamJson from "../../config/team.json";
import integrationsJson from "../../config/integrations.json";
import sourceSystemsJson from "../../config/source-systems.json";
import type { Manager } from "../adapters/types";

export const team = teamJson as Manager[];

export interface IntegrationEntry {
  type: string;
  status: string;
  integration?: string;
  future?: string;
  description: string;
}

export interface IntegrationsConfig {
  dispatch: IntegrationEntry;
  visitManager: IntegrationEntry;
  genogram: IntegrationEntry;
  onedrive: IntegrationEntry;
}

export const integrations = integrationsJson as IntegrationsConfig;

export interface SourceSystems {
  available: string[];
  external: string[];
  prototype: string[];
  missing_or_pending: string[];
}

export const sourceSystems = sourceSystemsJson as SourceSystems;

export function managerById(id: string): Manager | undefined {
  return team.find((m) => m.id === id);
}

export function managerName(id: string): string {
  return managerById(id)?.name ?? "未指派";
}
