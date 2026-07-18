# Team Calendar V1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver Orbikt Team Calendar V1 with responsive month/week/day operation, role-aware event workflows, browser persistence, source projections, Command Center integration, tests, and governance evidence.

**Architecture:** Keep calendar rules in pure TypeScript modules, mutations behind a Zustand store and `CalendarAdapter`, and React limited to rendering and interaction. Persist only manual events locally; derive source-system projections from existing safe case records.

**Tech Stack:** React 18, TypeScript 5.6, React Router 6, Zustand 4, Tailwind CSS 3, Vitest 2.

## Global Constraints

- Preserve Command Center and Case → Workspace → Modules.
- Asia/Taipei is the calendar time zone; user copy is Traditional Chinese.
- No new UI framework or calendar dependency.
- No raw national ID, phone, address, birth date, or medical detail.
- V1 local storage must never be described as a shared multi-user backend.
- No Google Calendar two-way sync.

---

### Task 1: Complete calendar core and persistence

**Files:**
- Modify: `src/adapters/types.ts`, `src/adapters/index.ts`, `src/lib/labels.ts`
- Create: `src/adapters/CalendarAdapter.ts`, `src/adapters/LocalCalendarAdapter.ts`, `src/store/useCalendarStore.ts`
- Create: `src/modules/calendar/calendarDates.ts`, `calendarDomain.ts`, `calendarPermissions.ts`, `calendarFilters.ts`, `calendarForm.ts`, `calendarGrid.ts`, `calendarStats.ts`
- Test: matching `*.test.ts` files in `src/adapters` and `src/modules/calendar`

**Interfaces:**
- Produces: `CalendarEvent`, `CalendarAdapter`, `useCalendarStore`, `deriveVisitEvents`, `applyFilters`, `monthGrid`, `weekDates`, `teamProgress`.

- [x] Write failing tests for validation, transitions, permissions, persistence, reload, filters, Taipei date math, and progress.
- [x] Run targeted Vitest files and confirm failures precede implementations.
- [x] Implement minimal pure rules, adapter, and store needed by the tests.
- [ ] Fix lint and run `npm run typecheck && npm run lint && npm test` with all checks passing.
- [ ] Commit as `feat: add calendar domain model and adapter`.

### Task 2: Build the responsive calendar surface

**Files:**
- Create: `src/pages/Calendar.tsx`
- Create: `src/components/calendar/CalendarToolbar.tsx`, `CalendarFilters.tsx`, `CalendarViews.tsx`, `EventDialog.tsx`, `TeamProgress.tsx`
- Create: `src/pages/Calendar.test.tsx` or pure `src/modules/calendar/calendarPage.test.ts`
- Modify: `src/App.tsx`, `src/layout/nav.ts`

**Interfaces:**
- Consumes: Task 1 store and pure selectors.
- Produces: route `/calendar`, accessible create/edit/detail actions, responsive month/week/day views.

- [ ] Write failing UI/view-model tests for switching views, filtering owners, selecting an event, read-only mode, case links, and mobile-safe day layout.
- [ ] Run the targeted tests and confirm the new UI contract is absent.
- [ ] Implement toolbar, grids, filters, progress, form, detail, completion, cancellation, soft-delete, and restore.
- [ ] Run targeted tests, typecheck, and lint until passing.
- [ ] Commit as `feat: add team calendar views and workflows`.

### Task 3: Integrate Command Center and source projections

**Files:**
- Modify: `src/pages/CommandCenter.tsx`
- Modify: `src/modules/dashboard/dashboard.test.ts`
- Modify: `src/modules/calendar/calendarDomain.ts`

**Interfaces:**
- Consumes: `deriveVisitEvents`, manual events from `useCalendarStore`.
- Produces: today's combined schedule summary and entry to `/calendar` while retaining existing dashboard panels.

- [ ] Write a failing test proving source events remain read-only projections and today's summary uses calendar data.
- [ ] Run the targeted test and confirm failure.
- [ ] Replace the legacy schedule panel data path with the combined calendar selector without duplicating Visit Manager rules.
- [ ] Run dashboard and calendar regressions, typecheck, and lint.
- [ ] Commit as `feat: integrate calendar with command center and cases`.

### Task 4: Governance, verification, and delivery

**Files:**
- Modify: `project-state/PROJECT_STATE.json`, `CHANGELOG.md`, `config/project-status.md`, `package.json`
- Create: `project-state/checkpoints/checkpoint-0028.md`, `project-state/reviews/release-v1.7.1-review.md`

**Interfaces:**
- Produces: OAES state `Verified`, auditable checkpoint/review, v1.7.1 release evidence.

- [ ] Run `npm run typecheck`, `npm run lint`, `npm test`, and `npm run build`; record exact counts and output.
- [ ] Scan tracked/browser-facing files for secret patterns, raw national IDs, phone numbers, and unintended deletions.
- [ ] Update state, changelog, project status, checkpoint, review, and patch version with exact limitations.
- [ ] Commit as `docs: record team calendar checkpoint and review` and push `feat/team-calendar-v1`.
- [ ] Verify `git status --porcelain` is empty and remote branch SHA equals local HEAD.
