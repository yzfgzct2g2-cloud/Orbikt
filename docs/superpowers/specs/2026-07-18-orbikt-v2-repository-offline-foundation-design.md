# Orbikt v2 Repository Offline Foundation Design

Objective: `obj-orbikt-v2-cloud-auth-shared-workspace`

Date: 2026-07-18

Baseline: `v1.7.1` / `7dcfae1`

## Outcome and boundary

This objective creates the version-controlled, locally testable foundation for
Supabase-backed authentication, tenant isolation, shared calendar persistence,
notifications, audit trails, and mobile navigation. It preserves the existing
Case Workspace, routes, Team Calendar domain rules, and source-system SSOTs.

Repository evidence may establish that source code, migrations, tests, and
build-time guards exist. It cannot establish that the Cloud schema, Cloud RLS,
Realtime, Auth, Edge Functions, or production deployment work. Those claims
remain blocked until explicitly authorized Cloud operations are executed.

## Delivery decomposition

The umbrella objective is implemented as five reviewable workstreams in this
order:

1. Governance, environment contracts, cloud-safe composition, and secret scans.
2. Supabase schema migrations, grants, RLS policies, and SQL test sources.
3. Supabase Auth session flow, tenant context, forced-password change, and
   undeployed admin Edge Function sources.
4. Shared calendar adapter, notification/audit foundations, local-data import
   preview, concurrency, retry, and Realtime abstractions.
5. Accessible mobile navigation, end-to-end regression coverage, offline
   acceptance review, and honest Cloud stop report.

Each workstream receives its own implementation plan and logical commits. A
later workstream may consume only interfaces committed by earlier workstreams.

## Naming and identity boundaries

`Workspace` and `/workspace` continue to mean the existing Case Workspace.
The tenant boundary uses `tenant_workspace`, `tenant_workspace_id`,
`TenantWorkspace`, and `TenantMembership`; product copy may say Organization
Workspace. A multi-membership user must select an Organization Workspace before
business data loads. The selector route is `/organization-workspaces`; it does
not reuse the Case Workspace route. Zero active memberships render an explicit
access-unavailable state. One active membership is auto-selected only after
server validation. Multiple active memberships require the selector before any
business adapter loads. Suspended memberships are excluded, and a stored tenant
ID is always revalidated. Switching tenants clears app, calendar, notification,
query, and subscription state before the new tenant loads.

Supabase `auth.users.id` is the authentication identity. Existing identifiers
such as `cm-001` remain legacy manager codes/usernames and are never treated as
Auth UUIDs. `user_profiles.username` is immutable and globally unique because
the login form has no tenant code.

Authorization roles are the fixed Postgres enum `tenant_role` with `owner`,
`admin`, `supervisor`, and `case_manager`. The V1 `director` value is a legacy
presentation/title value; cloud migration maps its authorization capability to
`supervisor` while preserving the displayed job title separately. Roles are
membership identities; database-backed permissions and per-membership
allow/deny overrides determine capabilities. `manager` and `viewer` are not
roles, and read-only access is composed through permissions.

## Environment and build isolation

Client-safe variables are:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_AUTH_ALIAS_DOMAIN`

Server-only variables are:

- `SUPABASE_PROJECT_REF`
- `SUPABASE_SECRET_KEY`
- `SUPABASE_DB_PASSWORD`

This is the user-approved Orbikt environment contract. `SUPABASE_SECRET_KEY`
is an explicitly configured Orbikt secret name rather than an assumption about
Supabase's automatically provided variable names. `SUPABASE_PROJECT_REF` is
operationally public but remains non-browser configuration under this contract;
all three server-only names are prohibited from frontend dependencies and
bundles.

`VITE_AUTH_ALIAS_DOMAIN` is public identification configuration, not a secret.
The same public value must be configured for the frontend build and admin Edge
Function runtime under the same client-safe name; it does not become secret
when used server-side, and the Edge Function never accepts a domain supplied by
a caller. Missing or invalid client configuration produces an explicit
configuration-unavailable state. Production code has no alias-domain default.
Synthetic domains such as `login.example.test` exist only in test fixtures.

Once an organization-controlled domain exists, a project-level
`system_settings.auth_alias_domain` records the canonical public value before
the first Auth user is created. Account creation/reset is blocked unless the
Edge runtime value matches it. Changing the domain after any Auth user exists
requires an explicit identity migration plus coordinated frontend rebuild; it
is never treated as ordinary configuration rotation. A stale frontend can fail
login but cannot provision an identity under a different domain.

The current local application statically imports sanitized-but-sensitive case
and team seed data. Cloud builds therefore use a separate entry/composition
path whose dependency graph never imports `Cs100DataAdapter`, tracked case seed,
`config/team.json`, or `LocalCalendarAdapter`. `npm run build:cloud` writes only
to `dist-cloud/`; the existing `npm run build` remains the local V1 build.
Missing or malformed client configuration does not fail compilation: the cloud
artifact renders a configuration-unavailable screen, disables login, constructs
no Supabase/business adapter, performs no Auth request, and never falls back to
local data or localStorage. A bundle/source-map scan verifies both secret
absence and seed exclusion.

## Authentication flow

The browser presents only username and password. One shared pure TypeScript
domain service, consumed by both the browser and admin Edge source,
trims and lowercases username, then requires 3-32 ASCII characters matching
`^[a-z0-9]+(?:[._-][a-z0-9]+)*$`. This permits lowercase letters, digits, and
single `.`, `_`, or `-` separators, while rejecting leading, trailing, or
consecutive separators. The public alias domain must be a lowercase ASCII DNS
hostname of at most 253 characters with at least two labels, no scheme, path,
port, `@`, whitespace, or trailing dot. Each 1-63 character label matches
`^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$`. The alias is exactly
`<normalized-username>@<validated-domain>`.

The database mirrors this contract with a normalized `username` CHECK and a
unique constraint/index. Shared normative vectors test browser/Edge parity and
the database rule so two raw inputs cannot create distinct accounts with the
same canonical username.

The UI never displays the resulting email-shaped identifier. The password goes
directly from the browser to Supabase `signInWithPassword`; no Orbikt Edge
Function, database RPC, or custom server sees normal login credentials. Login
failures use one generic message.

Public signup, invite, recovery, OTP/magic-link, anonymous, and manual identity
linking actions are absent from Orbikt UI and client services. Hosted Auth keeps
self-registration disabled. Admin creation always derives the alias and sets
`email_confirm: true`, so no alias mailbox is required. A protected
`BEFORE UPDATE OF email` database trigger rejects caller- and admin-initiated
Auth email changes after creation; an alias-domain migration must replace that
guard explicitly. Because `auth.users.email` is managed schema, local and later
hosted tests must verify the trigger and an attempted direct `updateUser` email
change before Cloud acceptance.

Session restoration completes before any business
adapter loads. Business routes require valid configuration, an authenticated
session, an active tenant membership, a non-disabled security state, and
`must_change_password = false`. `/login` is public; `/change-password` is the
only authenticated route permitted while password change is required. Logout
or tenant change clears all app and calendar memory.

The user changes a password directly through the caller-scoped Supabase client
with the current password; the implementation pins
`@supabase/supabase-js >= 2.102.0`, where the documented `current_password`
attribute is available. After Supabase accepts the change, the client calls
a narrowly granted `complete_forced_password_change()` database RPC without a
password. The RPC derives the user from `auth.uid()` and clears the protected
state only when a `user_updated_password` Auth audit event has caller provenance
matching `auth.uid()` and is newer than `password_change_required_at`. An admin
or service-originated reset event cannot satisfy the proof. Users otherwise
receive read-only access to their security state and cannot clear the flag
directly.

Supabase documents the password-completed audit action and database audit-log
storage, but also notes that audit entries may appear after a short delay and
that non-primary-key Auth schema details are managed. The RPC therefore uses a
bounded retry/pending state, never unlocks on missing evidence, and isolates the
Auth audit dependency in one migration. Database Auth audit storage must remain
enabled. Local and later staging acceptance must verify the exact hosted schema
and timing; no `auth.users.encrypted_password` trigger or timestamp-only
fallback is used.

The client does not optimistically navigate or clear local state. It re-reads
the authoritative security row after successful RPC completion and loads
business adapters only after observing `must_change_password = false`.

Admin reset is a recoverable cross-system state machine because Auth HTTP and
application-table changes cannot be one transaction. It records a reset
operation ID and locked state, updates the temporary password with the Admin
API, records a later `password_change_required_at`, sets
`must_change_password = true`, re-reads those postconditions, and only then
unlocks the account. This ordering prevents the admin-generated password event
from satisfying the user's later completion proof. A failure after any step
keeps live RLS access locked/restricted and exposes a safe admin recovery
status. A retry generates a new temporary password; it never stores, reuses, or
re-returns an earlier one. If a response is lost after success, the admin must
perform a new reset to obtain a new temporary password.

## Privileged account administration

Undeployed Edge Function sources provide create, enable/disable, role assign,
temporary-password reset, non-sensitive status, and sanitized login-audit
summary interfaces. Every request verifies the bearer token, resolves the
caller with Supabase Auth, checks an active same-tenant admin membership, and
validates the target tenant before using the server-only admin client.

Temporary passwords are generated server-side, sent to Supabase Auth, returned
once to the authorized admin with `Cache-Control: no-store`, and never stored
or logged. The admin UI keeps the value only in component memory and clears it
on dialog close, navigation, or unmount. Errors are sanitized and response
bodies are excluded from telemetry. Orbikt-controlled logs exclude passwords,
username-to-alias mappings, aliases, JWTs, refresh tokens, API keys,
authorization headers, and database credentials. Supabase necessarily stores
the derived alias as the Auth email identity and owns its platform/Auth audit
records. Missing or mismatched alias configuration or secret credentials fails
closed. No function is deployed in this objective.

## Database foundation

Supabase CLI migrations are the only schema source of truth. The minimum
application model contains:

- `tenant_workspaces`
- `tenant_memberships`
- `user_profiles`
- `user_security_states`, including `password_change_required_at`, reset
  operation status, and lock state
- `cases` with browser-approved fields only and no imported data
- `calendar_events` and `calendar_event_participants`
- `notifications`
- append-only `audit_logs`
- project-level `system_settings`
- `tenant_settings`

No passwords table is created. Login events remain Supabase Auth's audit
responsibility; the application does not create a duplicative
`login_audit_events` table until a stable, privacy-reviewed ingestion need is
approved.

Tenant-owned mutable records use UUID primary keys, `tenant_workspace_id`,
database-generated timestamps/actors where applicable, soft deletion where the
domain supports it, and `row_version bigint` for optimistic concurrency. The
database, not the client, supplies authoritative actors and timestamps.

## RLS and grants

Every exposed application table explicitly revokes default access, grants only
required operations, enables RLS, and declares operation-specific policies.
Private helper functions use fixed search paths and derive identity from
`auth.uid()`.

Business access requires an active membership in the row's tenant, a globally
enabled security state, and `must_change_password = false`. Admin authority is
tenant-scoped. Users in the forced-change state can read only the minimum own
profile/security data required to complete the flow. Audit rows are written by
trusted database/server paths; authenticated clients cannot insert, update, or
delete them. Admins may read sanitized audit rows for their own tenant.

SQL test sources cover tenant isolation, role limits, suspended membership,
forced-password restriction, password-completion evidence and reset ordering,
username normalization/uniqueness, immutable Auth email, soft-delete
visibility, concurrency conflicts, and audit immutability. Account-handler unit
tests inject Auth/Admin/DB boundaries and fail each reset step to verify locked,
recoverable postconditions. Because this workstation currently has neither
Docker nor the Supabase CLI, SQL tests are recorded as not executed until local
Supabase becomes available; static inspection is not reported as an RLS PASS.

## Calendar, notifications, and audit

The existing Calendar domain and UI remain. A store factory receives a
`CalendarAdapter`; production composition selects `SupabaseCalendarAdapter`,
while local mode explicitly selects `LocalCalendarAdapter`. The remote adapter
maps database UUIDs and versions privately, rejects stale expected versions,
and returns canonical database rows. A separate subscription interface keeps
Realtime optional and testable. Optimistic updates retain rollback and retry
state.

Local calendar data is never uploaded automatically. An import service parses
and validates the V1 localStorage shape, shows a synthetic-data preview,
requires explicit user confirmation in a later authorized Cloud phase, and
uses an idempotency key. This objective performs no Cloud import.

Notifications store one tenant-scoped recipient per row with category,
priority, source, entity reference, summary, `read_at`, and minimal future
channel metadata. Push, email, and LINE delivery are out of scope. Audit data
is append-only and stores only non-secret metadata.

## Mobile navigation

`navItems` remains the single navigation source. `AppShell` owns drawer state;
desktop `Sidebar` and a mobile drawer share navigation rendering. The mobile
trigger and drawer support `aria-expanded`, `aria-controls`, Escape, overlay
click, route-close, focus trap/restoration, safe-area padding, 44-pixel touch
targets, and underlying-scroll lock without changing desktop behavior.

DOM tests verify interaction and accessibility. Browser automation verifies
computed responsive behavior at representative widths. Results are described
as automated responsive coverage, never as physical-device testing.

## Verification and version policy

Required evidence includes typecheck, lint, all Vitest tests, component tests,
browser tests, adapter contracts, secret/env scans, cloud-bundle seed scans,
builds, Team Calendar regression tests, and a clean working tree. SQL/RLS local
integration is separately reported as PASS, failed, or not executed.

Protected-route tests cover restoring, signed-out deep links, active access,
zero/one/multiple memberships, stale tenant selection, forced-change-only
routing, disabled users, logout, and tenant-switch cleanup. Configuration tests
cover every missing/malformed/partial client variable and assert no network or
local fallback. Mobile tests cover dialog semantics, accessible trigger/state,
Escape/overlay/navigation close, focus trap/restoration, scroll cleanup,
complete navigation, touch targets, safe areas, and behavior below/above the
1024px desktop breakpoint. Cloud scans inspect `dist-cloud/` plus source maps
for seed/team sentinels, server-only names, secret patterns, and forbidden local
composition modules.

The governance baseline remains `1.7.1`. After all Repository Offline
Foundation acceptance checks pass, the branch may use development version
`2.0.0-alpha.1` without creating a formal `v2.0.0` tag. Final `v2.0.0` remains
blocked on authorized Cloud deployment and Cloud acceptance evidence.

## Cloud stop conditions

This design does not authorize `supabase link`, `db push`, Edge Function
deployment, Auth user creation, Realtime publication, frontend staging
deployment, data import, or any real-data operation. The missing
organization-controlled alias domain and absent server secret configuration
remain explicit Cloud blockers. Free staging may receive synthetic data only.

## Supabase references and managed-schema risk

- [Auth audit logs](https://supabase.com/docs/guides/auth/audit-logs) documents
  `user_updated_password`, Postgres storage, and possible short propagation
  delay.
- [Password security](https://supabase.com/docs/guides/auth/password-security)
  documents caller-scoped current-password updates.
- [User management](https://supabase.com/docs/guides/auth/managing-user-data)
  warns that non-primary-key objects in the managed Auth schema may change.
- [Auth schema restrictions](https://supabase.com/changelog/34270-restricting-access-on-auth-storage-and-realtime-schemas-on-april-21-2025)
  confirms that database triggers remain permitted on `auth.audit_log_entries`
  and `auth.users`; this design deliberately avoids an Auth-user hash trigger.
