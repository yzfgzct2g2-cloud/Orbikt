# Orbikt Migration Map

## Purpose

This file defines how existing systems should be migrated or integrated into Orbikt V1.

Orbikt V1 is not a rewrite project. Existing completed systems should be wrapped, integrated, and gradually refactored into the Orbikt workspace.

---

## Migration Principles

1. Preserve existing working logic.
2. Do not duplicate business rules.
3. Use Orbikt as the unified workspace.
4. Existing systems become Orbikt modules.
5. Dashboard reads module status; it does not recreate module logic.
6. Case Workspace is the main operating surface.

---

## System Mapping

| Existing System | Current Status | Orbikt Module | Integration Method | V1 Requirement |
|---|---|---|---|---|
| AA01 撰寫系統 | Completed | Planner | Integrate into Workspace > AA01 | Must preserve generator, validation, rules, and output |
| FA310 審查系統 | Completed / Source pending if not copied | Review | Integrate into Workspace > FA310 | Must preserve review rules and correction suggestions |
| 派案系統 | External Console / API | Dispatch | Dashboard panel + Workspace tab + external link/API-ready adapter | Must show dispatch status in Command Center |
| 家訪倒數網頁 | Google Apps Script | Visit Manager | Use as SSOT for visit warnings | Dashboard must read or link to Visit Manager, not recalculate |
| 長照法規整合系統 | Completed | Knowledge Hub | Integrate as Knowledge page and Workspace reference panel | Must preserve search, code map, effective date, FAQ |
| 互動家系圖 | Canvas prototype | Genogram | Create Workspace tab and integration placeholder | V1 provides workspace shell and future integration point |
| LongCare QA Engine | Completed | Knowledge / AI Support | Keep as backend-compatible knowledge QA source | V1 prepares adapter only if available |
| longcare-user-auth-test | Completed | Auth / Settings | Reuse auth concepts and role model | V1 may use local mock auth unless full auth is ready |

---

## Target Orbikt Structure

```text
Orbikt
├── Command Center
│   ├── Total caseload
│   ├── Today tasks
│   ├── Visit warnings
│   ├── Dispatch live status
│   ├── Documents
│   └── Notifications
│
├── Cases
│   └── Case List
│
├── Workspace
│   ├── Overview
│   ├── AA01 / Planner
│   ├── FA310 / Review
│   ├── Dispatch
│   ├── Visit
│   ├── Genogram
│   ├── Attachments
│   └── Timeline
│
├── Knowledge
├── Documents
├── Notifications
└── Settings

```

Detailed Mapping
1. AA01 撰寫系統 → Planner

Source:

source-systems/aa01-ai-system

Target:

src/modules/planner
src/workspace/tabs/AA01Tab.tsx

Requirements:

Preserve existing AA01 generation logic.
Preserve assessment rules.
Preserve validation.
Preserve service planning logic.
Preserve output format.
Bind AA01 data to Case ID.
Show AA01 status in:
Command Center
Case List
Workspace Overview

Do not:

Rewrite AA01 rules from scratch.
Create a separate AA01 homepage.
### 2. FA310 審查系統 → Review

Source:

LongCare-QA-Engine

Primary Domain:

domains/fa310

Service Entry:

api.py

Technology:

Python

Integration Strategy:

HTTP Adapter

Target:

src/modules/review

src/workspace/tabs/FA310Tab.tsx

Requirements:

- Preserve FA310 deterministic review rules.
- Preserve review results.
- Preserve correction suggestions.
- Preserve review history.
- Link review result to Case ID.
- Access QA Engine through adapter/API.
- Never duplicate FA310 business rules inside React.

Do not:

- Create another FA310 engine in React.
- Rewrite review logic.
- Duplicate deterministic rules.
3. 派案系統 → Dispatch

Source:

External Console / API

External URL is defined in:

config/external-links.md

Target:

src/modules/dispatch
src/components/dashboard/DispatchPanel.tsx
src/workspace/tabs/DispatchTab.tsx

Requirements:

Show live or mock dispatch status.
Display:
dispatching
waiting
timeout
accepted
no capacity
manual required
closed
Provide external link to current dispatch console.
Prepare API adapter for future integration.

Command Center must show:

派案中
等待回覆
Timeout 即將到期
全數無人力
人工介入
已完成

Do not:

Rebuild dispatch logic if external system is active.
Break existing dispatch console.
4. 家訪倒數網頁 → Visit Manager

Source:

Google Apps Script

External URL is defined in:

config/external-links.md

Target:

src/modules/visit
src/components/dashboard/VisitWarningCards.tsx
src/workspace/tabs/VisitTab.tsx

Requirements:

Treat Visit Manager as SSOT.
Dashboard only reads, imports, or links to visit warning result.
Display 30-day and 60-day warning separately.
Display:
case name
manager
last visit date
next due date
remaining days
status

Warning status:

normal
within_60
within_30
overdue
scheduled
completed

Do not:

Create a second independent visit warning calculator unless explicitly implemented as adapter matching existing GAS logic.
5. 長照法規整合系統 → Knowledge Hub

Source:

source-systems/knowledge

Target:

src/modules/knowledge
src/pages/Knowledge.tsx
src/workspace/right-panel/KnowledgeReferences.tsx

Requirements:

Preserve:
laws
appendices
service codes
code map
effective dates
transitions
FAQ
practical knowledge
assistive device knowledge
Provide independent Knowledge page.
Provide Workspace right-panel references.

Do not:

Remove citation or source structure.
Allow AI answer without traceable reference.
6. 互動家系圖 → Genogram

Source:

Canvas prototype

Target:

src/modules/genogram
src/workspace/tabs/GenogramTab.tsx

V1 Requirements:

Create Genogram tab in Workspace.
Allow future embedded genogram system.
Provide placeholder only if prototype source is not ready.
Placeholder must clearly state integration status.
Link Genogram data to Case ID when ready.

Do not:

Invent incomplete genogram logic if current prototype is not ready.
Block V1 release because Genogram is prototype.
7. LongCare QA Engine → Knowledge / AI Support

Source:

source-systems/LongCare-QA-Engine

Target:

src/modules/qa
src/modules/assistant

V1 Requirements:

Prepare adapter.
Do not require live AI API for V1.
Use mock or local response if API key is absent.

Do not:

Block build because AI API key is missing.
8. longcare-user-auth-test → Auth / Settings

Source:

source-systems/longcare-user-auth-test

Target:

src/modules/auth
src/pages/Settings.tsx

V1 Requirements:

Implement role model:
case_manager
supervisor
director
admin
V1 may use mock auth.
Preserve future upgrade path to real auth.

Do not:

Block V1 because production auth is not complete.
Dashboard Mapping

Command Center widgets must map to source modules:

Widget	Source of Truth	Notes
Total Caseload	Case data / team.json	Hover shows manager caseload
Today Tasks	Task adapter + Calendar adapter	Includes Orbikt + calendar + module tasks
Today Schedule	Calendar adapter	Google Calendar / ICS-ready
30-Day Visit Warning	Visit Manager	Must not recalculate independently
60-Day Visit Warning	Visit Manager	Must not recalculate independently
Dispatch Status	Dispatch adapter	External now, API-ready later
Documents	Document Center	OneDrive link-first
Recent Cases	Case activity	Local activity log
Notifications	Notification module	Unified notification center
Workspace Mapping

Each Case Workspace must include:

Tab	Source
Overview	Case + Task + Timeline
AA01	Planner
FA310	Review
Dispatch	Dispatch
Visit	Visit Manager
Genogram	Genogram
Attachments	Documents
Timeline	TimelineEvent
V1 Integration Strategy

Phase order:

1. Create Orbikt shell
2. Create mock data adapters
3. Create Command Center
4. Create Case Workspace
5. Integrate Visit Manager shell
6. Integrate Dispatch shell
7. Integrate AA01
8. Integrate FA310
9. Integrate Knowledge
10. Integrate Genogram shell
11. Integrate Documents
12. Final polish and release
Hard Rules

Claude Code must not:

Convert Orbikt into a link directory.
Recalculate Visit Manager logic in Dashboard.
Rewrite AA01 logic unless necessary for integration.
Break existing working source systems.
Block V1 due to external API keys.
Remove source traceability from Knowledge Hub.
Create separate AA01 / FA310 / Dispatch homepages.
Leave TODO, FIXME, or unexplained placeholder.
Stop for ordinary UI or code decisions.
Change Blueprint scope without explicit user approval.
V1 Acceptance

Migration is complete when:

Existing systems are visible inside Orbikt structure.
Dashboard reads module status.
Case Workspace is the main operating surface.
OneDrive documents are accessible.
Dispatch status is visible.
Visit warning is visible.
AA01 and FA310 are accessible from Workspace.
Knowledge Hub is accessible and referenceable.
Genogram tab exists with integration path.