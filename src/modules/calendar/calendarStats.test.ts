import { describe, expect, it } from "vitest";
import { teamProgress } from "./calendarStats";
import { buildEvent, completeEvent, type NewEventInput } from "./calendarDomain";
import type { CalendarEvent } from "../../adapters/types";

const TODAY = "2026-07-18";
const NOW = "2026-07-18T02:00:00.000Z"; // 10:00 Taipei

function make(overrides: Partial<NewEventInput> = {}, mutate?: (e: CalendarEvent) => CalendarEvent): CalendarEvent {
  const input: NewEventInput = {
    title: "事件",
    description: "",
    type: "meeting",
    date: TODAY,
    startTime: "13:00",
    endTime: "14:00",
    allDay: false,
    ownerId: "cm-001",
    participantIds: [],
    caseId: null,
    ...overrides,
  };
  const e = buildEvent(input, { id: input.ownerId }, NOW);
  return mutate ? mutate(e) : e;
}

const team = [
  { id: "cm-001", name: "房立泓" },
  { id: "cm-002", name: "江睿儀" },
];

describe("teamProgress", () => {
  it("counts today / open / overdue / week per member", () => {
    const events = [
      make(), // today, open
      make({ date: "2026-07-10", startTime: "09:00", endTime: "10:00" }), // past → overdue
      make({ date: "2026-07-13" }, (e) => completeEvent(e, { id: "cm-001" }, NOW)), // this week, done
      make({ ownerId: "cm-002", date: "2026-08-01" }), // next month
    ];
    const [a, b] = teamProgress(events, team, TODAY, NOW);
    expect(a).toMatchObject({
      memberId: "cm-001",
      todayCount: 1,
      openCount: 2,
      overdueCount: 1,
      weekCount: 2, // today + completed Monday event (2026-07-13)
    });
    expect(b).toMatchObject({ memberId: "cm-002", todayCount: 0, openCount: 1, weekCount: 0 });
  });

  it("participant events count toward the participant too", () => {
    const events = [make({ ownerId: "cm-001", participantIds: ["cm-002"] })];
    const [, b] = teamProgress(events, team, TODAY, NOW);
    expect(b.todayCount).toBe(1);
  });

  it("soft-deleted events are excluded", () => {
    const events = [make({}, (e) => ({ ...e, deletedAt: NOW }))];
    const [a] = teamProgress(events, team, TODAY, NOW);
    expect(a.openCount).toBe(0);
    expect(a.todayCount).toBe(0);
  });
});
