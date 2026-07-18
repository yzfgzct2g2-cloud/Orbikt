// Team Calendar store (Zustand). Wraps the CalendarAdapter and applies the
// permission guards before every mutation — the store is the single write
// path, so a component can never bypass a rule by accident.
//
// V1 persistence = LocalCalendarAdapter (browser-local). NOT a shared
// multi-user backend; see DECISIONS.md > Team Calendar.

import { create } from "zustand";
import { calendarAdapter } from "../adapters";
import type { CalendarEvent } from "../adapters/types";
import type { CalendarView } from "../modules/calendar/calendarGrid";
import { navigate as navigateAnchor } from "../modules/calendar/calendarGrid";
import type { CalendarFilters } from "../modules/calendar/calendarFilters";
import { defaultFilters } from "../modules/calendar/calendarFilters";
import type { NewEventInput } from "../modules/calendar/calendarDomain";
import {
  buildEvent,
  cancelEvent,
  completeEvent,
  inputTimes,
  reopenEvent,
  timesValid,
} from "../modules/calendar/calendarDomain";
import {
  canCancelEvent,
  canCompleteEvent,
  canCreateEventFor,
  canEditEvent,
  canRestoreEvent,
  canSoftDeleteEvent,
  type CalendarActor,
} from "../modules/calendar/calendarPermissions";
import { nowISO, todayTaipei } from "../modules/calendar/calendarDates";

export type SaveState = "idle" | "saving" | "saved" | "error";

interface CalendarState {
  events: CalendarEvent[]; // manual events incl. soft-deleted (views filter)
  loaded: boolean;
  view: CalendarView;
  anchorDate: string; // YYYY-MM-DD (Asia/Taipei)
  filters: CalendarFilters;
  saveState: SaveState;
  error: string | null;

  load: () => Promise<void>;
  setView: (view: CalendarView) => void;
  setFilters: (patch: Partial<CalendarFilters>) => void;
  goToday: () => void;
  goNext: () => void;
  goPrev: () => void;
  setAnchorDate: (date: string) => void;

  createEvent: (input: NewEventInput, actor: CalendarActor) => Promise<CalendarEvent | null>;
  updateEvent: (
    event: CalendarEvent,
    input: NewEventInput,
    actor: CalendarActor
  ) => Promise<CalendarEvent | null>;
  completeEvent: (id: string, actor: CalendarActor) => Promise<void>;
  reopenEvent: (id: string, actor: CalendarActor) => Promise<void>;
  cancelEvent: (id: string, actor: CalendarActor) => Promise<void>;
  softDeleteEvent: (id: string, actor: CalendarActor) => Promise<void>;
  restoreEvent: (id: string, actor: CalendarActor) => Promise<void>;
}

function fail(set: (s: Partial<CalendarState>) => void, message: string): null {
  set({ saveState: "error", error: message });
  return null;
}

export const useCalendarStore = create<CalendarState>((set, get) => ({
  events: [],
  loaded: false,
  view: "month",
  anchorDate: todayTaipei(),
  filters: defaultFilters,
  saveState: "idle",
  error: null,

  load: async () => {
    const events = await calendarAdapter.listEvents({ includeDeleted: true });
    set({ events, loaded: true });
  },

  setView: (view) => set({ view }),
  setFilters: (patch) => set((s) => ({ filters: { ...s.filters, ...patch } })),
  goToday: () => set({ anchorDate: todayTaipei() }),
  goNext: () =>
    set((s) => ({ anchorDate: navigateAnchor(s.view, s.anchorDate, 1) })),
  goPrev: () =>
    set((s) => ({ anchorDate: navigateAnchor(s.view, s.anchorDate, -1) })),
  setAnchorDate: (date) => set({ anchorDate: date }),

  createEvent: async (input, actor) => {
    if (!canCreateEventFor(actor, input.ownerId)) {
      return fail(set, "沒有權限為其他成員建立事件");
    }
    const { startAt, endAt } = inputTimes(input);
    if (!timesValid(startAt, endAt)) {
      return fail(set, "結束時間不得早於開始時間");
    }
    set({ saveState: "saving", error: null });
    try {
      const event = buildEvent(input, actor, nowISO());
      await calendarAdapter.createEvent(event);
      set((s) => ({ events: [...s.events, event], saveState: "saved" }));
      return event;
    } catch (err) {
      return fail(set, err instanceof Error ? err.message : "儲存失敗");
    }
  },

  updateEvent: async (event, input, actor) => {
    if (!canEditEvent(actor, event)) {
      return fail(set, "沒有權限修改此事件");
    }
    const { startAt, endAt } = inputTimes(input);
    if (!timesValid(startAt, endAt)) {
      return fail(set, "結束時間不得早於開始時間");
    }
    set({ saveState: "saving", error: null });
    try {
      const updated: CalendarEvent = {
        ...event,
        title: input.title.trim(),
        description: input.description.trim(),
        type: input.type,
        status: input.status ?? event.status,
        startAt,
        endAt,
        allDay: input.allDay,
        ownerId: input.ownerId,
        participantIds: input.participantIds.filter((p) => p !== input.ownerId),
        caseId: input.caseId,
        caseDisplayName: input.caseDisplayName,
        location: input.location,
        updatedBy: actor.id,
        updatedAt: nowISO(),
      };
      await calendarAdapter.updateEvent(updated);
      set((s) => ({
        events: s.events.map((e) => (e.id === updated.id ? updated : e)),
        saveState: "saved",
      }));
      return updated;
    } catch (err) {
      return fail(set, err instanceof Error ? err.message : "儲存失敗");
    }
  },

  completeEvent: async (id, actor) => {
    const event = get().events.find((e) => e.id === id);
    if (!event || !canCompleteEvent(actor, event)) {
      fail(set, "沒有權限完成此事件");
      return;
    }
    const updated = completeEvent(event, actor, nowISO());
    await calendarAdapter.updateEvent(updated);
    set((s) => ({
      events: s.events.map((e) => (e.id === id ? updated : e)),
      saveState: "saved",
      error: null,
    }));
  },

  reopenEvent: async (id, actor) => {
    const event = get().events.find((e) => e.id === id);
    if (!event || !canCompleteEvent(actor, event)) {
      fail(set, "沒有權限變更此事件");
      return;
    }
    const updated = reopenEvent(event, actor, nowISO());
    await calendarAdapter.updateEvent(updated);
    set((s) => ({
      events: s.events.map((e) => (e.id === id ? updated : e)),
      saveState: "saved",
      error: null,
    }));
  },

  cancelEvent: async (id, actor) => {
    const event = get().events.find((e) => e.id === id);
    if (!event || !canCancelEvent(actor, event)) {
      fail(set, "沒有權限取消此事件");
      return;
    }
    const updated = cancelEvent(event, actor, nowISO());
    await calendarAdapter.updateEvent(updated);
    set((s) => ({
      events: s.events.map((e) => (e.id === id ? updated : e)),
      saveState: "saved",
      error: null,
    }));
  },

  softDeleteEvent: async (id, actor) => {
    const event = get().events.find((e) => e.id === id);
    if (!event || !canSoftDeleteEvent(actor, event)) {
      fail(set, "沒有權限刪除此事件");
      return;
    }
    const updated = await calendarAdapter.softDeleteEvent(id, actor.id, nowISO());
    set((s) => ({
      events: s.events.map((e) => (e.id === id ? updated : e)),
      saveState: "saved",
      error: null,
    }));
  },

  restoreEvent: async (id, actor) => {
    const event = get().events.find((e) => e.id === id);
    if (!event || !canRestoreEvent(actor, event)) {
      fail(set, "沒有權限復原此事件");
      return;
    }
    const updated = await calendarAdapter.restoreEvent(id, actor.id, nowISO());
    set((s) => ({
      events: s.events.map((e) => (e.id === id ? updated : e)),
      saveState: "saved",
      error: null,
    }));
  },
}));
