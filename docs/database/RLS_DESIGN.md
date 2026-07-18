# RLS Design

All public application and RBAC tables explicitly enable Row Level Security. Tables have no anonymous grants and no public policies. Policies are operation-specific and call the permission resolver rather than comparing role names.

Grant boundary:

- `anon`: no schema/table/function access.
- `authenticated`: only enumerated table operations; RLS remains mandatory.
- `service_role`: explicit trusted server grants. This PostgreSQL role identifier is not a key. It bypasses RLS, so audit update/delete remain blocked by both grants and an immutable trigger.

Business access fails closed for missing security state, disabled/locked accounts, forced-password state, suspended memberships, absent permissions, or explicit deny overrides.

Tenant consistency is also enforced by foreign keys: case assignees, event owners, participants, and notification recipients must be members of the same tenant. Soft-deleted case/event rows are excluded by read policies; restore requires an explicit restore permission. System-source calendar records cannot be inserted or changed by authenticated clients.

RLS policies are not a substitute for input validation or sanitized API errors. Foreign-key and uniqueness failures may reveal record existence if raw database errors are returned to users.
