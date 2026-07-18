# Supabase Repository Foundation

This directory is the schema source of truth for Orbikt v2. It is repository-only until Cloud operations receive separate authorization.

- `migrations/` contains ordered, versioned schema migrations.
- `seed/` contains synthetic local fixtures only. It never creates Auth users.
- `tests/` contains transactional SQL security tests intended for a disposable local Supabase database.

Forbidden in this objective: `supabase link`, `db push`, deployment, Cloud Auth users, production data, credentials, database passwords, or service-role keys. The SQL identifier `service_role` is a PostgreSQL role and is not a credential.

This workstation currently has no Supabase CLI, Docker, or PostgreSQL client. Repository validation can run now; migration execution and RLS behavior must remain **NOT EXECUTED** until an authorized local runtime exists.
