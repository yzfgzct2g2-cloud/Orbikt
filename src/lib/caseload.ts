// Caseload aggregation for the Command Center.
//
// team.json is the caseload *reference*; the adapter's case set is the live
// count. This helper reports both per manager so the dashboard can show the
// actual assigned load against the reference.

import type { CaseRecord, Manager } from "../adapters/types";

export interface ManagerCaseload {
  managerId: string;
  name: string;
  reference: number; // from team.json
  assigned: number; // actual count in the current case set
}

export function caseloadByManager(
  cases: CaseRecord[],
  team: Manager[]
): ManagerCaseload[] {
  const counts = new Map<string, number>();
  for (const c of cases) {
    counts.set(c.managerId, (counts.get(c.managerId) ?? 0) + 1);
  }
  return team.map((m) => ({
    managerId: m.id,
    name: m.name,
    reference: m.caseload,
    assigned: counts.get(m.id) ?? 0,
  }));
}
