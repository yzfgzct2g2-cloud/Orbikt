import { describe, expect, it } from "vitest";
import type { CalendarEvent, CaseRecord } from "../../adapters/types";
import {
  buildEvent,
  cancelEvent,
  completeEvent,
  deriveVisitEvents,
  effectiveStatus,
  inputTimes,
  isOpen,
  isSystemEvent,
  occursOn,
  reopenEvent,
  timesValid,
  type NewEventInput,
} from "./calendarDomain";

const NOW = "2026-07-18T02:00:00.000Z"; // 10:00 Asia/Taipei
const actor = { id: "cm-001" };

export function baseInput(overrides: Partial<NewEventInput> = {}): NewEventInput {
  return {
    title: "個案研討會",
    description: "月會",
    type: "meeting",
    date: "2026-07-20",
    startTime: "14:00",
    endTime: "15:00",
    allDay: false,
    ownerId: "cm-001",
    participantIds: ["cm-002"],
    caseId: null,
    ...overrides,
  };
}

describe("buildEvent", () => {
  it("creates a valid manual event with audit fields", () => {
    const e = buildEvent(baseInput(), actor, NOW);
    expect(e.source).toBe("manual");
    expect(e.status).toBe("scheduled");
    expect(e.startAt).toBe("2026-07-20T14:00:00+08:00");
    expect(e.endAt).toBe("2026-07-20T15:00:00+08:00");
    expect(e.createdBy).toBe("cm-001");
    expect(e.updatedBy).toBe("cm-001");
    expect(e.createdAt).toBe(NOW);
    expect(e.deletedAt).toBeNull();
  });

  it("rejects end time earlier than start time", () => {
    expect(() =>
      buildEvent(baseInput({ startTime: "15:00", endTime: "14:00" }), actor, NOW)
    ).toThrow("結束時間不得早於開始時間");
  });

  it("all-day events span the whole Taipei day and ignore times", () => {
    const e = buildEvent(
      baseInput({ allDay: true, startTime: "23:00", endTime: "01:00" }),
      actor,
      NOW
    );
    expect(e.startAt).toBe("2026-07-20T00:00:00+08:00");
    expect(e.endAt).toBe("2026-07-20T23:59:00+08:00");
    expect(e.allDay).toBe(true);
  });

  it("keeps the owner out of the participant list", () => {
    const e = buildEvent(
      baseInput({ participantIds: ["cm-001", "cm-002"] }),
      actor,
      NOW
    );
    expect(e.participantIds).toEqual(["cm-002"]);
  });

  it("carries the case link (id + display name only)", () => {
    const e = buildEvent(
      baseInput({ caseId: "C-0001", caseDisplayName: "王小明" }),
      actor,
      NOW
    );
    expect(e.caseId).toBe("C-0001");
    expect(e.caseDisplayName).toBe("王小明");
  });

  it("generates unique ids", () => {
    const a = buildEvent(baseInput(), actor, NOW);
    const b = buildEvent(baseInput(), actor, NOW);
    expect(a.id).not.toBe(b.id);
  });
});

describe("timesValid / inputTimes", () => {
  it("accepts equal start and end", () => {
    expect(timesValid("2026-07-20T14:00:00+08:00", "2026-07-20T14:00:00+08:00")).toBe(true);
  });
  it("all-day input normalizes to a full day", () => {
    const { startAt, endAt } = inputTimes({
      date: "2026-07-20",
      startTime: "10:00",
      endTime: "09:00",
      allDay: true,
    });
    expect(timesValid(startAt, endAt)).toBe(true);
  });
});

describe("status transitions", () => {
  const e = buildEvent(baseInput(), actor, NOW);

  it("completeEvent records completedAt and the actor", () => {
    const done = completeEvent(e, { id: "cm-002" }, NOW);
    expect(done.status).toBe("completed");
    expect(done.completedAt).toBe(NOW);
    expect(done.updatedBy).toBe("cm-002");
  });

  it("reopenEvent clears completion", () => {
    const done = completeEvent(e, actor, NOW);
    const reopened = reopenEvent(done, actor, NOW);
    expect(reopened.status).toBe("scheduled");
    expect(reopened.completedAt).toBeNull();
  });

  it("cancelEvent sets cancelled", () => {
    expect(cancelEvent(e, actor, NOW).status).toBe("cancelled");
  });
});

describe("effectiveStatus (derived overdue)", () => {
  it("scheduled event past its end is overdue at read time", () => {
    const e = buildEvent(baseInput({ date: "2026-07-10" }), actor, NOW);
    expect(e.status).toBe("scheduled"); // stored value untouched
    expect(effectiveStatus(e, NOW)).toBe("overdue");
  });

  it("future scheduled event stays scheduled", () => {
    const e = buildEvent(baseInput({ date: "2026-07-25" }), actor, NOW);
    expect(effectiveStatus(e, NOW)).toBe("scheduled");
  });

  it("completed and cancelled events never become overdue", () => {
    const past = buildEvent(baseInput({ date: "2026-07-10" }), actor, NOW);
    expect(effectiveStatus(completeEvent(past, actor, NOW), NOW)).toBe("completed");
    expect(effectiveStatus(cancelEvent(past, actor, NOW), NOW)).toBe("cancelled");
  });
});

describe("isOpen / occursOn", () => {
  it("open excludes completed, cancelled and soft-deleted", () => {
    const e = buildEvent(baseInput(), actor, NOW);
    expect(isOpen(e)).toBe(true);
    expect(isOpen(completeEvent(e, actor, NOW))).toBe(false);
    expect(isOpen(cancelEvent(e, actor, NOW))).toBe(false);
    expect(isOpen({ ...e, deletedAt: NOW })).toBe(false);
  });

  it("occursOn matches the Taipei calendar date", () => {
    const e = buildEvent(baseInput({ date: "2026-07-20" }), actor, NOW);
    expect(occursOn(e, "2026-07-20")).toBe(true);
    expect(occursOn(e, "2026-07-21")).toBe(false);
  });
});

describe("system-source projections (Visit Manager)", () => {
  const cases = [
    {
      id: "C-0001",
      name: "王小明",
      managerId: "cm-002",
      cmsLevel: 4,
      status: "active",
      visit: {
        lastVisitDate: "2026-05-01",
        nextDueDate: "2026-07-21",
        remainingDays: 3,
        status: "within_30",
      },
      dispatch: { status: "accepted", updatedAt: "2026-07-01T10:00:00+08:00" },
      aa01Status: "approved",
      fa310Status: "approved",
      tags: [],
      updatedAt: "2026-07-01T10:00:00+08:00",
      area: "台北市",
    },
    {
      id: "C-0002",
      name: "李阿花",
      managerId: "cm-003",
      cmsLevel: 5,
      status: "active",
      visit: { lastVisitDate: null, nextDueDate: null, remainingDays: null, status: "normal" },
      dispatch: { status: "accepted", updatedAt: "2026-07-01T10:00:00+08:00" },
      aa01Status: "approved",
      fa310Status: "approved",
      tags: [],
      updatedAt: "2026-07-01T10:00:00+08:00",
    },
  ] as CaseRecord[];

  it("projects only cases with a nextDueDate, read-only from reported values", () => {
    const events = deriveVisitEvents(cases);
    expect(events).toHaveLength(1);
    const e = events[0];
    expect(e.source).toBe("visit-manager");
    expect(isSystemEvent(e)).toBe(true);
    expect(e.caseId).toBe("C-0001");
    expect(e.ownerId).toBe("cm-002");
    expect(e.allDay).toBe(true);
    expect(e.startAt).toBe("2026-07-21T00:00:00+08:00");
  });

  it("maps reported overdue status without recomputing windows", () => {
    const overdue = deriveVisitEvents([
      { ...cases[0], visit: { ...cases[0].visit, status: "overdue" } },
    ] as CaseRecord[]);
    expect(overdue[0].status).toBe("overdue");
  });

  it("projection carries no raw identifiers", () => {
    const e = deriveVisitEvents(cases)[0] as CalendarEvent & Record<string, unknown>;
    const json = JSON.stringify(e);
    expect(json).not.toMatch(/[A-Z][12]\d{8}/); // national ID pattern
    expect(e["nationalId"]).toBeUndefined();
    expect(e["phone"]).toBeUndefined();
  });
});
