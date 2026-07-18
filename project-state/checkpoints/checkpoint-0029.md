# CP-0029 - Orbikt v2 Repository Offline Foundation Baseline

Date: 2026-07-18

Objective: `obj-orbikt-v2-cloud-auth-shared-workspace`

Version: 1.7.1

State: Known

## Baseline

- `HEAD`, tag `v1.7.1`, and remote `feat/team-calendar-v1` all resolve to
  `7dcfae1b40848bf35ed4da2e9d469f28d93f6e48`.
- `main` is not used because it does not contain Team Calendar V1.
- Feature branch: `feat/orbikt-v2-cloud-foundation`.
- Baseline typecheck: passed.
- Baseline lint: passed.
- Baseline tests: 29 files, 219 tests, all passed.
- Baseline production build: passed (124 modules; existing chunk-size warning
  remains informational).
- Node.js: v24.15.0.
- Supabase CLI: unavailable.
- Docker CLI: unavailable.
- Repository secret-value scan: passed with zero matches.

## Scope

- Version-controlled Supabase migrations, grants, RLS, SQL test sources, Edge
  Function sources, generated-type workflow, and non-secret configuration.
- Client-direct Supabase password authentication using a public alias-domain
  setting, with no password-handling login broker.
- Tenant membership, forced-password state, shared calendar adapter,
  notifications, append-only audit, and mobile navigation foundations.
- Repository tests, builds, leak scans, and honest evidence classification.

## Non-scope

- Cloud schema deployment or Cloud RLS verification.
- Edge Function deployment or Cloud Auth user creation/reset.
- Realtime publication or validation.
- Staging frontend deployment.
- Real-data import or migration.
- Production readiness or final v2.0.0 release.

## Cloud stop conditions

These conditions block Cloud work and Cloud claims; they do not block the
authorized Repository Offline Foundation:

- No organization-controlled alias domain is available.
- Server-side secret configuration is not provided.
- `supabase link`, `db push`, function deployment, Auth user creation, data
  import, and staging deployment are not authorized.
- Free staging is limited to synthetic data.
- Production data-processing and privacy approval is incomplete.

## Verification plan

- Run typecheck, lint, all tests, and builds without weakening existing checks.
- Add auth normalization, protected-route, forced-password, role, adapter,
  conflict, mobile drawer, environment leakage, and bundle scans.
- Author SQL-based RLS tests; report them as not executed until Docker/local
  Supabase is available.
- Separate verified Repository results from implemented-but-not-Cloud-verified
  work and Cloud stop conditions.

## Boundary decision

`VITE_AUTH_ALIAS_DOMAIN` is public client configuration. Missing configuration
fails closed and no runtime fallback exists. Supabase secret/admin credentials
remain server-only. The browser sends passwords directly to Supabase Auth.
