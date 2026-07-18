import type { CalendarEvent } from "../../adapters/types";

/** Merge persisted manual and derived source events without duplicate ids. */
export function combineCalendarEvents(
  manual: CalendarEvent[],
  source: CalendarEvent[]
): CalendarEvent[] {
  const byId = new Map<string, CalendarEvent>();
  for (const event of [...manual, ...source]) byId.set(event.id, event);
  return [...byId.values()];
}

/** Canonical destination for a case-related calendar event. */
export function eventTarget(event: CalendarEvent): string | null {
  if (!event.caseId) return null;
  if (event.source === "visit-manager") return `/workspace/${event.caseId}/visit`;
  return `/workspace/${event.caseId}`;
}

export type CalendarLayoutMode = "mobile-list" | "calendar-grid";

/** Mirrors the Tailwind `md` breakpoint used by the page. */
export function calendarLayoutMode(width: number): CalendarLayoutMode {
  return width < 768 ? "mobile-list" : "calendar-grid";
}
