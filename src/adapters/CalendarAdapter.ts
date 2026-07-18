// CalendarAdapter — the seam between the Team Calendar UI and its storage.
//
// V1 ships LocalCalendarAdapter (browser-local persistence). This interface
// reserves the upgrade path to a real shared backend (Supabase / API) without
// UI changes. IMPORTANT: UI-level permissions are NOT a substitute for
// server-side authorization — the future remote adapter must enforce access
// rules on the server (e.g. Supabase RLS). See DECISIONS.md > Team Calendar.
//
// Only `source === "manual"` events are stored here. System-source events
// (visit deadlines etc.) are read-time projections derived in
// calendarDomain.ts — storing them would duplicate source-system SSOT.

import type { CalendarEvent } from "./types";

export interface CalendarEventQuery {
  ownerId?: string;
  /** Inclusive Asia/Taipei calendar date (YYYY-MM-DD). */
  from?: string;
  /** Inclusive Asia/Taipei calendar date (YYYY-MM-DD). */
  to?: string;
  /** Soft-deleted events are excluded unless explicitly requested. */
  includeDeleted?: boolean;
}

export interface CalendarAdapter {
  readonly kind: "local" | "supabase" | "live";

  listEvents(query?: CalendarEventQuery): Promise<CalendarEvent[]>;
  getEvent(id: string): Promise<CalendarEvent | null>;

  /** Rejects non-manual sources — projections are never stored. */
  createEvent(event: CalendarEvent): Promise<CalendarEvent>;
  updateEvent(event: CalendarEvent): Promise<CalendarEvent>;

  // Soft delete only. No hard-delete API exists in V1 by decision.
  softDeleteEvent(id: string, byUserId: string, atISO: string): Promise<CalendarEvent>;
  restoreEvent(id: string, byUserId: string, atISO: string): Promise<CalendarEvent>;
}
