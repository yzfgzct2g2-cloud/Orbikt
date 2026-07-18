import { describe, expect, it } from "vitest";
import { applyFilters, defaultFilters } from "./calendarFilters";
import { buildEvent, completeEvent, cancelEvent, type NewEventInput } from "./calendarDomain";
import type { CalendarEvent } from "../../adapters/types";

const NOW = "2026-07-18T02:00:00.000Z";

function make(overrides: Partial<NewEventInput> = {}, mutate?: (e: CalendarEvent) => CalendarEvent): CalendarEvent {
  const input: NewEventInput = {
    title: "事件",
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
  const e = buildEvent(input, { id: input.ownerId }, NOW);
  return mutate ? mutate(e) : e;
}

const events: CalendarEvent[] = [
  make(), // cm-001 meeting
  make({ ownerId: "cm-002", type: "visit", caseId: "C-0001", caseDisplayName: "王小明" }),
  make({ ownerId: "cm-002", participantIds: ["cm-001"], type: "training" }),
  make({ ownerId: "cm-003" }, (e) => completeEvent(e, { id: "cm-003" }, NOW)),
  make({ ownerId: "cm-003" }, (e) => cancelEvent(e, { id: "cm-003" }, NOW)),
  make({ ownerId: "cm-001" }, (e) => ({ ...e, deletedAt: NOW, deletedBy: "cm-001" })),
];

describe("applyFilters", () => {
  it("default filters hide soft-deleted and cancelled, keep completed", () => {
    const out = applyFilters(events, defaultFilters, "cm-001", NOW);
    expect(out).toHaveLength(4); // 3 open + 1 completed
  });

  it("owner=me matches events I own or participate in", () => {
    const out = applyFilters(events, { ...defaultFilters, owner: "me" }, "cm-001", NOW);
    expect(out.map((e) => e.ownerId).sort()).toEqual(["cm-001", "cm-002"]);
  });

  it("owner=<memberId> filters a specific member", () => {
    const out = applyFilters(events, { ...defaultFilters, owner: "cm-002" }, "cm-001", NOW);
    expect(out).toHaveLength(2);
  });

  it("type filter", () => {
    const out = applyFilters(events, { ...defaultFilters, types: ["visit"] }, "cm-001", NOW);
    expect(out).toHaveLength(1);
    expect(out[0].type).toBe("visit");
  });

  it("case-related / non-case filter", () => {
    const withCase = applyFilters(events, { ...defaultFilters, caseRelation: "case" }, "cm-001", NOW);
    expect(withCase).toHaveLength(1);
    expect(withCase[0].caseId).toBe("C-0001");
    const nonCase = applyFilters(events, { ...defaultFilters, caseRelation: "non-case" }, "cm-001", NOW);
    expect(nonCase.every((e) => !e.caseId)).toBe(true);
  });

  it("showCompleted toggle hides completed events", () => {
    const out = applyFilters(events, { ...defaultFilters, showCompleted: false }, "cm-001", NOW);
    expect(out.some((e) => e.status === "completed")).toBe(false);
  });

  it("showCancelled toggle reveals cancelled events", () => {
    const out = applyFilters(events, { ...defaultFilters, showCancelled: true }, "cm-001", NOW);
    expect(out.some((e) => e.status === "cancelled")).toBe(true);
  });
});
