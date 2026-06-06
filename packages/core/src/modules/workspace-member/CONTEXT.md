# Workspace Member

The Workspace Member context describes a user's participation in one workspace.

## Language

**Workspace Member**:
A user's participation in a specific workspace.
_Avoid_: User, account

**Workspace Role**:
A workspace-scoped permission level assigned to a workspace member.
_Avoid_: Global role, user role

**Removed Workspace Member**:
A workspace member who no longer participates in a workspace but remains attached to historical records.
_Avoid_: Deleted member, soft-deleted member, inactive user

## Relationships

- A **Workspace Member** belongs to exactly one **Workspace**
- A **Workspace Member** belongs to exactly one **User**
- A **User** can be a **Workspace Member** in zero or more **Workspaces**, at most once per **Workspace**
- A **Workspace Member** has workspace-specific presentation such as display name and avatar
- A **Workspace Member** has exactly one **Workspace Role**
- A **Removed Workspace Member** can still be referenced by historical records

## Flagged ambiguities

- "user" must not be used for workspace-scoped roles, permissions, or tracked time; use **Workspace Member** instead.
- **Workspace Role** values and lifecycle rules are unresolved, including ownership transfer, last-owner constraints, and what standard members can do.
- Removed-member lifecycle is not fully implemented; keep removal vocabulary separate from deletion mechanics.
