# archive/finance-module — ARCHIVED, NOT PRODUCTION

This folder holds an **alternate "module dashboard" prototype** (an AI operating
dashboard with a 記帳/發票 finance module, KPI/Eisenhower/chart widgets, a module
registry, and a design-system doc). It appeared in the working tree after the
v1.0.0 release and had begun replacing Command Center as the homepage.

It **conflicts with the Orbikt Blueprint / DECISIONS.md**, which state Orbikt is a
case-centered workspace — *"NOT a dashboard collection… NOT a collection of
independent systems. Homepage = Command Center."*

Per the project owner's explicit decision (V1.0.1 Correction Sprint), this work
was **archived, not deleted**, and Orbikt was restored to the Blueprint
architecture:

- Command Center is the homepage again.
- `src/App.tsx`, `src/layout/AppLayout.tsx`, `src/index.css`, `package.json`
  were restored to their v1.0.0 committed state.

## Contents (original `src`-relative structure preserved)

- `pages/DashboardPage.tsx`, `pages/ModulePlaceholderPage.tsx`
- `components/dashboard/*`, `components/charts/*`, `components/layout/*`,
  `components/modules/*`
- `charts/chartUtils.ts`, `styles/tokens.css`
- `modules/registry.ts`, `modules/types.ts`
- `data/mockDashboardData.ts` (contains the 發票 example data),
  `data/dashboardSelectors.ts` + test
- `vite.config.mjs`
- `notes/` — the UI design system doc, handoff doc, and dashboard UI plan

## Status

- **Excluded from build/typecheck** (outside the `src` tsconfig include).
- **Excluded from lint** (see `eslint.config.js` ignores).
- Not imported by any production source under `src/`.

If this direction is ever revived, it requires an explicit amendment to
`DECISIONS.md` / the Blueprint first.
