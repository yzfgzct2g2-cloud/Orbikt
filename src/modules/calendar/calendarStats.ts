// Team progress summary (pure, unit-tested).
//
// Purpose is WORK COORDINATION — counts only, no performance scoring or
// ranking (product decision, see the objective brief).

import type { CalendarEvent, Manager } from "../../adapters/types";
import { effectiveStatus, isOpen, occursOn } from "./calendarDomain";
import { addDays, startOfWeek, taipeiDateOf } from "./calendarDates";

export interface MemberProgress {
  memberId: string;
  name: string;
  todayCount: number; // events occurring today
  openCount: number; // not completed / cancelled / deleted
  overdueCount: number; // derived overdue among open events
  weekCount: number; // events in the current Mon–Sun week
}

export function teamProgress(
  events: CalendarEvent[],
  team: Pick<Manager, "id" | "name">[],
  today: string,
  nowISO: string
): MemberProgress[] {
  const weekFrom = startOfWeek(today);
  const weekTo = addDays(weekFrom, 6);
  const live = events.filter((e) => !e.deletedAt);
  return team.map((m) => {
    const mine = live.filter(
      (e) => e.ownerId === m.id || e.participantIds.includes(m.id)
    );
    const open = mine.filter(isOpen);
    return {
      memberId: m.id,
      name: m.name,
      todayCount: mine.filter((e) => occursOn(e, today)).length,
      openCount: open.length,
      overdueCount: open.filter((e) => effectiveStatus(e, nowISO) === "overdue").length,
      weekCount: mine.filter((e) => {
        const start = taipeiDateOf(e.startAt);
        const end = taipeiDateOf(e.endAt);
        return end >= weekFrom && start <= weekTo;
      }).length,
    };
  });
}
