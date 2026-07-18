# Orbikt RLS Authorization Model

## Tenant boundary

Organization Workspace is the tenant boundary represented by `tenant_workspace_id`. Case Workspace remains a child operating context. A row without a validated active tenant relationship is unavailable to the caller.

## Membership validation

The database derives the caller identity from the authenticated session. It validates that the caller has a membership for the row tenant and that the membership is active. Suspended memberships, missing memberships, disabled security state, locked state, and forced-password state fail closed for business data.

## Permission and override evaluation

The database resolves the effective permission from the fixed role mapping and membership-scoped overrides. An explicit deny overrides both a role grant and an explicit allow. No RLS policy reads a user-editable job title as authorization.

## Operation policies

- Read policies require tenant membership, active security state, and the relevant read permission. Soft-deleted rows remain hidden unless the caller has the explicit restore capability.
- Write policies require the relevant create/update permission and preserve tenant identity, ownership scope, and database-owned actor/timestamp fields.
- Delete policies are not a shortcut around domain soft deletion. Case, calendar, and workspace deletion are represented by guarded state transitions; hard deletion remains a trusted maintenance concern.
- Restore policies require a distinct restore permission.
- System-source calendar projections are not editable by ordinary authenticated clients.

## Audit requirement

Mutations that matter to tenant governance produce sanitized audit metadata. Audit records are append-only; authenticated clients cannot write, update, or delete them. Secrets, passwords, aliases, tokens, authorization headers, and row snapshots are excluded.

## Grant boundary

`anon` has no application access. `authenticated` receives only enumerated operations and is still constrained by RLS. `service_role` is a trusted PostgreSQL role used only server-side; it is not a browser credential and is not evidence that a caller is authorized for ordinary UI actions.

This document describes policy intent only. It does not execute or modify the repository SQL migration.
