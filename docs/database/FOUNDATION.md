# Database Foundation

Orbikt v2 uses `tenant_workspaces` as the Organization Workspace tenant. The existing `/workspace` remains a Case Workspace and is not renamed or reused as the tenant boundary.

| Table | Purpose | Principal constraints |
| --- | --- | --- |
| `user_profiles` | Immutable username and display profile | `auth.users.id` PK/FK, globally unique normalized username |
| `user_security_states` | Enabled, forced-password, and reset lock state | one row per Auth identity; missing row fails closed |
| `tenant_workspaces` | Organization Workspace | unique slug, soft deletion, row version |
| `tenant_memberships` | User-to-tenant membership and identity role | unique tenant/user, active or suspended |
| `permissions` | Stable capability catalogue | validated unique permission key |
| `role_permissions` | Default capabilities for fixed roles | composite PK and permission FK |
| `user_permission_overrides` | Per-membership allow/deny exception | deny overrides allow/default role mapping |
| `cases` | Browser-approved case shell only | tenant/code unique, tenant-consistent assignee, soft deletion |
| `calendar_events` | Shared manual/system calendar records | tenant-consistent case/owner, ordered times, row version |
| `calendar_event_participants` | Tenant-consistent participants | composite event/user key and membership FK |
| `notifications` | One tenant-scoped recipient per row | tenant-consistent recipient, soft deletion |
| `audit_logs` | Sanitized append-only mutation metadata | no row snapshots or credentials; immutable trigger |
| `system_settings` | Project-level non-secret configuration | no authenticated access in this foundation |
| `tenant_settings` | Tenant non-secret JSON settings | tenant/key PK and row version |
| `user_preferences` | Caller-owned non-secret preferences | user/key PK and row version |

No passwords or login-audit duplicate table exists. Auth identity and login audit remain Supabase Auth responsibilities.
