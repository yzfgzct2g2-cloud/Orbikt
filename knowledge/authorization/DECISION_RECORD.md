# Authorization SSOT Decision Record

Status: Accepted

## Fixed decisions

- Organization Workspace is `tenant_workspaces`.
- `/workspace` remains the existing Case Workspace.
- Tenant isolation is membership-scoped to `tenant_workspace_id`.
- Tenant roles are exactly `owner`, `admin`, `supervisor`, and `case_manager`.
- Legacy `director` maps to `supervisor` authorization while its displayed title may remain separate.
- Role identifies membership; Permission Layer determines capability.
- User overrides are membership-scoped and explicit denies take precedence.
- Viewer is not a role; read-only access is a permission combination.
- Manager is not a role; organizational job titles remain separate from authorization.
- Authorization evaluation is Permission First and ends at database RLS.
- Default Deny and Fail Closed are mandatory.

## Consequences

Module code must request permissions rather than infer access from job titles. Tenant selection and membership validation precede business data loading. Any future role or permission change requires an explicit architecture review and synchronized role matrix, permission catalog, and RLS mapping.

## Out of scope for this record

This record does not authorize Supabase Cloud operations, Auth users, migrations execution, Edge Functions, Realtime, backend calendar/notification services, Admin Console, or production deployment.
