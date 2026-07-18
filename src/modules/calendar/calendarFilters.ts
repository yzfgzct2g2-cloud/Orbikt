// Team Calendar filter model (pure, unit-tested).

import type { CalendarEvent, CalendarEventType } from "../../adapters/types";
import { effectiveStatus } from "./calendarDomain";

export type OwnerFilter = "all" | "me" | string; // string = a specific member id
export type CaseFilter = "all" | "case" | "non-case";

export interface CalendarFilters {
  owner: OwnerFilter;
  types: CalendarEventType[]; // empty = all types
  caseRelation: CaseFilter;
  showCompleted: boolean;
  showCancelled: boolean;
}

export const defaultFilters: CalendarFilters = {
  owner: "all",
  types: [],
  caseRelation: "all",
  showCompleted: true,
  showCancelled: false,
};

/**
 * Apply filters. Soft-deleted events are ALWAYS excluded here — the
 * supervisor restore panel lists them through a separate query.
 */
export function applyFilters(
  events: CalendarEvent[],
  filters: CalendarFilters,
  currentUserId: string,
  nowISO: string
): CalendarEvent[] {
  return events.filter((e) => {
    if (e.deletedAt) return false;
    if (filters.owner === "me") {
      if (e.ownerId !== currentUserId && !e.participantIds.includes(currentUserId)) return false;
    } else if (filters.owner !== "all") {
      if (e.ownerId !== filters.owner && !e.participantIds.includes(filters.owner)) return false;
    }
    if (filters.types.length > 0 && !filters.types.includes(e.type)) return false;
    if (filters.caseRelation === "case" && !e.caseId) return false;
    if (filters.caseRelation === "non-case" && e.caseId) return false;
    const status = effectiveStatus(e, nowISO);
    if (!filters.showCompleted && status === "completed") return false;
    if (!filters.showCancelled && status === "cancelled") return false;
    return true;
  });
}
