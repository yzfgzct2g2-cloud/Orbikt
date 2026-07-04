// FA310 ↔ CS100 case-manager matching rule.
//
// RULE (see docs/DATA_MATCHING.md):
//  - When BOTH FA310 and CS100 are available, the responsible case manager is
//    determined PRIMARILY from FA310. CS100 is a secondary reference.
//  - FA310's manager field contains a NATIONAL ID; CS100's manager field
//    contains a manager NAME. To resolve a manager from an FA310 national ID we
//    match the raw ID (import-time only) to the case, then take the manager
//    name from CS100 / the team name map.
//  - The RAW national ID may exist ONLY during import-time processing. Browser
//    data must only expose maskedNationalId. This module therefore has two
//    layers: a pure resolver used at import time, and a browser-safe view that
//    never touches raw IDs.

import type { CaseRecord, Manager } from "../../adapters/types";
import { team } from "../../config/appConfig";

export interface ManagerAssignment {
  caseId: string;
  managerId: string | null;
  managerName: string;
  source: "fa310" | "cs100" | "unresolved";
}

/**
 * IMPORT-TIME resolver. Given an FA310 raw national ID and a lookup from raw ID
 * -> caseId (built during import from the raw CS100 file), resolve the manager,
 * preferring FA310 mapping and falling back to the CS100 name map. The raw ID
 * passed here must be discarded by the caller after use; it is never returned.
 */
export function resolveManagerAtImport(
  rawNationalId: string,
  rawIdToCaseId: Map<string, string>,
  caseIdToManagerName: Map<string, string>,
  fa310IdToManagerName?: Map<string, string>
): ManagerAssignment {
  const caseId = rawIdToCaseId.get(rawNationalId) ?? "";
  // Primary: FA310 supplies the responsible manager for this ID.
  const fa310Name = fa310IdToManagerName?.get(rawNationalId);
  if (caseId && fa310Name) {
    return { caseId, managerId: managerIdByName(fa310Name), managerName: fa310Name, source: "fa310" };
  }
  // Secondary: CS100 manager name for the matched case.
  if (caseId) {
    const cs100Name = caseIdToManagerName.get(caseId);
    if (cs100Name)
      return { caseId, managerId: managerIdByName(cs100Name), managerName: cs100Name, source: "cs100" };
  }
  return { caseId, managerId: null, managerName: "未指派", source: "unresolved" };
}

function managerIdByName(name: string): string | null {
  return team.find((m: Manager) => m.name === name)?.id ?? null;
}

/**
 * BROWSER-SAFE manager view for a case. Never touches raw IDs — reads the
 * already-assigned managerId on the (sanitized) case record and resolves the
 * display name from team.json. Exposes only maskedNationalId for identity.
 */
export function caseManagerView(c: CaseRecord): {
  managerId: string;
  managerName: string;
  maskedNationalId: string;
} {
  const m = team.find((t: Manager) => t.id === c.managerId);
  return {
    managerId: c.managerId,
    managerName: m?.name ?? "未指派",
    maskedNationalId: c.maskedNationalId ?? "—",
  };
}
