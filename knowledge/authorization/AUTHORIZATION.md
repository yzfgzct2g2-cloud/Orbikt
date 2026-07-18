# Orbikt Authorization SSOT

This document is the single repository-level description of Orbikt V2 authorization. It describes authorization independently of any UI, API, Supabase client, or deployment implementation.

## Scope

Authorization applies to Organization Workspace tenant data and every module operating inside that tenant. The existing Case Workspace remains the case operating surface at `/workspace`; it is not the tenant itself.

## Authentication and authorization

Authentication establishes the caller identity. Authorization decides whether that authenticated identity may perform an action in a tenant. Authentication is not authorization, and a role alone never bypasses permission evaluation.

## Fixed vocabulary

- `tenant_workspaces`: Organization Workspace tenant boundary.
- `tenant_memberships`: relationship between an authenticated user and a tenant.
- Tenant roles: `owner`, `admin`, `supervisor`, `case_manager`.
- Legacy `director`: maps to `supervisor` authorization; the displayed title may remain separate.
- Permission: a named `module.action` capability.
- User override: a membership-scoped explicit `allow` or `deny`; `deny` wins.
- RLS: the final database enforcement boundary.

Viewer and Manager are not roles. Read-only access is a permission combination, normally produced by denying write permissions for a membership.

## Authorization evaluation order

Every protected operation follows this exact order:

```text
Request
  ↓
Authenticated
  ↓
Tenant Membership
  ↓
Membership Active
  ↓
Permission
  ↓
User Override
  ↓
RLS
  ↓
Allow / Deny
```

The operation fails closed at the first missing or invalid condition. A caller cannot select a tenant ID to bypass membership validation, and a client cannot replace the database decision with a UI decision.

## Authorization principles

- Default Deny: no grant exists without an explicit policy.
- Least Privilege: each action receives the smallest permission needed.
- Explicit Grant: role mappings and overrides are recorded, not inferred from labels.
- No Role Bypass: roles identify membership; permissions authorize actions.
- Permission First: module code asks for capabilities, not job titles.
- Tenant Isolation: every tenant-owned record is evaluated against the active membership tenant.
- Immutable Identity: usernames and identity keys are not casually reassigned.
- Server-side Enforcement: database RLS remains authoritative even when UI checks exist.
- Fail Closed: missing configuration, membership, security state, or permission denies access.

## Change boundary

This SSOT does not authorize Auth integration, Cloud operations, Edge Functions, Realtime, or production deployment. The repository database source is documented separately in `docs/database/`.
