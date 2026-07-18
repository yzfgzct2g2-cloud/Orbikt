# Database Security Model

Membership identity roles are exactly `owner`, `admin`, `supervisor`, and `case_manager`. A legacy `director` title maps to `supervisor` authorization while remaining display-only profile data. `manager` and `viewer` are not roles.

Authorization is resolved by `private.has_permission(tenant_workspace_id, permission_key)`. It requires:

1. `auth.uid()` to have an active membership in that tenant.
2. A present, enabled, unlocked security row with `must_change_password = false`.
3. No explicit deny override.
4. Either an explicit allow override or a matching role-permission row.

Owners receive all capabilities through `role_permissions`; there is no hard-coded owner bypass. Read-only access is produced by denying write permissions for a membership.

Permission matrix:

| Area | Owner | Admin | Supervisor | Case manager |
| --- | --- | --- | --- | --- |
| Workspace read | Yes | Yes | Yes | Yes |
| Workspace manage | Yes | Yes | No | No |
| Workspace delete | Yes | No | No | No |
| Membership read | Yes | Yes | Yes | Yes |
| Membership manage | Yes | Yes | No | No |
| Assign owner | Yes | No | No | No |
| Profile team read | Yes | Yes | Yes | Yes |
| Profile manage | Yes | Yes | No | No |
| Case read/create | Yes | Yes | Yes | Yes |
| Case update | Any | Any | Any | Assigned only |
| Case delete/restore | Any | Any | Any | Assigned delete only |
| Calendar update/delete | Any | Any | Any | Own only |
| Calendar restore | Yes | Yes | Yes | No |
| Notification read/write | Yes | Yes | Yes | Yes |
| Audit read | Yes | Yes | Yes | No |
| Tenant settings manage | Yes | Yes | No | No |

Membership and permission-override triggers prevent self-promotion, protect the last active owner, and prevent granting a capability the caller does not possess.
