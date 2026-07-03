# Orbikt Dashboard UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first maintainable modular Orbikt Dashboard UI Prototype from the existing design system.

**Architecture:** Keep module state in the app shell, centralize module metadata in `src/modules`, centralize mock data in `src/data/mockDashboardData.ts`, and derive visible dashboard content through pure selectors before rendering React components.

**Tech Stack:** React, TypeScript, Vite, Tailwind CSS, Vitest, lightweight SVG chart components.

---

### Task 1: Module Registry and Dashboard Selectors

**Files:**
- Create: `src/modules/types.ts`
- Create: `src/modules/registry.ts`
- Create: `src/data/mockDashboardData.ts`
- Create: `src/data/dashboardSelectors.ts`
- Test: `src/data/dashboardSelectors.test.ts`

- [x] Write tests for default enabled modules and filtering behavior.
- [x] Verify the test runner reaches a red state; current environment blocks Vitest config loading before test execution.
- [x] Implement module types, registry defaults, mock dashboard data, and selector functions.
- [x] Run `npm.cmd run typecheck` to verify TypeScript.

### Task 2: Dashboard Components

**Files:**
- Create: `src/components/dashboard/*.tsx`
- Create: `src/components/modules/*.tsx`
- Create: `src/components/charts/*.tsx`
- Create: `src/charts/chartUtils.ts`

- [x] Build reusable section, KPI, AI suggestion, matrix, activity, action, module switch, and chart components.
- [x] Use design tokens and module colors consistently.

### Task 3: Shell and Routing Integration

**Files:**
- Create: `src/components/layout/*.tsx`
- Create: `src/pages/DashboardPage.tsx`
- Create: `src/pages/ModulePlaceholderPage.tsx`
- Modify: `src/layout/AppLayout.tsx`
- Modify: `src/App.tsx`
- Modify: `src/index.css`

- [x] Move module toggle state into `AppLayout`.
- [x] Render the modular dashboard at `/`.
- [x] Keep the existing Command Center at `/command-center`.
- [x] Preserve existing pages and routes.

### Task 4: Handoff and Verification

**Files:**
- Create: `docs/ORBIKT_UI_HANDOFF_FOR_CLAUDE.md`

- [x] Document new files, component responsibilities, module toggle logic, mock data location, future integration points, and limits.
- [ ] Run lint, typecheck, build, and tests.
- [ ] Report missing scripts or environment blockers clearly.
