# Orbikt Product Decisions

This document records all product decisions that have been finalized.

Claude Code must treat these decisions as immutable unless explicitly changed by the project owner.

---

## Product

Product Name

Orbikt

Mission

Plan Once.
Build Through.
Finish Completely.

---

## Product Philosophy

Orbikt is a Professional Workspace.

It is NOT:

- a portal
- a dashboard collection
- a collection of independent systems

Everything revolves around the Case Workspace.

---

## Architecture

Blueprint First Development.

No redesign during implementation.

Blueprint has the highest priority.

---

## Navigation

Homepage = Command Center

Command Center answers:

"What should I do today?"

NOT

"What functions are available?"

---

## Workspace

Every case has ONE Workspace.

All work must happen inside Workspace.

Workspace contains:

- Overview
- AA01
- FA310
- Dispatch
- Visit
- Genogram
- Attachments
- Timeline

---

## Module Rules

AA01 is NOT an independent homepage.

FA310 is NOT an independent homepage.

Dispatch is NOT an independent homepage.

Visit Manager is NOT an independent homepage.

Genogram is NOT an independent homepage.

All modules live inside Workspace.

---

## Source of Truth

Visit warning

SSOT = Visit Manager (Google Apps Script)

Dashboard must never create another visit warning algorithm.

---

Dispatch

SSOT = Existing Dispatch System

Dashboard displays dispatch status only.

---

Knowledge

Knowledge must preserve traceable sources.

AI answers must always reference the knowledge base.

---

## Team Calendar (2026-07-18, obj-orbikt-team-calendar-v1)

Orbikt Team Calendar（團隊行事曆）is the TEAM WORK-COORDINATION LAYER.

It is NOT a new SSOT for any business module:

- Visit Manager remains the SSOT for visit warnings.
- AA01 / FA310 / Dispatch keep their own business rules.
- The calendar projects system deadlines read-only and links back to the
  source module; it never recomputes or edits source-system data.

Permission model (V1):

- Case managers manage THEIR OWN events (create / edit / complete / cancel /
  soft-delete) and can view the team's schedule.
- Supervisors / admins manage ALL events, including reassignment and restore.
- Participants who are not the owner get read-only access.

Deletion is SOFT DELETE only. No permanent-delete UI. Supervisors can restore.

System-source events (`source !== "manual"`) cannot be deleted or edited in
the calendar; core changes route back to the source module.

Google Calendar: V1 ships NO two-way sync. The Team Calendar is the SSOT for
team events; Google Calendar is a possible future one-way export (ICS) only.

Persistence (V1): browser-local via a CalendarAdapter seam. This is NOT a
multi-user shared backend; a Supabase/API adapter is the planned upgrade path
and requires server-side authorization (RLS) — UI permissions are not a
substitute.

Privacy: calendar events follow the existing masked-identity rules. Only the
case display name and CaseID may appear; never raw national IDs, phones,
addresses, birth dates, or medical detail.

PROJECT_STATE location (audit 2026-07-18): the canonical machine-readable
state file is `project-state/PROJECT_STATE.json` (tracked in git). Earlier
remote checks looked for it at the repository root; START_HERE.md now states
the path explicitly. Do not create a second state file at the root.

---

## Orbikt v2 Repository Offline Foundation (2026-07-18, obj-orbikt-v2-cloud-auth-shared-workspace)

Baseline: all v2 work branches from `v1.7.1` / `7dcfae1`, which contains Team
Calendar V1. `main` is not a valid baseline for this objective.

Tenant naming: existing `Workspace` and `/workspace` continue to mean Case
Workspace. The shared ownership boundary uses `tenant_workspace`,
`tenant_workspace_id`, `TenantWorkspace`, and `TenantMembership`; product copy
may say Organization Workspace.

Schema source of truth: Supabase CLI migrations are canonical. Dashboard SQL
Editor/Table Editor changes do not define schema. Repository work may author
and test migration sources, but may not link, push, deploy, create Cloud Auth
users, or import data without later authorization.

Alias-domain decision: choose client-safe option C.

- Client-safe contract: `VITE_SUPABASE_URL`,
  `VITE_SUPABASE_PUBLISHABLE_KEY`, and `VITE_AUTH_ALIAS_DOMAIN`.
- Server-only contract: `SUPABASE_PROJECT_REF`, `SUPABASE_SECRET_KEY`, and
  `SUPABASE_DB_PASSWORD`.
- `VITE_AUTH_ALIAS_DOMAIN` is public identification configuration, not a
  secret. The browser may combine it with a normalized username and call
  Supabase `signInWithPassword` directly.
- The alias is not displayed in ordinary UI. Orbikt-controlled logs and audit
  rows never record an alias or username-to-alias mapping; Supabase necessarily
  stores the derived value as its Auth email identity. Missing or invalid
  configuration fails closed; production code has no fallback domain.
- Option A, a username resolver, cannot truly hide the alias because the
  browser must eventually send the email-shaped identifier to Supabase. It
  also adds a network dependency and failure surface.
- Option B, a login broker, would make Orbikt infrastructure handle the user's
  password and session exchange. That risk is not accepted.
- Admin create/reset remains a protected Edge Function responsibility. Secret
  keys, Admin API authority, and temporary-password generation remain on the
  server. Temporary passwords may be returned once to the authorized admin but
  are never stored or logged and use a `no-store` response.
- The admin Edge runtime receives its own configured copy of the public
  `VITE_AUTH_ALIAS_DOMAIN` value and never trusts a request-supplied domain.
- The approved variable names are the contract even where Supabase provides
  differently named platform defaults: `SUPABASE_SECRET_KEY` is an explicitly
  configured Orbikt secret, while `SUPABASE_PROJECT_REF` remains non-browser
  operational configuration.

Username policy: usernames are immutable and globally unique. One pure domain
service owns trim, lowercase, validation, and alias composition. Normalized
usernames are 3-32 ASCII characters and match
`^[a-z0-9]+(?:[._-][a-z0-9]+)*$`. Alias domains are validated lowercase ASCII
DNS hostnames up to 253 characters with at least two 1-63 character labels
matching `^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$`, and no scheme, path, port,
`@`, whitespace, or trailing dot. The alias is exactly
`<normalized-username>@<validated-domain>`. Synthetic alias domains are test
fixtures only.

Identity invariants: the shared browser/Edge service and a database CHECK use
the same username vectors. Admin creation derives the alias and sets
`email_confirm: true`. Public signup and Orbikt self-service invite, recovery,
OTP/magic-link, anonymous, identity-link, and email-change flows are absent.
An Auth email-update trigger prevents direct `updateUser({ email })` calls from
breaking the immutable alias mapping; because this touches managed Auth schema,
it requires local and later hosted verification.

Alias-domain lifecycle: project-level `system_settings` records the canonical
public alias domain before the first Auth user. Admin account operations require
that value to match the Edge runtime. A later domain change requires an explicit
identity migration and coordinated frontend rebuild, never routine config
rotation.

Roles: cloud authorization uses the Postgres enum `tenant_role` with
`admin`, `supervisor`, and `case_manager`. Existing `director` values map to
`supervisor` authorization while the displayed job title is preserved
separately. Roles never come from user-editable metadata.

Forced password change: the caller-scoped Supabase client changes the password
directly, then calls a narrowly granted database RPC without sending either
password to it. The RPC clears `user_security_states` only after finding the
caller's newer `user_updated_password` Auth audit event whose actor provenance
matches `auth.uid()`; admin/service reset events do not qualify. Database Auth
audit storage must stay enabled; a missing or delayed event leaves the user
restricted and is retried only with a bounded pending flow. This managed-schema
dependency is isolated and requires local plus later staging verification; no
`auth.users.encrypted_password` trigger or timestamp-only fallback is accepted.
Admin reset uses a fail-closed lock/reset/record-later-requirement/unlock
sequence so its own password event cannot satisfy the user's completion proof.
The cross-system reset has an operation ID and recoverable locked state; no
unlock occurs until postconditions are re-read. Retrying generates a new
temporary password rather than storing, reusing, or re-returning an old one.

Organization Workspace selection uses `/organization-workspaces`; `/workspace`
continues to mean Case Workspace. Zero memberships fail unavailable, one is
validated and auto-selected, and multiple require selection before data loads;
stale tenant IDs are never trusted and switches clear old tenant state.

Production composition: a cloud build must not import the current local case
seed, team roster, mock auth, or `LocalCalendarAdapter`. Missing Cloud config is
an explicit unavailable UI state with no Auth request or adapter construction,
never a silent local fallback. `npm run build:cloud` writes `dist-cloud/`; the
current local build remains an explicit development/import source.

Data and authorization: `auth.users.id` is the identity key. Tenant-owned data
uses explicit tenant foreign keys and RLS. Admins remain tenant-scoped.
`must_change_password` and disabled/suspended states deny normal business data
at the database boundary. Audit logs are append-only and exclude secrets.

Concurrency: mutable shared records use database-owned timestamps/actors and a
monotonic `row_version`. Remote writes include an expected version and surface
conflicts; they do not silently overwrite newer data.

Versioning: CP-0029 remains version 1.7.1. After all Repository Offline
Foundation acceptance evidence passes, development version `2.0.0-alpha.1` may
be adopted without a final `v2.0.0` tag. Final v2.0.0 requires Cloud acceptance.

---

## Development Rules

Existing systems should be integrated.

Do NOT rewrite completed systems.

Wrap first.

Refactor later.

---

## Stop Conditions

Claude Code may stop ONLY when:

- API key is missing
- External authorization is required
- Blueprint conflict exists
- Source system is missing
- Data loss may occur

Otherwise continue automatically.

---

## Release Goal

One planning.

Continuous implementation.

Release only after objective-scoped acceptance. Repository Offline Foundation
may reach an alpha version; final v2.0.0 requires authorized Cloud acceptance.
