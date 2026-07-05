# START_HERE

This is the entry point for Orbikt development.

If you are Claude Code, read this file first.

---

## Purpose

Orbikt is a Blueprint-driven, case-centered professional workflow platform.

Do not treat Orbikt as a generic dashboard, portal, or collection of independent tools.

Everything must preserve the structure:

Case
↓
Workspace
↓
Modules

---

## Required Reading Order

Before writing, editing, deleting, refactoring, committing, tagging, or pushing any code, read the following files in order:

1. CLAUDE.md
2. WORKFLOW.md
3. ACCEPTANCE.md
4. PROJECT_STATE.json
5. Latest checkpoint in project-state/checkpoints/
6. Latest review in project-state/reviews/
7. CHANGELOG.md
8. DECISIONS.md
9. docs/ORBIkT_BLUEPRINT_V1.md
10. config/migration-map.md
11. config/project-status.md
12. config/source-systems.json
13. config/integrations.json
14. config/external-links.md

If any required file is missing, continue only if the missing file is non-critical and the current task can be completed safely.

Stop only if the missing file creates a Blueprint conflict, data-loss risk, security risk, or source-system ambiguity.

---

## Startup Procedure

Every new Claude Code session must begin with:

1. Verify repository:
   git status

2. Verify remote:
   git remote -v

3. Synchronize with GitHub:
   git pull

4. Read the required files in the order listed above.

5. Determine:
   - current version
   - current milestone
   - last completed checkpoint
   - next unfinished task
   - whether local state matches GitHub

6. Resume automatically.

Do not ask the user what to do next unless a Stop Condition occurs.

---

## Default Behavior

When Claude Code starts inside the Orbikt repository, assume the user wants to continue Orbikt development.

Do not wait for the user to say "continue" after each phase.

Do not repeat completed work.

Do not redesign Orbikt.

Do not create a new product direction.

Continue from PROJECT_STATE.json and the latest checkpoint.

---

## Do Not Change

Do not change these without explicit user approval:

- Command Center as homepage
- Case Workspace as primary work surface
- Cases as registry / triage list
- AA01 inside Workspace
- FA310 inside Workspace
- Dispatch inside Workspace / Command Center
- Visit Manager as visit-warning SSOT
- Knowledge source traceability
- PII rules
- Blueprint-first development
- Wrap first, refactor later

---

## Stop Conditions

Stop only for:

- missing credentials
- external authorization
- GitHub authentication failure
- real Blueprint conflict
- destructive data-loss risk
- source-system ambiguity that may duplicate business rules
- security issue
- PII exposure

Do not stop for:

- UI choices
- TypeScript errors
- lint errors
- build errors
- test failures
- ordinary implementation decisions
- routine refactoring
- version bump decisions
- checkpoint creation

Fix those automatically.

---

## Required Ending Behavior

After each checkpoint or milestone:

1. Run:
   npm run typecheck
   npm run lint
   npm test
   npm run build

2. Fix failures automatically.

3. Update:
   - PROJECT_STATE.json
   - checkpoint
   - review
   - CHANGELOG.md when needed

4. Commit.

5. Push to GitHub.

6. Verify:
   git status --porcelain

7. Continue automatically.

---

## One-Line Resume Prompt

If the user says only:

Continue Orbikt

Then execute the Startup Procedure and resume automatically.