// Team Calendar permission rules (pure, unit-tested).
//
// V1 runs on mock auth, so these are UI/store-level guards on the existing
// role seam. They define the product's permission model but are NOT security:
// the future shared backend must re-enforce them server-side (RLS). See
// DECISIONS.md > Team Calendar.

import type { CalendarEvent, Role } from "../../adapters/types";
import { isSystemEvent } from "./calendarDomain";

export interface CalendarActor {
  id: string;
  role: Role;
}

/** Supervisors, directors and admins manage the whole team's events. */
export function managesTeam(actor: Pick<CalendarActor, "role">): boolean {
  return actor.role === "supervisor" || actor.role === "director" || actor.role === "admin";
}

/** Everyone on the team may see the team's necessary work info (V1 decision). */
export function canViewEvent(_actor: CalendarActor, _e: CalendarEvent): boolean {
  void _actor;
  void _e;
  return true;
}

/** Mock-auth case seam: managers link assigned cases; team managers link any. */
export function canLinkCase(
  actor: CalendarActor,
  target: { managerId: string }
): boolean {
  return managesTeam(actor) || target.managerId === actor.id;
}

/** Case managers may only create events they own; managers may assign anyone. */
export function canCreateEventFor(actor: CalendarActor, ownerId: string): boolean {
  return managesTeam(actor) || actor.id === ownerId;
}

export function canEditEvent(actor: CalendarActor, e: CalendarEvent): boolean {
  if (isSystemEvent(e) || e.deletedAt) return false;
  return managesTeam(actor) || e.ownerId === actor.id;
}

/** Changing the owner (負責人) of an existing event is a manager action. */
export function canReassignOwner(actor: CalendarActor): boolean {
  return managesTeam(actor);
}

export function canCompleteEvent(actor: CalendarActor, e: CalendarEvent): boolean {
  return canEditEvent(actor, e);
}

export function canCancelEvent(actor: CalendarActor, e: CalendarEvent): boolean {
  return canEditEvent(actor, e);
}

/** Soft delete only; system-source events can never be deleted here. */
export function canSoftDeleteEvent(actor: CalendarActor, e: CalendarEvent): boolean {
  if (isSystemEvent(e) || e.deletedAt) return false;
  return managesTeam(actor) || e.ownerId === actor.id;
}

/** Restoring soft-deleted events is a supervisor/admin action. */
export function canRestoreEvent(actor: CalendarActor, e: CalendarEvent): boolean {
  return managesTeam(actor) && !!e.deletedAt && !isSystemEvent(e);
}

/** A participant who cannot edit sees the event read-only. */
export function isReadOnlyParticipant(actor: CalendarActor, e: CalendarEvent): boolean {
  return e.participantIds.includes(actor.id) && !canEditEvent(actor, e);
}
