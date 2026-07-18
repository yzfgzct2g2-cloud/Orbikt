# Orbikt Permission Catalog

## Naming convention

Permissions use lowercase `module.action` names. Scoped variants append a clear qualifier such as `_own`, `_assigned`, or `_any`. A permission is an atomic capability, not a screen name or job title.

## Active catalog

The following 27 permissions are the current database foundation catalog:

### Workspace

- `workspace.read`
- `workspace.manage`
- `workspace.delete`
- `workspace.restore`

### Membership

- `members.read`
- `members.manage`
- `members.assign_owner`

### Profile

- `profiles.read`
- `profiles.manage`

### Case

- `cases.read`
- `cases.create`
- `cases.update_assigned`
- `cases.update_any`
- `cases.delete_assigned`
- `cases.delete_any`
- `cases.restore`

### Calendar

- `calendar.read`
- `calendar.create`
- `calendar.update_own`
- `calendar.update_any`
- `calendar.delete_own`
- `calendar.delete_any`
- `calendar.restore`

### Notification

- `notifications.read`

### Audit

- `audit.read`

### Tenant settings

- `settings.read`
- `settings.manage`

Notifications are intentionally read/acknowledge-oriented in this foundation; backend delivery is a later scope.

## Reserved categories

These categories are recognized for future module mapping but have no active permissions in this foundation:

- Dispatch
- Knowledge
- Documents
- AA01
- FA310

Examples such as `dispatch.run`, `dispatch.override`, `audit.export`, `knowledge.read`, and `documents.read` require an explicit future catalog change before use. They are not implicit grants.

## Permission extension rule

Add a permission only when a distinct protected action cannot be represented by an existing capability. Define its tenant scope, read/write/delete semantics, role defaults, override behavior, and RLS mapping together. Do not create permissions for routes, UI buttons, job titles, or speculative features.

## Reserved prefix and deprecated policy

Module prefixes are reserved for the owning domain. A new permission must not reuse a deprecated name or silently change the meaning of an existing name. Deprecation requires a documented replacement, migration of role mappings/overrides, and removal only after consumers are migrated.

Permission catalog changes require a Decision Record review; this document alone does not authorize schema changes.
