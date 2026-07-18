import { describe, expect, it } from "vitest";
import { buildEvent } from "./calendarDomain";
import { calendarLayoutMode, combineCalendarEvents, eventTarget } from "./calendarPage";

const manual = buildEvent(
  {
    title: "團隊會議",
    description: "",
    type: "meeting",
    date: "2026-07-20",
    startTime: "09:00",
    endTime: "10:00",
    allDay: false,
    ownerId: "cm-001",
    participantIds: [],
    caseId: null,
  },
  { id: "cm-001" },
  "2026-07-18T00:00:00.000Z"
);

const source = { ...manual, id: "source", source: "visit-manager" as const, caseId: "C-1" };

describe("calendar page view model", () => {
  it("combines manual and source events without duplicate ids", () => {
    expect(combineCalendarEvents([manual, source], [source])).toEqual([manual, source]);
  });

  it("routes case and Visit Manager events back to their workspace source", () => {
    expect(eventTarget(source)).toBe("/workspace/C-1/visit");
    expect(eventTarget({ ...source, source: "manual" })).toBe("/workspace/C-1");
    expect(eventTarget(manual)).toBeNull();
  });

  it("uses a list-first layout on mobile widths", () => {
    expect(calendarLayoutMode(390)).toBe("mobile-list");
    expect(calendarLayoutMode(1024)).toBe("calendar-grid");
  });
});
