# Database Testing Guide

`scripts/verifyDatabaseFoundation.mjs` provides repository/static validation: migration naming, required schema/RBAC/RLS/grant markers, test presence, and credential-shaped material.

`supabase/tests/database_security_foundation.sql` is a transactional local SQL test. Its synthetic `example.test` Auth fixtures exist only inside `BEGIN`/`ROLLBACK`. It covers role values, RLS enablement, tenant isolation, permission overrides, uniqueness, foreign keys, update versions, soft-delete visibility, audit capture/immutability, and cascade behavior.

This workstation currently has no Supabase CLI, Docker, `psql`, or local PostgreSQL service. Consequently:

- Repository/static validation can be PASS.
- PostgreSQL syntax execution and RLS behavior must be reported **NOT EXECUTED**.
- Static inspection must never be described as an RLS integration PASS.

No Cloud URL, project ref, database password, service-role key, or real identity is required for local SQL testing.
