# Orbikt Acceptance Criteria

Version: Governance V2  
Status: Active

---

# Purpose

ACCEPTANCE.md defines when Orbikt work is truly complete.

A feature is not complete just because it renders.

A milestone is not complete just because it builds.

A release is not complete just because tests pass.

Claude Code must use this file to determine whether work can be marked Completed.

---

# Acceptance Principles

## 1. Technical success is required but not sufficient

The following are required for every checkpoint:

- typecheck PASS
- lint PASS
- tests PASS
- build PASS
- no known console errors
- git working tree clean

But these alone do not mean the milestone is complete.

---

## 2. Workflow success is required

Every feature must improve the actual long-term care case management workflow.

If a feature exists but does not help the user complete work faster, clearer, or more safely, it is not accepted.

---

## 3. Blueprint must be preserved

Acceptance fails if implementation violates:

- Command Center as homepage
- Cases as registry / triage list
- Workspace as case operating surface
- AA01 inside Workspace
- FA310 inside Workspace
- Dispatch inside Workspace / Command Center
- Visit Manager as SSOT
- Knowledge source traceability
- Data privacy rules

---

## 4. Privacy must always pass

Any raw PII exposure fails Acceptance immediately.

This includes:

- raw national ID
- phone number
- street address
- full birth date
- raw source Excel content
- source file contents in browser bundle
- service secrets
- `.env`
- serviceAccountKey files

---

## 5. Completion requires evidence

Claude Code must provide evidence when claiming Acceptance PASS.

Evidence may include:

- route smoke test
- unit test
- adapter test
- generated report
- screenshot or DOM verification
- import report
- console-error check
- git status
- build/test output

---

# Morning Workflow

## Goal

Open Orbikt.

Within one screen, the user should understand today's work without needing to search through multiple pages.

---

## PASS only if

✓ Command Center is the homepage.

✓ Dashboard is readable without excessive scrolling.

✓ Today Tasks show planned work rather than only overdue items.

✓ Today's meetings are visible.

✓ Visit warnings are visible.

✓ Dispatch follow-up is visible.

✓ Abnormal Notifications are clearly distinguished from normal notifications.

✓ Eisenhower Matrix is visible and classifies current work.

✓ Clicking any dashboard item opens the correct destination.

✓ Dashboard is not used as a module launcher.

---

## FAIL if

✗ User cannot determine today's priorities.

✗ Important abnormal items are hidden.

✗ Dashboard requires excessive scrolling before important information appears.

✗ Dashboard duplicates Workspace functionality.

✗ Dashboard violates Blueprint.

---

# Data Center

## Goal

Data Center is the single entry point for all Orbikt source systems.

It is responsible for importing, validating, matching, sanitizing, and generating safe data for the application.

---

## PASS only if

✓ CS100 imports successfully.

✓ FA310 imports successfully.

✓ Import Report is generated.

✓ Import History is recorded.

✓ Import Log is recorded.

✓ Record count is displayed.

✓ Source status is displayed.

✓ Matching between FA310 and CS100 completes successfully.

✓ Generated data contains no raw National ID.

✓ Generated data contains no raw phone number.

✓ Generated data contains no raw address.

✓ Generated data contains no raw birth date.

✓ Generated data is used by the DataAdapter.

✓ Browser never reads raw Excel files directly.

✓ Import failures produce understandable error messages.

---

## FAIL if

✗ Raw Excel files are exposed to the browser.

✗ Raw National ID reaches frontend data.

✗ Matching silently fails.

✗ Import report is missing.

✗ Import status is unknown.

✗ Generated data cannot be reproduced.

---

## Required Outputs

Data Center should provide:

- Import Center
- Source Status
- Import Report
- Import History
- Import Log
- Matching Result
- Validation Result
- Generated Data Status
- Data Health Summary

---

## Matching Rules

Priority order:

1. FA310
2. CS100

Manager assignment should always use FA310 first when available.

CS100 is used only as a secondary reference.

Raw National ID exists only during import-time matching.

Frontend must display only:

- Case ID
- maskedNationalId
- Manager Name
- Safe workflow fields

---

# Workspace

## Goal

Workspace is the primary operating surface for one selected case.

It should feel like entering a complete case file, not browsing another list page.

---

## PASS only if

✓ Workspace opens from a selected case.

✓ Case banner is visible.

✓ Case name is visible.

✓ Case ID is visible.

✓ maskedNationalId is visible when needed for review.

✓ Responsible manager is visible.

✓ CMS level is visible when available.

✓ Case status is visible.

✓ Overview tab is available.

✓ AA01 tab is available.

✓ FA310 tab is available.

✓ Dispatch tab is available.

✓ Visit tab is available.

✓ Genogram tab is available.

✓ Attachments tab is available.

✓ Timeline tab is available.

✓ Knowledge references are available when relevant.

✓ Next action is visible.

✓ Case-specific abnormal items are visible.

✓ Workspace is visually distinct from Cases.

✓ User does not need to re-search the same case after entering Workspace.

---

## FAIL if

✗ Workspace looks the same as Cases.

✗ Workspace is only a navigation shell without useful case context.

✗ Case-specific data is missing.

✗ AA01 / FA310 / Dispatch / Visit are separated into unrelated pages.

✗ User must repeatedly search for the same case.

✗ Workspace exposes raw PII.

---

## Required Tabs

Workspace must contain:

- Overview
- AA01
- FA310
- Dispatch
- Visit
- Genogram
- Attachments
- Timeline

---

## Case File Principle

Everything inside Workspace must be scoped to the selected case.

If information is global, it belongs outside Workspace.

If information is case-specific, it belongs inside Workspace.

---

# Privacy

## Goal

Orbikt protects personally identifiable information (PII).

Raw personal information may exist only during authorized import processing.

Browser-facing data must always be sanitized.

---

## PASS only if

✓ Browser contains no raw National ID.

✓ Browser contains no phone number.

✓ Browser contains no street address.

✓ Browser contains no full birth date.

✓ Browser never receives raw Excel data.

✓ Browser never receives raw source-system records.

✓ Browser never exposes service credentials.

✓ Generated data contains only approved safe fields.

✓ Import pipeline removes raw identifiers before generation.

✓ Source files remain inside the designated input location.

---

## Allowed Browser Data

✓ Full Name

✓ Case ID

✓ maskedNationalId

✓ Responsible Manager

✓ CMS Level

✓ Workflow Status

✓ Timeline Records

✓ Generated Assessment Results

---

## FAIL if

✗ Raw National ID is visible.

✗ Raw phone number is visible.

✗ Raw address is visible.

✗ Full birth date is visible.

✗ Source Excel content is bundled into the frontend.

✗ Import scripts expose raw identifiers to browser code.

✗ Secrets, API keys, serviceAccountKey, or .env values are exposed.

---

## Privacy Principle

Raw identifiers may be used only during controlled import-time processing.

Generated data is the only data source available to the frontend.

Any raw PII exposure immediately fails Acceptance.

---

# Release

## Goal

A release is considered complete only when both technical verification and workflow acceptance have passed.

A successful build alone does not constitute a successful release.

---

## PASS only if

✓ ACCEPTANCE.md requirements pass.

✓ typecheck passes.

✓ lint passes.

✓ all tests pass.

✓ build succeeds.

✓ no known console errors remain.

✓ PROJECT_STATE.json is updated.

✓ CHANGELOG.md is updated when required.

✓ checkpoint is created.

✓ review document is created.

✓ commit is completed.

✓ working tree is clean.

✓ release tag is created when a version changes.

✓ push succeeds, or an authorized authentication Stop Condition is reported.

✓ GitHub is synchronized after push.

---

## FAIL if

✗ Build succeeds but Acceptance fails.

✗ Tests are skipped.

✗ PROJECT_STATE.json is outdated.

✗ Checkpoint is missing.

✗ Review is missing.

✗ Git working tree contains unexpected files.

✗ Push silently fails.

✗ Release tag points to the wrong commit.

---

## Required Verification

Every release should provide evidence for:

- Typecheck
- Lint
- Tests
- Build
- Git Status
- Acceptance
- Checkpoint
- Review
- Version
- Tag
- Push Result

---

## Release Principle

No milestone may be marked Completed until Release Acceptance has passed.

A release must always be reproducible from GitHub.

---

# Command Center

## Goal

Command Center is the operational dashboard for the entire day.

It answers one question:

"What should I work on right now?"

It is not a module launcher.

---

## PASS only if

✓ Command Center is the homepage.

✓ Important information is visible without excessive scrolling.

✓ KPI summary is visible.

✓ Today's Tasks are visible.

✓ Abnormal Notifications are visible.

✓ Visit Warnings are visible.

✓ Dispatch status is visible.

✓ Today's Schedule is visible.

✓ Eisenhower Matrix is visible.

✓ Clicking an item opens the correct destination.

✓ Dashboard does not duplicate Workspace.

✓ Dashboard does not duplicate Cases.

---

## FAIL if

✗ Dashboard is only a collection of navigation cards.

✗ User cannot identify today's priorities.

✗ Dashboard becomes another module page.

✗ Dashboard requires unnecessary scrolling.

✗ Important abnormal items are hidden.

---

# Cases

## Goal

Cases is the registry and triage center.

It is not the operating workspace.

---

## PASS only if

✓ Case search works.

✓ Case sorting works.

✓ Case filtering works.

✓ Manager is visible.

✓ maskedNationalId is searchable.

✓ Last-four National ID search works.

✓ Case status is visible.

✓ Opening a case enters Workspace.

✓ Cases and Workspace are visually distinct.

---

## FAIL if

✗ Cases duplicates Workspace.

✗ User edits the entire case directly inside Cases.

✗ Raw National ID appears.

---

# Automation

## Goal

Automation reduces manual work without hiding important information.

---

## PASS only if

✓ Automation is explainable.

✓ Automation is traceable.

✓ Automation can be verified by users.

✓ Automation never silently changes important data.

✓ Abnormal cases remain visible.

✓ User can understand why an automated result occurred.

---

## FAIL if

✗ Automation cannot explain its decision.

✗ Automation hides abnormal conditions.

✗ Automation cannot be traced.

---

# External Integration

## Goal

External systems connect through adapters.

Orbikt always provides a safe fallback.

For v2, safe fallback means an explicitly selected local/development or
read-only adapter mode. Production cloud composition must never select mock
data or localStorage merely because configuration or a remote service is
unavailable.

---

## PASS only if

✓ Adapter exists.

✓ Missing authorization triggers a Stop Condition.

✓ Safe fallback mode remains available.

✓ External failure does not corrupt Orbikt data.

✓ Live integration is never faked.

---

## FAIL if

✗ External failure crashes Orbikt.

✗ Missing credentials are ignored.

✗ Placeholder data is presented as live production data.

---

# Orbikt v2 Repository Offline Foundation

## Goal

Produce a reproducible Supabase/Auth/shared-workspace foundation without
misrepresenting Repository evidence as Cloud evidence.

## PASS only if

✓ Existing Case Workspace routes and Blueprint remain intact.

✓ Tenant concepts use explicit `tenant_workspace` naming.

✓ Supabase CLI migrations are the only schema source of truth.

✓ Every exposed application table has explicit grants, RLS enablement, and
operation-specific policy source.

✓ SQL test sources cover tenant isolation, role boundaries, suspended access,
forced-password restrictions/completion evidence, reset ordering, username
uniqueness, immutable Auth email, soft deletion, concurrency, and audit
immutability.

✓ Client login sends passwords directly to Supabase Auth and never through an
Orbikt Edge Function or custom server.

✓ Username normalization is centralized and enforces the recorded 3-32
character policy. Browser and Edge consume the same pure service, the database
mirrors it, and normative parity vectors cover invalid/ambiguous input and alias
composition.

✓ Admin creation derives the alias, confirms it without requiring an inbox,
and direct caller attempts to change Auth email fail. Orbikt exposes no public
signup, invite, recovery, OTP/magic-link, anonymous, identity-link, or
self-service email-change action.

✓ Forced-password completion sends no password to an Orbikt server or database
RPC and remains restricted unless a newer Supabase password-change audit event
with caller—not admin/service—provenance is verified. The client re-reads
authoritative security state before leaving the restricted route.

✓ Every missing, malformed, or partial client configuration state renders a
value-free configuration-unavailable screen, disables login, creates no
Supabase/business adapter, makes no Auth request, and has no runtime default.

✓ Server-only environment names are absent from the frontend dependency graph
and production bundle.

✓ `npm run build:cloud` writes `dist-cloud/`, while the existing local build
remains separate. The cloud dependency graph and bundle/source maps contain no
tracked case seed, team roster, mock auth, or local calendar adapter.

✓ Production cloud mode never silently selects mock data or localStorage.

✓ Privileged account-management source verifies caller identity, active
same-tenant admin membership, and target tenant before using Admin API access.

✓ The project canonical alias domain and Edge value must match before account
operations. Changing a domain after user creation is blocked unless performed
as an explicit identity migration with a coordinated frontend rebuild.

✓ Reset-handler tests fail every cross-system step and prove that partial work
stays locked, is recoverable, and never reuses or re-returns an old temporary
password. Existing sessions remain blocked by live data policy checks.

✓ Real/generated temporary passwords, real/production aliases, tokens,
authorization headers, API keys, and database credentials are absent from
Orbikt logs and committed fixtures. Temporary-password responses use
`Cache-Control: no-store`, sanitized errors, and UI memory cleanup. Clearly
marked synthetic redaction sentinels and identifiers such as
`login.example.test` are allowed only in tests.

✓ Audit logs are append-only for authenticated clients.

✓ Protected-route tests cover restoring, signed-out deep links, active access,
forced-change-only routing, disabled/zero-membership states, logout, and tenant
switch cleanup. One membership is validated/auto-selected; multiple require
`/organization-workspaces`; stale or suspended memberships are never trusted.

✓ Mobile navigation tests cover accessible trigger/dialog state,
Escape/overlay/navigation close, focus trap/restoration, scroll cleanup,
complete `navItems`, 44px touch targets, safe areas, and computed behavior below
and above 1024px without claiming physical-device coverage.

✓ Typecheck, lint, tests, builds, secret scans, bundle scans, and Team Calendar
regressions pass.

✓ Any unavailable Docker/Supabase integration checks are reported as not
executed rather than PASS.

## FAIL if

✗ Repository work is described as Cloud deployed, Cloud verified,
production-ready, or final v2.0.0.

✗ Cloud operations occur without explicit authorization.

✗ A fake runtime/Cloud alias-domain value, secret, Cloud Auth user, or real-data
import is introduced. Explicit reserved test-domain fixtures are not runtime
configuration and do not violate this rule.

✗ An unauthenticated, wrong-tenant, suspended, or forced-password user can
access normal business data under the authored policy model.

✗ A missing, delayed, or older password-change audit event clears
`must_change_password`.

✗ A direct Auth API call can change the derived email identity, or an admin
account is created without the canonical alias and confirmed-email policy.

✗ A forced-change or tenant-selection flow loads a business adapter before its
authoritative state is validated.

## Scoped acceptance classification

Repository Offline Foundation acceptance may pass when all available
Repository checks pass, required SQL integration tests exist, and unavailable
Docker/local-Supabase execution is reported as **Not Executed**. That result
does not verify RLS behavior. Overall Orbikt v2 acceptance remains FAIL until
the SQL suite and later authorized Cloud acceptance both pass.

---

# Overall Acceptance Rule

Orbikt is accepted only when:

✓ Blueprint is preserved.

✓ Acceptance Criteria pass.

✓ Workflow is improved.

✓ Privacy is protected.

✓ Release verification passes.

✓ GitHub becomes the reproducible source of truth.

Otherwise,

Acceptance = FAIL.

---

# Acceptance Lifecycle

Every milestone follows the same acceptance lifecycle.

Implementation

↓

Verification

↓

Acceptance Review

↓

Checkpoint

↓

Review

↓

Commit

↓

Push

↓

Release

↓

Completed

Claude Code must never skip lifecycle stages.

Claude Code must never mark work as Completed before Acceptance passes.

If Acceptance fails,

the milestone automatically returns to

"In Progress".

---

# Evidence Requirements

Every Acceptance PASS must provide evidence.

Acceptable evidence includes:

✓ Typecheck output

✓ Lint output

✓ Test results

✓ Build results

✓ Git status

✓ Checkpoint document

✓ Review document

✓ PROJECT_STATE.json update

✓ CHANGELOG update (when applicable)

✓ Version number

✓ Release tag (when applicable)

✓ Push result

✓ Runtime verification

✓ Console error verification

✓ Import report

✓ Adapter verification

Claims without evidence do not satisfy Acceptance.

When evidence is unavailable,

Acceptance must remain FAIL.
