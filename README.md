# Orbikt

Orbikt is a case-centered professional workspace platform.

## Development Rule

This project follows Blueprint First Development.

Claude Code must read the documents in this order before writing code:

1. START_HERE.md
2. docs/ORBIkT_BLUEPRINT_V1.md
3. config/project-status.md
4. config/migration-map.md
5. config/source-systems.json
6. config/integrations.json
7. config/external-links.md
8. source-systems/

## Goal

Plan once, build through, finish completely.

Claude Code must complete Phase 0 to Phase 12 unless it encounters:

- missing API key
- external login authorization
- Blueprint conflict
- data loss risk
- missing source system files

## Running Orbikt (V1)

```bash
npm install
npm run dev        # start the dev server
npm run build      # tsc -b && vite build
npm run typecheck  # tsc --noEmit
npm run lint       # eslint .
npm run test       # vitest run
```

Data build steps (regenerate the sanitized seeds from source data):

```bash
npm run seed:cases      # mock-data/CS100.xlsx -> src/data/seed/cases.generated.json (PII stripped)
npm run seed:knowledge  # source-systems/knowledge topics -> src/modules/knowledge/topics.generated.json
```

## Architecture (V1)

- **Stack:** React 18 + TypeScript 5.6 + Vite 5 + TailwindCSS 3 + React Router 6 + Zustand 4.
- **Homepage:** Command Center (answers "what should I do today?").
- **Operating surface:** Case Workspace — AA01 / FA310 / Dispatch / Visit / Genogram /
  Attachments / Timeline live as tabs inside it.
- **Data:** all UI reads through `src/adapters` (mock/CS100 today; Supabase/live later).
- **Source-of-truth boundaries:** Visit Manager (visit warnings), external Dispatch
  system, LongCare-QA-Engine (FA310 review), the knowledge platform (citations).
  Orbikt reads/links these; it does not recompute them.
- **Privacy:** raw national IDs are read only transiently at import; browser-facing
  data carries `maskedNationalId` only.

Development history is recorded under `project-state/` (checkpoints + phase reviews).