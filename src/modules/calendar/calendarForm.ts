// Event form model + validation (pure, unit-tested). The React form renders
// these errors verbatim; keeping rules here keeps them testable in node.

import type { CalendarEventStatus, CalendarEventType, CaseRecord } from "../../adapters/types";
import type { NewEventInput } from "./calendarDomain";
import { inputTimes, timesValid } from "./calendarDomain";

export interface EventFormValues {
  title: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  allDay: boolean;
  type: CalendarEventType;
  status: CalendarEventStatus;
  ownerId: string;
  participantIds: string[];
  caseId: string; // "" = 不連結個案
  location: string;
  description: string;
}

export function emptyForm(today: string, ownerId: string): EventFormValues {
  return {
    title: "",
    date: today,
    startTime: "09:00",
    endTime: "10:00",
    allDay: false,
    type: "meeting",
    status: "scheduled",
    ownerId,
    participantIds: [],
    caseId: "",
    location: "",
    description: "",
  };
}

export type FormErrors = Partial<Record<keyof EventFormValues, string>>;

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^\d{2}:\d{2}$/;

export function validateForm(values: EventFormValues): FormErrors {
  const errors: FormErrors = {};
  if (!values.title.trim()) errors.title = "請輸入標題";
  if (!DATE_RE.test(values.date)) errors.date = "請選擇日期";
  if (!values.ownerId) errors.ownerId = "請選擇負責人";
  if (!values.allDay) {
    if (!TIME_RE.test(values.startTime)) errors.startTime = "請輸入開始時間";
    if (!TIME_RE.test(values.endTime)) errors.endTime = "請輸入結束時間";
    if (!errors.date && !errors.startTime && !errors.endTime) {
      const { startAt, endAt } = inputTimes(values);
      if (!timesValid(startAt, endAt)) errors.endTime = "結束時間不得早於開始時間";
    }
  }
  return errors;
}

/**
 * Convert validated form values into a domain input. The case link carries
 * only browser-safe identity (case name + CaseID) — never raw identifiers.
 */
export function toEventInput(
  values: EventFormValues,
  findCase: (id: string) => CaseRecord | undefined
): NewEventInput {
  const linked = values.caseId ? findCase(values.caseId) : undefined;
  return {
    title: values.title,
    description: values.description,
    type: values.type,
    status: values.status,
    date: values.date,
    startTime: values.startTime,
    endTime: values.endTime,
    allDay: values.allDay,
    ownerId: values.ownerId,
    participantIds: values.participantIds,
    caseId: linked ? linked.id : null,
    caseDisplayName: linked?.name,
    location: values.location.trim() || undefined,
  };
}
