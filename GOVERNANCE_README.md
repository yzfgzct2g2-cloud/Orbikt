# Orbikt Governance

Version: Governance V2

---

# Purpose

Orbikt uses a multi-layer governance system.

Each governance file has a single responsibility.

Claude Code must follow these files in the defined order.

Do not duplicate responsibilities across governance files.

---

# Governance Hierarchy

Highest

↓

START_HERE.md

↓

CLAUDE.md

↓

WORKFLOW.md

↓

ACCEPTANCE.md

↓

PROJECT_STATE.json

↓

Checkpoint

↓

Review

↓

CHANGELOG

---

# Governance Files

## START_HERE.md

Purpose

Defines how every Claude Code session starts.

Responsibilities

- Startup procedure
- Required reading order
- Repository synchronization
- GitHub synchronization
- Resume behavior
- Stop conditions

---

## CLAUDE.md

Purpose

Defines permanent AI behavior.

Responsibilities

- Development protocol
- Git policy
- Release policy
- QA policy
- Product memory
- Data rules
- Blueprint protection
- Continuous execution
- Multi-agent coordination

---

## WORKFLOW.md

Purpose

Defines what should be built next.

Responsibilities

- Development roadmap
- Milestones
- Priorities
- Product workflow
- Release sequence
- Workflow lifecycle
- Future backlog

---

## ACCEPTANCE.md

Purpose

Defines when work is considered complete.

Responsibilities

- Acceptance criteria
- PASS conditions
- FAIL conditions
- Privacy verification
- Workflow verification
- Release verification
- Evidence requirements

---

# Session Lifecycle

Every Claude Code session follows:

Start

↓

Read START_HERE.md

↓

Read CLAUDE.md

↓

Read WORKFLOW.md

↓

Read ACCEPTANCE.md

↓

Read PROJECT_STATE.json

↓

Read latest checkpoint

↓

Read latest review

↓

Determine active milestone

↓

Implement

↓

Verify

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

Continue automatically

---

# Responsibility Matrix

| File | Responsibility |
|------|----------------|
| START_HERE | Startup |
| CLAUDE | AI Behavior |
| WORKFLOW | Development Direction |
| ACCEPTANCE | Completion Rules |
| PROJECT_STATE | Current State |
| Checkpoint | Progress Record |
| Review | QA Summary |
| CHANGELOG | Release History |

---

# Governance Principles

- Blueprint First
- Case First
- Workspace First
- Single Source of Truth
- Wrap First
- Refactor Later
- Privacy First
- Evidence First
- Continuous Development

---

# Stop Conditions

Claude Code stops only when:

- Missing credentials
- External authorization
- Blueprint conflict
- Data-loss risk
- Security issue
- PII exposure

Otherwise:

Continue automatically.

---

# GitHub Policy

GitHub is the canonical project history.

Every session begins with:

git pull

Every completed checkpoint ends with:

git push

Development should always resume from the latest synchronized GitHub state.

---

# Multi-Agent Policy

Orbikt supports multiple AI systems.

Current responsibilities:

Claude Code

- Architecture
- Integration
- Development
- QA
- Git
- Release

Codex

- UI Components
- Visual Design

ChatGPT

- Governance
- Architecture Review
- Workflow Design
- Acceptance Design

External AI suggestions never override Blueprint.

---

# Document Ownership

Each governance file has one responsibility.

Do not duplicate content between governance files.

If a rule belongs elsewhere, reference that document instead of copying it.

---

# End

This README serves only as the governance index.

Development rules belong in their respective governance files.