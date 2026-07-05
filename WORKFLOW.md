# Orbikt Development Workflow

Version: Governance V2  
Status: Active  
Current Stable Version: v1.1.0  
Current Development Target: v1.2.0  
Current Milestone
Automatically determined from PROJECT_STATE.json.
The first milestone marked
Next
or
In Progress
becomes the active milestone.
Current Checkpoint
Automatically read from PROJECT_STATE.json.
Never hardcode checkpoint numbers in WORKFLOW.md.
Primary Focus: Data Center

---

# 1. Purpose

WORKFLOW.md defines what Orbikt should build next.

This file answers:

What should be developed next?

Other governance files have separate responsibilities:

- START_HERE.md defines how Claude Code starts.
- CLAUDE.md defines how Claude Code behaves.
- ACCEPTANCE.md defines when work is complete.
- DECISIONS.md defines what must not change.
- PROJECT_STATE.json defines current machine-readable progress.

Do not duplicate responsibilities across governance files.

---

# 2. Development Philosophy

Orbikt is a workflow platform.

The objective is not to build isolated features.

The objective is to complete the daily workflow of a Long-Term Care Case Manager.

Every implementation decision must improve workflow efficiency.

Blueprint is immutable.

DECISIONS.md is immutable.

Never redesign Orbikt.

Wrap first.

Refactor later.

Reuse existing systems.

---

# 3. Development Priority

Priority order:

1. P0 Data Integration
2. P1 Workspace
3. P2 Workflow Automation
4. P3 External Integration
5. P4 Analytics
6. P5 Future Expansion

Always complete higher priority work before lower priority work.

Claude Code must not skip priority unless the user explicitly changes WORKFLOW.md.

---

# 4. Milestone Status Values

Use only these status values:

- Next
- In Progress
- Blocked
- Deferred
- Completed

Definitions:

## Next

The milestone should be started next.

## In Progress

The milestone is actively being worked on.

## Blocked

The milestone cannot continue because of a Stop Condition.

## Deferred

The milestone is intentionally postponed.

## Completed

The milestone has passed Acceptance and release requirements.

---

# 5. Active Milestone Rule

Claude Code must always work on the first milestone marked:

- Next
- In Progress

Do not skip milestones.

Do not reorder milestones.

Do not start future milestones while a higher-priority milestone is still Next or In Progress.

Only the user may reorder milestones.

---

# 6. Milestone 1 — Data Center

Status: Completed  
Priority: P0  
Expected Version: v1.1.0
Depends On: v1.0.3 stable baseline
Completed: v1.1.0 — Data Center page (/data-center) with all 6 source systems,
import report/history/log, validation, FA310↔CS100 matching (staged), source
warnings. FA310 live import deferred to Milestone 6 (adapter seam ready).

## Goal

Centralize all source data and import workflows.

Orbikt must have one clear place to manage:

- CS100
- FA310
- AA01
- Knowledge
- Dispatch
- Visit Manager

## Scope

Data Center must include:

- Import Center
- Source status
- Import report
- Import log
- Import history
- Data validation
- Data matching
- Data abnormality report
- Safe generated data
- Clear raw-data policy

## Expected Output

- Data Center or Settings > Data Sources is usable.
- CS100 source status is visible.
- FA310 source status is visible.
- Import report is visible.
- Import log is visible.
- Generated data status is visible.
- Matching result is visible.
- Abnormal source-data warning is visible.

## Required Source Systems

- CS100
- FA310
- AA01
- Knowledge
- Dispatch
- Visit Manager

## Required Screens or Sections

- Settings > Data Sources, or
- Data Center page if promoted from Settings

Must show:

- CS100 status
- FA310 status
- AA01 source status if available
- Knowledge status
- Dispatch source status
- Visit Manager source status
- Last imported time
- Record count
- Import report link
- Import errors
- Missing source warning

## Data Rules

Raw files belong in:

input/

Sanitized generated files belong in:

generated/

Browser-facing app may read generated data only.

Browser must never read raw Excel directly.

## Matching Rules

Responsible case manager should be determined primarily from FA310 when both FA310 and CS100 are available.

CS100 may be used as secondary reference.

Raw national ID may be used only during import-time matching.

Frontend may only expose:

- surrogate case ID
- maskedNationalId
- manager name
- safe workflow status

## Acceptance Reference

ACCEPTANCE.md > Data Center

## Completion Criteria

Milestone 1 is complete only when:

- CS100 import path is clear
- FA310 import path is clear
- generated data is sanitized
- import report exists
- import log exists
- matching rule is implemented or clearly staged
- raw PII does not reach frontend
- tests pass
- build passes
- checkpoint created
- review created
- PROJECT_STATE.json updated
- commit completed
- push completed or auth stop condition reported
- ACCEPTANCE.md requirements passed.

---

# 7. Milestone 2 — Workspace Work Mode

Status: Next  
Priority: P1  
Expected Version: v1.2.0
Prerequisite: Milestone 1 — Data Center (Completed)

## Goal

Make Workspace feel like entering a case file.

Workspace must be the primary operating surface for one selected case.

## Scope

Workspace should include:

- Case banner
- Overview
- AA01
- FA310
- Dispatch
- Visit
- Genogram
- Attachments
- Timeline
- Knowledge references
- Case-specific abnormal items
- Next action suggestion

## Expected Output

- Workspace looks and behaves like a case file.
- Workspace is visually distinct from Cases.
- Case banner is clear.
- Each tab has visible status.
- Next action is visible.
- Case-specific abnormal items are visible.

## Required Distinction

Cases page is a registry and triage list.

Workspace is a case operating surface.

They must not feel redundant.

## Acceptance Reference

ACCEPTANCE.md > Workspace

## Completion Criteria

Milestone 2 is complete only when:

- Workspace is visually distinct from Cases
- tabs are clearly case-scoped
- case banner shows key safe identity
- next action is visible
- unfinished work is obvious
- no duplicate data entry
- tests/build/lint/typecheck pass
- checkpoint/review/state/commit/push complete
- ACCEPTANCE.md requirements passed.

---

# 8. Milestone 3 — Morning Workflow

Status: Deferred  
Priority: P1  
Expected Version: v1.3.0
Depends On: Milestone 2 — Workspace Work Mode

## Goal

When a case manager opens Orbikt, the entire day is immediately understandable.

## Scope

Command Center must support:

- Today Tasks
- meetings
- visit warnings
- dispatch follow-up
- abnormal notifications
- Eisenhower Matrix
- daily progress
- click-through to Workspace or relevant page

## Expected Output

- Command Center shows today's work at a glance.
- Today Tasks are forward-looking.
- Abnormal Notifications are visible.
- Eisenhower Matrix is visible.
- Dispatch follow-up is visible.
- Visit warnings are visible.
- Schedule is visible.

## Today Tasks Definition

Today Tasks are planned work, such as:

- meeting notices
- unfinished care plans due today
- dispatch cases that should be sent
- scheduled visits
- planned follow-up

Today Tasks are not merely overdue counters.

## Acceptance Reference

ACCEPTANCE.md > Morning Workflow

## Completion Criteria

Milestone 3 is complete only when:

- dashboard can be understood quickly
- critical items are visible without excessive scrolling
- abnormal items are visually distinct
- Eisenhower Matrix classifies real work items
- user can click into the relevant work surface
- dashboard does not become a module launcher
- tests/build/lint/typecheck pass
- checkpoint/review/state/commit/push complete
- ACCEPTANCE.md requirements passed.

---

# 9. Milestone 4 — Case Workflow

Status: Deferred  
Priority: P1  
Expected Version: v1.4.0
Depends On: Milestone 3 — Morning Workflow

## Goal

Allow a case manager to process an entire case without leaving Workspace unnecessarily.

## Scope

Case Workflow includes:

- import/source view
- case overview
- assessment context
- AA01 status or draft
- FA310 status or review result
- dispatch status
- visit status
- documents
- timeline
- knowledge references
- completion checklist

## Expected Output

- A case can be reviewed from start to finish inside Workspace.
- AA01 status is clear.
- FA310 status is clear.
- Dispatch status is clear.
- Visit status is clear.
- Timeline records case progress.
- Completion checklist is visible.

## Acceptance Reference

ACCEPTANCE.md > Case Workflow

## Completion Criteria

Milestone 4 is complete only when:

- user can identify what remains unfinished
- user can move between modules inside Workspace
- user does not need to re-search the same case
- case workflow has clear completion status
- tests/build/lint/typecheck pass
- checkpoint/review/state/commit/push complete
- ACCEPTANCE.md requirements passed.

---

# 10. Milestone 5 — Automation

Status: Deferred  
Priority: P2  
Expected Version: v1.5.0
Depends On: Milestone 4 — Case Workflow

## Goal

Reduce manual work through automatic matching, reminders, abnormal detection, and workflow suggestions.

## Scope

Automation may include:

- automatic case matching
- automatic manager matching
- automatic visit warnings
- automatic dispatch abnormal detection
- automatic FA310 failed/review status
- automatic missing-source detection
- automatic dashboard refresh
- workflow suggestions

## Expected Output

- Matching is automated where safe.
- Reminders are generated automatically.
- Abnormal items are detected automatically.
- Dashboard refresh behavior is defined.
- Workflow suggestions are explainable.

## Safety Rule

Automation must not hide risk.

Automated output must be explainable.

User must be able to verify the source.

## Acceptance Reference

ACCEPTANCE.md > Automation

## Completion Criteria

Milestone 5 is complete only when:

- automated outputs are explainable
- abnormal conditions are visible
- source data can be traced
- no unsafe hidden decision exists
- tests/build/lint/typecheck pass
- checkpoint/review/state/commit/push complete
- ACCEPTANCE.md requirements passed.

---

# 11. Milestone 6 — External Integration

Status: Deferred  
Priority: P3  
Expected Version: v2.0.0
Depends On: Milestone 5 — Automation

## Goal

Replace read/link seams with live integrations where safe and authorized.

## Potential Integrations

- Visit Manager GAS
- Dispatch API
- LongCare-QA-Engine live FA310 call
- Microsoft Graph
- Supabase
- Google Calendar
- LINE

## Expected Output

- External integrations use adapters.
- Missing credentials trigger Stop Conditions.
- Safe fallback mode remains available.
- No fake live integration is shown as real.

## Integration Rule

All external systems must be adapter-based.

If credentials are missing, stop and report.

Do not fake live integration.

Keep safe fallback mode.

## Acceptance Reference

ACCEPTANCE.md > External Integration

## Completion Criteria

Milestone 6 is complete only when:

- adapter boundaries are documented
- missing credentials trigger Stop Condition
- fallback read/link mode remains safe
- no fake live connection is presented as real
- tests/build/lint/typecheck pass
- checkpoint/review/state/commit/push complete


---

# 12. Product Memory

Accepted permanent decisions:

- Command Center remains homepage.
- Dashboard is not a module launcher.
- Cases is registry and triage.
- Workspace is the case operating surface.
- Today Tasks are planned work, not overdue counters.
- Abnormal Notifications show urgent exceptions.
- Eisenhower Matrix classifies work priority.
- Visit Manager is visit-warning SSOT.
- Dispatch remains external until live API integration.
- FA310 review logic must not be duplicated in React.
- AA01 belongs inside Workspace.
- Knowledge must preserve traceable sources.
- Codex UI output may be used as component library only.
- External AI output must not replace Blueprint architecture.
- Full names are allowed unless future policy changes.
- maskedNationalId is allowed.
- Raw national ID is never browser-facing.
- Raw phone, address, and birth date are never browser-facing.

Accepted Development Rules:

- GitHub is the canonical project history.
- Claude Code must continue automatically.
- Claude Code must not redo completed milestones.
- Every checkpoint must update PROJECT_STATE.json.
- Every checkpoint must commit and push.
- Every release must pass Acceptance.
- Every release must update checkpoint and review files.

Do not re-evaluate Product Memory during ordinary development.

Only change Product Memory when the user explicitly approves a new direction.

---

# 13. Deferred Work Rule

Deferred work must be recorded.

Each deferred item must include:

- item name
- reason
- future milestone
- dependency
- whether user approval is needed

Do not silently abandon work.

Do not describe deferred work as completed.

---

# 14. Release Sequence

For every release:

1. Complete implementation.
2. Run Acceptance check.
3. Run typecheck.
4. Run lint.
5. Run tests.
6. Run build.
7. Update PROJECT_STATE.json.
8. Create checkpoint.
9. Create review.
10. Update CHANGELOG.md.
11. Commit.
12. Push.
13. Tag if release version is defined.
14. Push tag.
15. Verify working tree is clean.
16. Verify GitHub synchronization.

Do not release before all steps are complete.

---

# 15. Retry Policy

If typecheck, lint, tests, or build fails:

1. Diagnose the failure.
2. Fix safely.
3. Re-run all verification commands.
4. Continue only after all pass.

Do not stop for ordinary TypeScript, lint, test, or build errors.

Stop only if the failure reveals:

- Blueprint conflict
- data-loss risk
- security issue
- missing credentials
- external authorization

---

# 16. GitHub Resume Rule

When starting from any computer or new session:

1. Run git pull.
2. Read PROJECT_STATE.json.
3. Read latest checkpoint.
4. Read latest review.
5. Read WORKFLOW.md.
6. Continue from the first milestone marked Next or In Progress.

GitHub is the canonical project history.

Do not continue from stale local state.

---

# 17. Workflow Memory

Accepted case-management workflow:

Morning start
↓
Command Center
↓
Today Tasks
↓
Abnormal Notifications
↓
Cases Registry
↓
Case Workspace
↓
AA01
↓
FA310
↓
Dispatch
↓
Visit
↓
Timeline
↓
Completion / Follow-up

This workflow should not change unless Blueprint changes.

---

# 18. Future Backlog

Future items must not interrupt current milestones.

Potential future work:

- Live Visit Manager GAS integration
- Live Dispatch API integration
- Microsoft Graph document access
- Supabase persistence
- Google Calendar integration
- LINE notification integration
- Full AA01 authoring UI
- Full Knowledge Hub embed
- Live FA310 QA Engine call
- Genogram production module
- Role-based dashboards
- Management analytics

Move a backlog item into a milestone only when the user explicitly approves it.

---

# 19. Milestone Execution Rule

For every milestone, Claude Code must:

1. Read ACCEPTANCE.md.
2. Confirm milestone status.
3. Plan internally.
4. Implement.
5. Run verification.
6. Update PROJECT_STATE.json.
7. Create checkpoint.
8. Create review.
9. Update CHANGELOG.md when needed.
10. Commit.
11. Push.
12. Continue automatically.

Do not stop between milestones unless a Stop Condition occurs.

---

# 20. Release Rules

Every milestone ends with:

- typecheck
- lint
- tests
- build
- Acceptance check
- checkpoint
- review
- PROJECT_STATE.json update
- commit
- push

A release tag is created only if the milestone defines a version release.

---

# 21. Stop Conditions

Only stop when:

- missing credentials
- external authorization
- GitHub authentication failure
- real Blueprint conflict
- potential data loss
- security issue
- PII exposure

Otherwise continue automatically.

---

# 22. Completion Rule

A milestone is complete only when:

- Acceptance PASS
- checkpoint written
- review written
- PROJECT_STATE.json updated
- CHANGELOG updated if needed
- typecheck PASS
- lint PASS
- tests PASS
- build PASS
- commit complete
- push complete or authentication stop condition reported
- working tree clean

---

# 23. Next Development Goal

Current Goal:

Complete Data Center.

Next Goal:

Complete Workspace Work Mode.

Future Goal:

Complete Morning Workflow.

---

# 24. Workflow Lifecycle

Every milestone follows the same lifecycle.

Next

↓

In Progress

↓

Implementation

↓

Verification

↓

Acceptance

↓

Checkpoint

↓

Review

↓

Commit

↓

Push

↓

Completed

↓

Activate the next milestone.

Claude Code must never skip lifecycle stages.

Claude Code must never mark a milestone as Completed before ACCEPTANCE.md passes.

After one milestone reaches Completed, Claude Code automatically activates the next milestone unless a Stop Condition occurs.

---

# 25. Completion

Continue until every milestone is complete.

Never wait for user confirmation between milestones.

If user says:

Continue Orbikt

Then resume from the first milestone marked Next or In Progress.