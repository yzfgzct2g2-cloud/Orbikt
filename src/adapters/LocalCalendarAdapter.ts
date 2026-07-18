// LocalCalendarAdapter — V1 Team Calendar persistence.
//
// Stores manual events as JSON in browser localStorage so they survive a
// reload. THIS IS EXPLICITLY NOT A SHARED MULTI-USER BACKEND: data lives per
// browser profile. The CalendarAdapter seam is the upgrade path to Supabase /
// an API with server-side authorization. See DECISIONS.md > Team Calendar.
//
// Storage is injectable so tests (node environment) run against an in-memory
// stub and so a future SSR context cannot crash on a missing localStorage.

import type { CalendarAdapter, CalendarEventQuery } from "./CalendarAdapter";
import type { CalendarEvent } from "./types";
import { taipeiDateOf } from "../modules/calendar/calendarDates";

export interface KeyValueStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

const STORAGE_KEY = "orbikt.team-calendar.events.v1";

class MemoryStorage implements KeyValueStorage {
  private map = new Map<string, string>();
  getItem(key: string): string | null {
    return this.map.get(key) ?? null;
  }
  setItem(key: string, value: string): void {
    this.map.set(key, value);
  }
}

function defaultStorage(): KeyValueStorage {
  try {
    const ls = (globalThis as { localStorage?: KeyValueStorage }).localStorage;
    if (ls) {
      // Probe: some environments expose localStorage but throw on use.
      ls.getItem(STORAGE_KEY);
      return ls;
    }
  } catch {
    // fall through to memory
  }
  return new MemoryStorage();
}

function overlapsRange(e: CalendarEvent, from?: string, to?: string): boolean {
  const start = taipeiDateOf(e.startAt);
  const end = taipeiDateOf(e.endAt);
  if (from && end < from) return false;
  if (to && start > to) return false;
  return true;
}

export class LocalCalendarAdapter implements CalendarAdapter {
  readonly kind = "local" as const;
  private storage: KeyValueStorage;

  constructor(storage: KeyValueStorage = defaultStorage()) {
    this.storage = storage;
  }

  private read(): CalendarEvent[] {
    const raw = this.storage.getItem(STORAGE_KEY);
    if (!raw) return [];
    try {
      const parsed: unknown = JSON.parse(raw);
      return Array.isArray(parsed) ? (parsed as CalendarEvent[]) : [];
    } catch {
      // Corrupt storage must not take the calendar down; surface empty and
      // let the next write repair it.
      return [];
    }
  }

  private write(events: CalendarEvent[]): void {
    this.storage.setItem(STORAGE_KEY, JSON.stringify(events));
  }

  async listEvents(query: CalendarEventQuery = {}): Promise<CalendarEvent[]> {
    return this.read()
      .filter((e) => (query.includeDeleted ? true : !e.deletedAt))
      .filter((e) => (query.ownerId ? e.ownerId === query.ownerId : true))
      .filter((e) => overlapsRange(e, query.from, query.to))
      .sort((a, b) => (a.startAt < b.startAt ? -1 : 1));
  }

  async getEvent(id: string): Promise<CalendarEvent | null> {
    return this.read().find((e) => e.id === id) ?? null;
  }

  async createEvent(event: CalendarEvent): Promise<CalendarEvent> {
    if (event.source !== "manual") {
      throw new Error("系統來源事件為唯讀投影，不可寫入行事曆儲存。");
    }
    const events = this.read();
    if (events.some((e) => e.id === event.id)) {
      throw new Error(`事件 id 重複：${event.id}`);
    }
    events.push(event);
    this.write(events);
    return event;
  }

  async updateEvent(event: CalendarEvent): Promise<CalendarEvent> {
    if (event.source !== "manual") {
      throw new Error("系統來源事件為唯讀投影，不可修改。");
    }
    const events = this.read();
    const idx = events.findIndex((e) => e.id === event.id);
    if (idx === -1) throw new Error(`找不到事件：${event.id}`);
    events[idx] = event;
    this.write(events);
    return event;
  }

  async softDeleteEvent(id: string, byUserId: string, atISO: string): Promise<CalendarEvent> {
    const events = this.read();
    const idx = events.findIndex((e) => e.id === id);
    if (idx === -1) throw new Error(`找不到事件：${id}`);
    const updated: CalendarEvent = {
      ...events[idx],
      deletedAt: atISO,
      deletedBy: byUserId,
      updatedAt: atISO,
      updatedBy: byUserId,
    };
    events[idx] = updated;
    this.write(events);
    return updated;
  }

  async restoreEvent(id: string, byUserId: string, atISO: string): Promise<CalendarEvent> {
    const events = this.read();
    const idx = events.findIndex((e) => e.id === id);
    if (idx === -1) throw new Error(`找不到事件：${id}`);
    const updated: CalendarEvent = {
      ...events[idx],
      deletedAt: null,
      deletedBy: null,
      updatedAt: atISO,
      updatedBy: byUserId,
    };
    events[idx] = updated;
    this.write(events);
    return updated;
  }
}
