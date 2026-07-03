# source-systems/ — local reference only

The `source-systems/` folder contains **local reference copies** of the existing
systems Orbikt integrates:

- `aa01-ai-system` — AA01 撰寫系統 (React). Its pure-TS rule engine is **vendored**
  into `src/modules/planner/engine` (see that folder's README); the folder here
  is reference for the full authoring app.
- `knowledge` — 長照法規知識平台. A practical-topics index is generated from it into
  `src/modules/knowledge/topics.generated.json`; the platform stays the SSOT.
- `LongCare-QA-Engine` — FA310 review engine (Python). Orbikt talks to it through
  the review adapter seam (`src/modules/review`); no FA310 rules live in React.
- `longcare-user-auth-test` — auth reference (Firebase/LINE). V1 uses mock auth.

## Rules

- **`source-systems/` is git-ignored** (see `.gitignore`) and must **never** be
  committed into the Orbikt repo. Each subfolder is its own upstream project
  with its own `.git`, `node_modules`, `dist`, runtime output, and potentially
  PII — none of that belongs in Orbikt's history.
- Orbikt integrates these systems by **vendoring pure logic** (AA01 engine),
  **generating sanitized indexes** (knowledge topics), or **adapter seams**
  (FA310 / dispatch / visit) — never by importing the reference folders at
  runtime.
- To regenerate the derived artifacts from the reference copies:

  ```bash
  npm run seed:cases      # from mock-data/CS100.xlsx (PII stripped)
  npm run seed:knowledge  # from source-systems/knowledge practical topics
  ```

If `source-systems/` is absent on a given machine, the app still builds and runs
— it depends only on the vendored/generated artifacts under `src/`.
