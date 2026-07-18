# Team Calendar V1 Design

## Objective and boundaries

`obj-orbikt-team-calendar-v1` adds a first-class `/calendar` team work-coordination surface without changing Orbikt's Case → Workspace → Modules architecture. Manual team events belong to the calendar; Visit Manager, AA01, FA310, and Dispatch remain the SSOT for their own rules. V1 does not implement Google Calendar synchronization.

## Architecture

The existing `CalendarEvent` contract and pure domain functions remain independent of React. All writes pass through `useCalendarStore`, which enforces the mock-auth role seam before calling `CalendarAdapter`. `LocalCalendarAdapter` persists manual events in browser local storage and remains explicitly non-shared; source-system projections are derived read-only from browser-safe case data and are never persisted as duplicate business data.

No calendar framework is added. Tested date/grid helpers render compact month, week, and day views with Taiwan labels and Asia/Taipei date bucketing. This keeps the dependency surface small and matches the repository's logic-first pattern.

## User interface

The top-level navigation gains `團隊行事曆` and `/calendar`. The page contains interval navigation, month/week/day controls, filters, a responsive calendar grid/list, event details, a create/edit form, team progress counts, and a supervisor restore panel. Event links return to `/workspace/:caseId`; Visit Manager projections return to the visit tab.

Command Center keeps its summary role. Its schedule panel reads the same combined calendar projection and links to the full calendar rather than embedding a month grid.

## Permissions and privacy

Case managers create and manage their own manual events. Other case managers and participants are read-only. Supervisors, directors, and admins manage all manual events and may restore soft-deleted events. System-source events are read-only and cannot be deleted from the calendar.

Case selection is limited to cases visible through the existing browser-safe adapter data. Events store only CaseID and existing safe display name; national IDs, phone numbers, addresses, birth dates, and medical details are forbidden.

## State and error handling

Form validation rejects missing title/date/owner and invalid time ranges. The store exposes saving, saved, and error states. Adapter failures remain visible without discarding the current form. Corrupt local storage degrades to an empty manual-event list. Overdue is derived at read time and never requires a scheduler rewrite.

## Verification

Pure tests cover dates, grids, domain transitions, permissions, filters, form conversion, progress, and persistence/reload. UI-focused tests cover view switching, event operations, filters, case links, and read-only behavior through extracted page view-model helpers. Repository typecheck, lint, full Vitest suite, build, privacy scan, and existing module regression tests must pass before completion.

## Known limitation

Local storage preserves data only for the current browser profile. It is not a production multi-user shared backend. A future Supabase/API adapter must enforce server-side authorization or RLS; UI permission checks are not a security boundary.
