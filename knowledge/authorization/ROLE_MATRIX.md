# Orbikt Tenant Role Matrix

Roles represent stable tenant identity. They do not represent every capability and cannot bypass the Permission Layer.

| Role | Responsibility | Scope | Invite | Suspend member | Manage Workspace | Manage Permission | Audit access | Calendar access | Case access |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| owner | Tenant ownership, continuity, and highest governance authority | Own tenant | Reserved for a later authorized server flow | Yes | Full tenant management | Full permission and override management | Read tenant audit | Team-wide read/write/delete/restore | Full tenant case access |
| admin | Operational tenant administration | Own tenant | Reserved for a later authorized server flow | Yes | Settings and operational management | Manage membership-scoped overrides within granted authority | Read tenant audit | Team-wide read/write/delete/restore | Full operational case access |
| supervisor | Team supervision and operational review | Own tenant | No | No | Read workspace context | No role/permission administration | Read tenant audit | Team-wide calendar management and restore | Team-wide case read/update/archive capabilities |
| case_manager | Assigned case and personal work coordination | Own tenant; assigned case/event writes | No | No | Read workspace context | No | No audit access by default | Team read; own event create/update/delete | Read tenant cases; update/delete assigned cases |

`director` is a legacy displayed job title whose authorization maps to `supervisor`. `manager` and `viewer` must not be added as role values. A read-only person is represented by permissions and deny overrides.

Invite and suspend operations remain protected server-side responsibilities when implemented. This document does not create an invite API or Auth flow.
