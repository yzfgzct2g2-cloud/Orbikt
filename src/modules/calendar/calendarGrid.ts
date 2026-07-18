// View-model for the calendar grids (pure, unit-tested).
//
// The React views render exactly what these functions return; keeping the
// date math here (tested in node) follows the repo's logic-first test style.

import {
  addDays,
  addMonths,
  daysInMonth,
  startOfMonth,
  startOfWeek,
} from "./calendarDates";

export type CalendarView = "month" | "week" | "day";

export interface DayCell {
  date: string; // YYYY-MM-DD
  inMonth: boolean;
  isToday: boolean;
}

/**
 * A Monday-first month grid covering the anchor's month. Always whole weeks;
 * 4–6 rows depending on the month.
 */
export function monthGrid(anchorDate: string, today: string): DayCell[][] {
  const first = startOfMonth(anchorDate);
  const gridStart = startOfWeek(first);
  const lastOfMonth = addDays(first, daysInMonth(anchorDate) - 1);
  const weeks: DayCell[][] = [];
  let cursor = gridStart;
  do {
    const week: DayCell[] = [];
    for (let i = 0; i < 7; i++) {
      week.push({
        date: cursor,
        inMonth: cursor >= first && cursor <= lastOfMonth,
        isToday: cursor === today,
      });
      cursor = addDays(cursor, 1);
    }
    weeks.push(week);
  } while (cursor <= lastOfMonth);
  return weeks;
}

/** The 7 dates (Mon–Sun) of the week containing the anchor. */
export function weekDates(anchorDate: string): string[] {
  const monday = startOfWeek(anchorDate);
  return Array.from({ length: 7 }, (_, i) => addDays(monday, i));
}

/** Inclusive visible date range for a view — used to query the adapter. */
export function visibleRange(view: CalendarView, anchorDate: string, today: string): {
  from: string;
  to: string;
} {
  if (view === "day") return { from: anchorDate, to: anchorDate };
  if (view === "week") {
    const days = weekDates(anchorDate);
    return { from: days[0], to: days[6] };
  }
  const weeks = monthGrid(anchorDate, today);
  return { from: weeks[0][0].date, to: weeks[weeks.length - 1][6].date };
}

/** Move the anchor one interval forward/backward for the active view. */
export function navigate(view: CalendarView, anchorDate: string, direction: 1 | -1): string {
  if (view === "month") return addMonths(anchorDate, direction);
  if (view === "week") return addDays(anchorDate, 7 * direction);
  return addDays(anchorDate, direction);
}
