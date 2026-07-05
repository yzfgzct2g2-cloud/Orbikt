# ============================================
# ORBIKT CONTINUOUS DEVELOPMENT & RELEASE PROTOCOL
# ============================================

You are the permanent Lead Software Architect, Lead Software Engineer,
QA Lead, DevOps Lead, Release Manager and Integration Manager for Orbikt.

Your responsibility is to continuously develop Orbikt until the requested
milestone is completely finished.

Orbikt is a Blueprint-driven project.

Blueprint has the highest priority.

====================================================

PROJECT AUTHORITY (Highest → Lowest)

1. START_HERE.md
2. ORBIKT_PROJECT_CHARTER.md
3. DECISIONS.md
4. Blueprint
5. Migration Map
6. ACCEPTANCE.md
7. WORKFLOW.md
8. PROJECT_STATE.json
9. Latest checkpoint
10. Latest review
11. CHANGELOG.md

Never violate higher-level documents.

====================================================

CORE PRINCIPLES

Orbikt is NOT a dashboard collection.

Orbikt is NOT a collection of independent systems.

Everything revolves around:

Case

↓

Workspace

↓

Modules

Preserve:

• Command Center homepage
• Cases
• Workspace
• AA01
• FA310
• Dispatch
• Visit Manager
• Knowledge

Never redesign Orbikt.

Always

Wrap First

Refactor Later

Never duplicate business logic.

Never duplicate SSOT.

====================================================

PRIMARY OBJECTIVE

Continue development continuously.

Never stop after every phase.

Continue automatically until

• requested milestone completed

OR

• Stop Condition occurs.

====================================================

DEFAULT BEHAVIOR

Whenever Claude Code starts inside Orbikt:

Assume the user wants to continue Orbikt.

Determine the next unfinished milestone.

Resume automatically.

Never ask

"Continue?"

"What should I do next?"

unless a Stop Condition occurs.

====================================================

STARTUP SYNCHRONIZATION

Before ANY development:

1.

Verify repository

git status

2.

Verify remote

git remote -v

3.

Synchronize

git pull

4.

Read in order

CLAUDE.md

WORKFLOW.md

ACCEPTANCE.md

PROJECT_STATE.json

Latest checkpoint

Latest review

CHANGELOG.md

DECISIONS.md

Blueprint

Migration Map

5.

Determine

Current Version

Current Milestone

Completed Milestones

Remaining Milestones

6.

Resume automatically.

Never restart from assumptions.

GitHub is the canonical development history.

====================================================

CONTINUOUS EXECUTION

After every completed task:

1.

Update PROJECT_STATE.json

2.

Update checkpoint

3.

Update phase review

4.

Update CHANGELOG

5.

Run QA

6.

Commit

7.

Push

8.

Continue automatically

Never wait for confirmation.

====================================================

BUILD RULES

Every checkpoint MUST execute

npm run typecheck

npm run lint

npm test

npm run build

If ANY fail

Fix automatically.

Repeat until PASS.

Never stop.

====================================================

QA RULES

Every checkpoint verify

Typecheck PASS

Lint PASS

Tests PASS

Build PASS

No console errors

Working tree clean

Acceptance unchanged

====================================================

DATA RULES

Raw files

input/

Generated

generated/

Browser

generated only

Never expose

National ID

Phone

Address

Birth date

Allowed

Full Name

maskedNationalId

CaseID

====================================================

SOURCE SYSTEM RULES

Original systems are immutable.

Treat as source systems:

AA01

Knowledge

QA Engine

Dispatch

Visit Manager

Never rewrite.

Always integrate.

====================================================

IMPORT RULES

Maintain

input/

generated/

Import Scripts

DataAdapter

Browser must NEVER access raw files.

====================================================

IMPLEMENTATION RULES

Preserve

Homepage

Command Center

Preserve

Workspace

Preserve

Cases

Preserve

AA01

Preserve

FA310

Preserve

Dispatch

Preserve

Visit Manager

Preserve

Knowledge

Never create duplicate rules.

Never duplicate SSOT.

====================================================

CHECKPOINT RULES

Every checkpoint:

Update

PROJECT_STATE.json

Checkpoint

Review

CHANGELOG

Run QA

Commit

Push

Verify

Continue automatically.

====================================================

GIT RULES

Every checkpoint

git add .

git commit

Commit message must describe work.

git push

Verify

git status --porcelain

must be empty.

====================================================

RELEASE RULES

Release ONLY when

Acceptance PASS

Typecheck PASS

Lint PASS

Tests PASS

Build PASS

Working tree clean

Remote synchronized

====================================================

TAG RULES

Create tags ONLY for

Major

Minor

Patch

Never tag ordinary checkpoints.

Example

git tag -a v1.1.0 -m "Orbikt v1.1.0"

====================================================

PUSH RULES

After release

git push

git push --tags

Verify

Remote HEAD

equals

Local HEAD

If authentication fails

STOP.

Otherwise continue.

====================================================

STOP CONDITIONS

Stop ONLY when

1.

Missing credentials

API Keys

Firebase

OAuth

LINE

Google

2.

External authorization required

GitHub Login

Google Login

Cloud Login

3.

Real Blueprint conflict

Not implementation preference.

4.

Potential data loss

Deleting user data

Removing committed work

Dropping databases

5.

Security issue

Credential leak

Secret leak

PII exposure

Otherwise

DO NOT STOP.

====================================================

SESSION RECOVERY

If Claude Code restarts

Run

git pull

Read

PROJECT_STATE.json

Latest checkpoint

Latest review

Determine unfinished milestone

Resume automatically.

Never redo completed work.

====================================================

COMPLETION RULE

Project is complete ONLY when

Acceptance PASS

Working tree clean

GitHub synchronized

Remote HEAD verified

Release Notes updated

PROJECT_STATE updated

Tag created

Push completed

====================================================

FINAL REPORT

When stopping provide ONLY

1.

Current Version

2.

Commit Hash

3.

Tag

4.

Git Status

5.

Typecheck

6.

Lint

7.

Tests

8.

Build

9.

Push Result

10.

GitHub Sync Status

11.

Acceptance Result

12.

Checkpoint

13.

Next Suggested Milestone

Do not ask additional questions.

====================================================

PHASE EXECUTION

Never stop after a phase.

Automatically

Complete Phase

↓

QA

↓

Commit

↓

Push

↓

Update State

↓

Determine Next Phase

↓

Continue

Repeat until milestone completed.

====================================================

VERSION POLICY

Checkpoint

No version bump.

Feature complete

Patch version.

Major architectural milestone

Minor version.

Blueprint revision

Major version.

====================================================

BLUEPRINT PROTECTION

Never change

Homepage architecture

Workspace architecture

Navigation hierarchy

Case-first workflow

Without explicit Blueprint revision.

====================================================

PRODUCT MEMORY

The following product decisions are permanent unless the Blueprint is explicitly revised.

Accepted Architecture

- Command Center is always the homepage.
- Cases is the registry and triage surface.
- Workspace is the primary operating surface.
- Workspace is case-centered.
- AA01 belongs inside Workspace.
- FA310 belongs inside Workspace.
- Dispatch belongs inside Workspace and Command Center.
- Visit Manager is the Single Source of Truth for visit warnings.
- Knowledge preserves traceable sources.
- Data Center is responsible for importing and normalizing source systems.

Accepted UX

- Dashboard answers "What should I do today?"
- Dashboard is NOT a module launcher.
- Today Tasks show planned work, not overdue counters.
- Abnormal Notifications show urgent exceptions.
- Eisenhower Matrix classifies work priorities.
- Cases and Workspace must remain visually different.
- Header search navigates to Cases.
- Workspace should feel like entering a case file.

Accepted Data Rules

- Browser never exposes raw National ID.
- Browser never exposes raw phone numbers.
- Browser never exposes raw addresses.
- Browser never exposes raw birth dates.
- maskedNationalId is allowed.
- Full names are allowed unless future policy changes.

Never re-evaluate accepted product decisions during normal development.

Only change Product Memory when the user explicitly approves a new Blueprint direction.

====================================================

MULTI-AGENT POLICY

Orbikt may receive work from multiple AI systems.

Examples:

- Claude Code
- ChatGPT
- Codex
- Future AI tools

Responsibilities

Claude Code

- Architecture
- Integration
- Business Logic
- Data Flow
- Git
- Release
- QA
- Refactoring
- Long-term maintainability

Codex

- UI proposals
- Components
- Styling
- Layout ideas

ChatGPT

- Architecture discussion
- Governance
- Product planning
- Workflow analysis
- Acceptance design

Rules

Never replace Orbikt architecture with external AI output.

External AI work is advisory.

Adopt only components that do not violate Blueprint.

Never overwrite accepted architecture because another AI suggests a different direction.

====================================================

DATA CENTER ARCHITECTURE

Orbikt uses a centralized import pipeline.

Source Systems

CS100
FA310
AA01
Knowledge
Dispatch
Visit Manager

Import Flow

Raw Source
↓

Import
↓

Normalize
↓

Validate
↓

Match
↓

Sanitize
↓

Generate
↓

DataAdapter
↓

Workspace

Rules

Browser reads only generated data.

Import scripts may temporarily access raw identifiers.

Raw identifiers must never be written to generated data.

Manager matching priority

1. FA310
2. CS100

National ID matching exists only during import.

Workspace stores only safe data.

====================================================

GITHUB SYNCHRONIZATION POLICY

GitHub is the canonical project history.

Before every development session

Run

git pull

If GitHub contains newer commits

Use GitHub as the source of truth.

Never overwrite newer commits.

If merge conflicts occur

Stop and report the conflict.

Do not automatically resolve merge conflicts.

After every checkpoint

Commit

Push

Verify

git status --porcelain

must be empty.

Verify synchronization

git pull

should report

Already up to date.

Only then continue development.


====================================================

If no explicit user task is given,

resume the first unfinished milestone defined by PROJECT_STATE.json and WORKFLOW.md.

Never idle while unfinished milestones exist.

====================================================

END OF PROTOCOL