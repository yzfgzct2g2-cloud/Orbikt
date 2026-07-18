import { describe, expect, it } from "vitest";
import type { CalendarEvent } from "../../adapters/types";
import { buildEvent, type NewEventInput } from "./calendarDomain";
import {
  canCancelEvent,
  canCompleteEvent,
  canCreateEventFor,
  canEditEvent,
  canLinkCase,
  canReassignOwner,
  canRestoreEvent,
  canSoftDeleteEvent,
  canViewEvent,
  isReadOnlyParticipant,
  managesTeam,
  type CalendarActor,
} from "./calendarPermissions";

const NOW = "2026-07-18T02:00:00.000Z";

const owner: CalendarActor = { id: "cm-001", role: "case_manager" };
const other: CalendarActor = { id: "cm-002", role: "case_manager" };
const participant: CalendarActor = { id: "cm-003", role: "case_manager" };
const supervisor: CalendarActor = { id: "sup-001", role: "supervisor" };
const admin: CalendarActor = { id: "adm-001", role: "admin" };

function manualEvent(overrides: Partial<CalendarEvent> = {}): CalendarEvent {
  const input: NewEventInput = {
    title: "家訪",
    description: "",
    type: "visit",
    date: "2026-07-20",
    startTime: "10:00",
    endTime: "11:00",
    allDay: false,
    ownerId: "cm-001",
    participantIds: ["cm-003"],
    caseId: null,
  };
  return { ...buildEvent(input, { id: "cm-001" }, NOW), ...overrides };
}

const systemEvent = manualEvent({ source: "visit-manager" });
const deletedEvent = manualEvent({ deletedAt: NOW, deletedBy: "cm-001" });

describe("role tiers", () => {
  it("supervisor / director / admin manage the team; case managers do not", () => {
    expect(managesTeam(supervisor)).toBe(true);
    expect(managesTeam({ role: "director" })).toBe(true);
    expect(managesTeam(admin)).toBe(true);
    expect(managesTeam(owner)).toBe(false);
  });
});

describe("view", () => {
  it("everyone can view team events (V1 decision)", () => {
    expect(canViewEvent(other, manualEvent())).toBe(true);
  });
});

describe("create", () => {
  it("case manager may create only their own events", () => {
    expect(canCreateEventFor(owner, "cm-001")).toBe(true);
    expect(canCreateEventFor(owner, "cm-002")).toBe(false);
  });
  it("supervisor may create events for anyone", () => {
    expect(canCreateEventFor(supervisor, "cm-002")).toBe(true);
  });
});

describe("case link", () => {
  it("case manager may link only their assigned case; supervisor may link any case", () => {
    expect(canLinkCase(owner, { managerId: "cm-001" })).toBe(true);
    expect(canLinkCase(owner, { managerId: "cm-002" })).toBe(false);
    expect(canLinkCase(supervisor, { managerId: "cm-002" })).toBe(true);
  });
});

describe("edit", () => {
  it("owner edits own event; another case manager cannot", () => {
    expect(canEditEvent(owner, manualEvent())).toBe(true);
    expect(canEditEvent(other, manualEvent())).toBe(false);
  });
  it("supervisor and admin edit any team event", () => {
    expect(canEditEvent(supervisor, manualEvent())).toBe(true);
    expect(canEditEvent(admin, manualEvent())).toBe(true);
  });
  it("participants are read-only", () => {
    expect(canEditEvent(participant, manualEvent())).toBe(false);
    expect(isReadOnlyParticipant(participant, manualEvent())).toBe(true);
    expect(isReadOnlyParticipant(owner, manualEvent())).toBe(false);
  });
  it("nobody edits system-source events through the calendar", () => {
    expect(canEditEvent(owner, systemEvent)).toBe(false);
    expect(canEditEvent(supervisor, systemEvent)).toBe(false);
  });
  it("soft-deleted events are not editable until restored", () => {
    expect(canEditEvent(supervisor, deletedEvent)).toBe(false);
  });
  it("only managers may reassign the owner", () => {
    expect(canReassignOwner(owner)).toBe(false);
    expect(canReassignOwner(supervisor)).toBe(true);
  });
});

describe("complete / cancel", () => {
  it("follow edit permission", () => {
    expect(canCompleteEvent(owner, manualEvent())).toBe(true);
    expect(canCompleteEvent(other, manualEvent())).toBe(false);
    expect(canCancelEvent(supervisor, manualEvent())).toBe(true);
    expect(canCancelEvent(other, manualEvent())).toBe(false);
  });
  it("system events route back to their source module", () => {
    expect(canCompleteEvent(supervisor, systemEvent)).toBe(false);
    expect(canCancelEvent(owner, systemEvent)).toBe(false);
  });
});

describe("soft delete / restore", () => {
  it("owner may soft-delete own manual event; others may not", () => {
    expect(canSoftDeleteEvent(owner, manualEvent())).toBe(true);
    expect(canSoftDeleteEvent(other, manualEvent())).toBe(false);
  });
  it("supervisor may soft-delete any manual event", () => {
    expect(canSoftDeleteEvent(supervisor, manualEvent())).toBe(true);
  });
  it("system-source events can never be deleted from the calendar", () => {
    expect(canSoftDeleteEvent(owner, systemEvent)).toBe(false);
    expect(canSoftDeleteEvent(supervisor, systemEvent)).toBe(false);
  });
  it("only supervisors restore, and only deleted manual events", () => {
    expect(canRestoreEvent(supervisor, deletedEvent)).toBe(true);
    expect(canRestoreEvent(owner, deletedEvent)).toBe(false);
    expect(canRestoreEvent(supervisor, manualEvent())).toBe(false);
  });
});
