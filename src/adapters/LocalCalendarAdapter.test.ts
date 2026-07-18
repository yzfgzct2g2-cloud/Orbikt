import { beforeEach, describe, expect, it } from "vitest";
import { LocalCalendarAdapter, type KeyValueStorage } from "./LocalCalendarAdapter";
import { buildEvent, type NewEventInput } from "../modules/calendar/calendarDomain";
import type { CalendarEvent } from "./types";

const NOW = "2026-07-18T02:00:00.000Z";

class FakeStorage implements KeyValueStorage {
  map = new Map<string, string>();
  getItem(key: string): string | null {
    return this.map.get(key) ?? null;
  }
  setItem(key: string, value: string): void {
    this.map.set(key, value);
  }
}

function makeEvent(overrides: Partial<NewEventInput> = {}): CalendarEvent {
  const input: NewEventInput = {
    title: "會議",
    description: "",
    type: "meeting",
    date: "2026-07-20",
    startTime: "09:00",
    endTime: "10:00",
    allDay: false,
    ownerId: "cm-001",
    participantIds: [],
    caseId: null,
    ...overrides,
  };
  return buildEvent(input, { id: input.ownerId }, NOW);
}

describe("LocalCalendarAdapter", () => {
  let storage: FakeStorage;
  let adapter: LocalCalendarAdapter;

  beforeEach(() => {
    storage = new FakeStorage();
    adapter = new LocalCalendarAdapter(storage);
  });

  it("create + read round-trip", async () => {
    const e = await adapter.createEvent(makeEvent());
    expect(await adapter.getEvent(e.id)).toEqual(e);
    expect(await adapter.listEvents()).toHaveLength(1);
  });

  it("rejects duplicate ids", async () => {
    const e = await adapter.createEvent(makeEvent());
    await expect(adapter.createEvent(e)).rejects.toThrow("重複");
  });

  it("rejects storing system-source events (projections are read-only)", async () => {
    const sys = { ...makeEvent(), source: "visit-manager" as const };
    await expect(adapter.createEvent(sys)).rejects.toThrow("唯讀投影");
    await expect(adapter.updateEvent(sys)).rejects.toThrow("唯讀投影");
  });

  it("update replaces the stored event", async () => {
    const e = await adapter.createEvent(makeEvent());
    await adapter.updateEvent({ ...e, title: "改過的標題" });
    expect((await adapter.getEvent(e.id))?.title).toBe("改過的標題");
  });

  it("update of a missing event fails loudly", async () => {
    await expect(adapter.updateEvent(makeEvent())).rejects.toThrow("找不到事件");
  });

  it("soft delete hides the event from default listing but keeps it stored", async () => {
    const e = await adapter.createEvent(makeEvent());
    await adapter.softDeleteEvent(e.id, "sup-001", NOW);
    expect(await adapter.listEvents()).toHaveLength(0);
    const all = await adapter.listEvents({ includeDeleted: true });
    expect(all).toHaveLength(1);
    expect(all[0].deletedAt).toBe(NOW);
    expect(all[0].deletedBy).toBe("sup-001");
  });

  it("restore brings a soft-deleted event back", async () => {
    const e = await adapter.createEvent(makeEvent());
    await adapter.softDeleteEvent(e.id, "sup-001", NOW);
    await adapter.restoreEvent(e.id, "sup-001", NOW);
    const restored = await adapter.getEvent(e.id);
    expect(restored?.deletedAt).toBeNull();
    expect(await adapter.listEvents()).toHaveLength(1);
  });

  it("filters by owner", async () => {
    await adapter.createEvent(makeEvent({ ownerId: "cm-001" }));
    await adapter.createEvent(makeEvent({ ownerId: "cm-002" }));
    const mine = await adapter.listEvents({ ownerId: "cm-002" });
    expect(mine).toHaveLength(1);
    expect(mine[0].ownerId).toBe("cm-002");
  });

  it("filters by inclusive Taipei date range", async () => {
    await adapter.createEvent(makeEvent({ date: "2026-07-10" }));
    await adapter.createEvent(makeEvent({ date: "2026-07-20" }));
    await adapter.createEvent(makeEvent({ date: "2026-08-05" }));
    const july = await adapter.listEvents({ from: "2026-07-01", to: "2026-07-31" });
    expect(july).toHaveLength(2);
    const day = await adapter.listEvents({ from: "2026-07-20", to: "2026-07-20" });
    expect(day).toHaveLength(1);
  });

  it("persists across adapter instances (reload survives)", async () => {
    const e = await adapter.createEvent(makeEvent());
    const secondLoad = new LocalCalendarAdapter(storage);
    const events = await secondLoad.listEvents();
    expect(events).toHaveLength(1);
    expect(events[0].id).toBe(e.id);
  });

  it("corrupt storage degrades to empty instead of crashing", async () => {
    storage.setItem("orbikt.team-calendar.events.v1", "not-json{{{");
    expect(await adapter.listEvents()).toEqual([]);
  });

  it("lists events sorted by start time", async () => {
    await adapter.createEvent(makeEvent({ date: "2026-07-22" }));
    await adapter.createEvent(makeEvent({ date: "2026-07-20" }));
    const events = await adapter.listEvents();
    expect(events[0].startAt < events[1].startAt).toBe(true);
  });
});
