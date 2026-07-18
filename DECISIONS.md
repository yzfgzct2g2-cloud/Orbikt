# Orbikt Product Decisions

This document records all product decisions that have been finalized.

Claude Code must treat these decisions as immutable unless explicitly changed by the project owner.

---

## Product

Product Name

Orbikt

Mission

Plan Once.
Build Through.
Finish Completely.

---

## Product Philosophy

Orbikt is a Professional Workspace.

It is NOT:

- a portal
- a dashboard collection
- a collection of independent systems

Everything revolves around the Case Workspace.

---

## Architecture

Blueprint First Development.

No redesign during implementation.

Blueprint has the highest priority.

---

## Navigation

Homepage = Command Center

Command Center answers:

"What should I do today?"

NOT

"What functions are available?"

---

## Workspace

Every case has ONE Workspace.

All work must happen inside Workspace.

Workspace contains:

- Overview
- AA01
- FA310
- Dispatch
- Visit
- Genogram
- Attachments
- Timeline

---

## Module Rules

AA01 is NOT an independent homepage.

FA310 is NOT an independent homepage.

Dispatch is NOT an independent homepage.

Visit Manager is NOT an independent homepage.

Genogram is NOT an independent homepage.

All modules live inside Workspace.

---

## Source of Truth

Visit warning

SSOT = Visit Manager (Google Apps Script)

Dashboard must never create another visit warning algorithm.

---

Dispatch

SSOT = Existing Dispatch System

Dashboard displays dispatch status only.

---

Knowledge

Knowledge must preserve traceable sources.

AI answers must always reference the knowledge base.

---

## Team Calendar (2026-07-18, obj-orbikt-team-calendar-v1)

Orbikt Team Calendar（團隊行事曆）is the TEAM WORK-COORDINATION LAYER.

It is NOT a new SSOT for any business module:

- Visit Manager remains the SSOT for visit warnings.
- AA01 / FA310 / Dispatch keep their own business rules.
- The calendar projects system deadlines read-only and links back to the
  source module; it never recomputes or edits source-system data.

Permission model (V1):

- Case managers manage THEIR OWN events (create / edit / complete / cancel /
  soft-delete) and can view the team's schedule.
- Supervisors / admins manage ALL events, including reassignment and restore.
- Participants who are not the owner get read-only access.

Deletion is SOFT DELETE only. No permanent-delete UI. Supervisors can restore.

System-source events (`source !== "manual"`) cannot be deleted or edited in
the calendar; core changes route back to the source module.

Google Calendar: V1 ships NO two-way sync. The Team Calendar is the SSOT for
team events; Google Calendar is a possible future one-way export (ICS) only.

Persistence (V1): browser-local via a CalendarAdapter seam. This is NOT a
multi-user shared backend; a Supabase/API adapter is the planned upgrade path
and requires server-side authorization (RLS) — UI permissions are not a
substitute.

Privacy: calendar events follow the existing masked-identity rules. Only the
case display name and CaseID may appear; never raw national IDs, phones,
addresses, birth dates, or medical detail.

PROJECT_STATE location (audit 2026-07-18): the canonical machine-readable
state file is `project-state/PROJECT_STATE.json` (tracked in git). Earlier
remote checks looked for it at the repository root; START_HERE.md now states
the path explicitly. Do not create a second state file at the root.

---

## Development Rules

Existing systems should be integrated.

Do NOT rewrite completed systems.

Wrap first.

Refactor later.

---

## Stop Conditions

Claude Code may stop ONLY when:

- API key is missing
- External authorization is required
- Blueprint conflict exists
- Source system is missing
- Data loss may occur

Otherwise continue automatically.

---

## Release Goal

One planning.

Continuous implementation.

Release Orbikt V1.