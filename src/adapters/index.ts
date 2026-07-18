// Adapter selection. V1 = CS100 seed (sanitized from mock-data/CS100.xlsx).
// The rest of the app imports `dataAdapter` only, so switching to Supabase/live
// later is a one-line change here.

import type { DataAdapter } from "./DataAdapter";
import { Cs100DataAdapter } from "./Cs100DataAdapter";
import type { CalendarAdapter } from "./CalendarAdapter";
import { LocalCalendarAdapter } from "./LocalCalendarAdapter";

export const dataAdapter: DataAdapter = new Cs100DataAdapter();

// Team Calendar V1 persistence = browser-local (per profile), NOT a shared
// multi-user backend. Swapping to Supabase/API later is a one-line change here.
export const calendarAdapter: CalendarAdapter = new LocalCalendarAdapter();

export type { DataAdapter } from "./DataAdapter";
export type { CalendarAdapter, CalendarEventQuery } from "./CalendarAdapter";
export * from "./types";
