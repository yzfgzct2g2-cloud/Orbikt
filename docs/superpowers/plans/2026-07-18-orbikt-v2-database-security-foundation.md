# Orbikt v2 Database Security Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a version-controlled, locally reviewable Supabase schema, RBAC permission layer, grants, default-deny RLS, synthetic seed, SQL test sources, and database documentation without contacting Supabase Cloud.

**Architecture:** `tenant_workspaces` are Organization Workspace tenants; the existing Case Workspace remains unchanged. Membership carries one fixed identity role (`owner`, `admin`, `supervisor`, `case_manager`) while authorization is resolved through database-backed permissions and optional user overrides. Every tenant-owned row carries `tenant_workspace_id`, every exposed table enables RLS, and security helpers derive the caller from `auth.uid()`.

**Tech Stack:** PostgreSQL/Supabase SQL migrations, pgTAP-style SQL test sources, Node.js static migration validation, existing Vitest/ESLint/TypeScript/Vite toolchain.

## Global Constraints

- No `supabase link`, `db push`, deployment, Edge Function, Auth user, Cloud resource, service-role secret, database password, real token, real person, real case, or production workspace.
- Preserve the existing Cloud Foundation and Case Workspace.
- Tenant roles are exactly `owner`, `admin`, `supervisor`, and `case_manager`; legacy `director` maps to `supervisor` outside the enum.
- Viewer and Manager are not roles; read-only and other capabilities come from permission assignments.
- Schema source of truth is versioned Supabase CLI migrations.
- Runtime application tables are default-deny and tenant-isolated through RLS.
- SQL integration execution is reported honestly as unavailable when Supabase CLI, Docker, and PostgreSQL are absent.

---

### Task 1: Lock the RBAC and migration contracts

**Files:**
- Modify: `DECISIONS.md`
- Create: `supabase/README.md`
- Create: `scripts/verifyDatabaseFoundation.mjs`
- Test: `scripts/verifyDatabaseFoundation.test.mjs`

**Interfaces:**
- Produces the role/permission naming contract and a static validator that accepts a repository root and reports filename/category only.

- [ ] Write failing validator tests for migration ordering, required tables, RLS/default-deny markers, forbidden credentials, and synthetic-only seed markers.
- [ ] Run `npm.cmd test -- scripts/verifyDatabaseFoundation.test.mjs` and confirm failure because the validator/migration is absent.
- [ ] Implement the minimal validator and record the approved role decision.
- [ ] Re-run the targeted test and confirm PASS.

### Task 2: Add the core schema and permission layer

**Files:**
- Create: `supabase/migrations/20260718000100_database_security_foundation.sql`
- Create: `supabase/tests/database_security_foundation.sql`

**Interfaces:**
- Produces enums `tenant_role`, `permission_effect`, and tables for profiles, workspaces, memberships, permissions, role permissions, user overrides, security states, cases, calendar, notifications, audit, settings, preferences, and invitations.
- Produces private helper functions `private.has_permission(uuid,text)` and `private.can_access_tenant(uuid)`.

- [ ] Add failing static and SQL assertions for exact roles, unique membership, username policy, tenant foreign keys, soft-delete columns, row versions, and append-only audit.
- [ ] Add idempotent migration objects using `create ... if not exists` where PostgreSQL supports it and guarded `DO` blocks otherwise.
- [ ] Run the validator test and inspect the migration for forbidden credentials.

### Task 3: Add grants and default-deny RLS

**Files:**
- Modify: `supabase/migrations/20260718000100_database_security_foundation.sql`
- Modify: `supabase/tests/database_security_foundation.sql`

**Interfaces:**
- `anon` receives no application-table privileges.
- `authenticated` receives only operation-specific grants backed by RLS.
- `service_role` is not granted in repository SQL; Supabase platform ownership remains external.

- [ ] Add failing assertions for RLS on every exposed table and absence of permissive anonymous policies.
- [ ] Add explicit revoke/grant statements and operation-specific policies using permission checks.
- [ ] Add tests for tenant isolation, owner/admin management, supervisor/case-manager permission behavior, read-only permission composition, suspended membership, and forced-password denial.

### Task 4: Add synthetic seed and documentation

**Files:**
- Create: `supabase/seed/synthetic_seed.sql`
- Create: `docs/database/FOUNDATION.md`
- Create: `docs/database/SECURITY_MODEL.md`
- Create: `docs/database/RLS_DESIGN.md`
- Create: `docs/database/MIGRATION_GUIDE.md`
- Create: `docs/database/TESTING_GUIDE.md`

**Interfaces:**
- Seed contains only reserved `example.test` identifiers, deterministic UUIDs, and obviously synthetic organization/event values; it creates no `auth.users` row.

- [ ] Add validator assertions that reject production URLs, aliases outside reserved test domains, and credential-shaped values.
- [ ] Add synthetic tenant/permission catalog seed without Auth users or real case records.
- [ ] Document every table, constraint, permission mapping, RLS boundary, migration workflow, and the locally unavailable SQL integration runner.

### Task 5: Verify, commit, and push

**Files:**
- Modify: `package.json`

**Interfaces:**
- Produces `verify:database-foundation` for repository/static SQL validation.

- [ ] Run `npm.cmd run typecheck`, `typecheck:cloud`, `build`, `build:cloud`, database validator, targeted tests, all tests, lint, secret scan, `git diff --check`, and status.
- [ ] Report local SQL execution separately: PASS only if migrations/tests execute against local PostgreSQL; otherwise NOT EXECUTED with missing-tool evidence.
- [ ] Commit once as `feat: add tenant database security foundation` and push `feat/orbikt-v2-database-security-foundation` only after all executable gates pass.

## Self-review

- The plan covers architecture, migration, RBAC, RLS, grants, seed, SQL tests, documentation, validation, Git, and stop conditions.
- It does not authorize Cloud, Auth, Edge, Realtime, admin UI, or production operations.
- Permission names and role names are consistent across tasks.
