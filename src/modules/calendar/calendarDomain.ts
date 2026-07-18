// Team Calendar domain rules (pure, unit-tested).
//
// SSOT boundary: the calendar coordinates WORK; it never re-implements source
// module business rules. System-source events are derived projections built
// from data AS REPORTED by the source (e.g. Visit Manager's nextDueDate and
// status) — nothing here recomputes warning windows or writes back.

import type {
  CalendarEvent,
  CalendarEventSource,
  CalendarEventStatus,
  CalendarEventType,
  CaseRecord,
} from "../../adapters/types";
import { taipeiDateOf, taipeiISO } from "./calendarDates";

export interface NewEventInput {
  title: string;
  description: string;
  type: CalendarEventType;
  status?: CalendarEventStatus;
  date: string; // YYYY-MM-DD (Asia/Taipei)
  startTime: string; // HH:mm — ignored when allDay
  endTime: string; // HH:mm — ignored when allDay
  allDay: boolean;
  ownerId: string;
  participantIds: string[];
  caseId: string | null;
  caseDisplayName?: string;
  location?: string;
}

export interface ActorRef {
  id: string;
}

export function isSystemEvent(e: Pick<CalendarEvent, "source">): boolean {
  return e.source !== "manual";
}

/** Compute start/end ISO datetimes for an input (all-day spans the whole day). */
export function inputTimes(input: Pick<NewEventInput, "date" | "startTime" | "endTime" | "allDay">): {
  startAt: string;
  endAt: string;
} {
  if (input.allDay) {
    return {
      startAt: taipeiISO(input.date, "00:00"),
      endAt: taipeiISO(input.date, "23:59"),
    };
  }
  return {
    startAt: taipeiISO(input.date, input.startTime),
    endAt: taipeiISO(input.date, input.endTime),
  };
}

/** End must not be earlier than start (equal is allowed for point events). */
export function timesValid(startAt: string, endAt: string): boolean {
  return Date.parse(endAt) >= Date.parse(startAt);
}

let idCounter = 0;
function newEventId(now: string): string {
  idCounter += 1;
  return `cal-${Date.parse(now).toString(36)}-${idCounter.toString(36)}`;
}

/** Build a new MANUAL event. Throws on invalid times — validate in the form first. */
export function buildEvent(input: NewEventInput, actor: ActorRef, atISO: string): CalendarEvent {
  const { startAt, endAt } = inputTimes(input);
  if (!timesValid(startAt, endAt)) {
    throw new Error("結束時間不得早於開始時間");
  }
  return {
    id: newEventId(atISO),
    title: input.title.trim(),
    description: input.description.trim(),
    type: input.type,
    status: input.status ?? "scheduled",
    source: "manual",
    startAt,
    endAt,
    allDay: input.allDay,
    ownerId: input.ownerId,
    participantIds: input.participantIds.filter((p) => p !== input.ownerId),
    caseId: input.caseId,
    caseDisplayName: input.caseDisplayName,
    location: input.location,
    reminderAt: null,
    completedAt: null,
    createdBy: actor.id,
    createdAt: atISO,
    updatedBy: actor.id,
    updatedAt: atISO,
    deletedAt: null,
    deletedBy: null,
  };
}

function touched(e: CalendarEvent, actor: ActorRef, atISO: string): CalendarEvent {
  return { ...e, updatedBy: actor.id, updatedAt: atISO };
}

export function completeEvent(e: CalendarEvent, actor: ActorRef, atISO: string): CalendarEvent {
  return { ...touched(e, actor, atISO), status: "completed", completedAt: atISO };
}

export function reopenEvent(e: CalendarEvent, actor: ActorRef, atISO: string): CalendarEvent {
  return { ...touched(e, actor, atISO), status: "scheduled", completedAt: null };
}

export function cancelEvent(e: CalendarEvent, actor: ActorRef, atISO: string): CalendarEvent {
  return { ...touched(e, actor, atISO), status: "cancelled" };
}

/**
 * Derived status: a scheduled/in-progress event whose end has passed is
 * OVERDUE at read time. No scheduler mutates stored data for this.
 */
export function effectiveStatus(e: CalendarEvent, nowISO: string): CalendarEventStatus {
  if (
    (e.status === "scheduled" || e.status === "in-progress") &&
    Date.parse(e.endAt) < Date.parse(nowISO)
  ) {
    return "overdue";
  }
  return e.status;
}

export function isOpen(e: CalendarEvent): boolean {
  return e.status !== "completed" && e.status !== "cancelled" && !e.deletedAt;
}

/** Events overlapping a Taipei calendar date (inclusive; multi-day safe). */
export function occursOn(e: CalendarEvent, dateISO: string): boolean {
  return taipeiDateOf(e.startAt) <= dateISO && taipeiDateOf(e.endAt) >= dateISO;
}

// --- system-source projections ---------------------------------------------

const visitStatusToCalendar: Record<string, CalendarEventStatus> = {
  overdue: "overdue",
  completed: "completed",
};

/**
 * Project Visit Manager due dates into read-only calendar events. Values are
 * read AS REPORTED (nextDueDate / status); nothing is recomputed or stored.
 * Editing routes back to the source module (the case's visit tab).
 */
export function deriveVisitEvents(cases: CaseRecord[]): CalendarEvent[] {
  const out: CalendarEvent[] = [];
  for (const c of cases) {
    if (!c.visit.nextDueDate) continue;
    const date = c.visit.nextDueDate;
    out.push({
      id: `cal-visit-${c.id}-${date}`,
      title: `${c.name} 家訪到期`,
      description: "來源：Visit Manager（訪視警戒 SSOT）。如需改期請至來源模組。",
      type: "visit",
      status: visitStatusToCalendar[c.visit.status] ?? "scheduled",
      source: "visit-manager" satisfies CalendarEventSource,
      startAt: taipeiISO(date, "00:00"),
      endAt: taipeiISO(date, "23:59"),
      allDay: true,
      ownerId: c.managerId,
      participantIds: [],
      caseId: c.id,
      caseDisplayName: c.name,
      location: c.area,
      reminderAt: null,
      completedAt: null,
      createdBy: "system",
      createdAt: `${date}T00:00:00+08:00`,
      updatedBy: "system",
      updatedAt: c.updatedAt,
      deletedAt: null,
      deletedBy: null,
    });
  }
  return out;
}
