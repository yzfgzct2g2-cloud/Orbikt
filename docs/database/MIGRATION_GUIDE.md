# Migration Guide

`supabase/migrations/` is the only schema source of truth. Do not define schema through Dashboard Table Editor or unrecorded SQL Editor changes.

Current repository validation:

```text
npm.cmd run verify:database-foundation
```

The current objective does not authorize linking or pushing a Supabase project. When a local container runtime and Supabase CLI are separately available, use the documented local reset/test workflow. Cloud linking, `db push`, and production deployment require separate approval.

PostgreSQL objects without native `IF NOT EXISTS` support use guarded enum blocks or `DROP ... IF EXISTS` followed by deterministic recreation. Permission catalogue rows are part of the migration so authorization does not depend on development seed data.
