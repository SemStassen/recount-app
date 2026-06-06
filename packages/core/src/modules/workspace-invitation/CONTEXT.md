# Workspace Invitation

The Workspace Invitation context describes an invitation for an email address to become a workspace member.

## Language

**Workspace Invitation**:
An invitation for an email address to become a workspace member with a role.
_Avoid_: Invite, membership request

**Workspace Role**:
A workspace-scoped permission level assigned to a workspace member or invitation.
_Avoid_: Global role, user role

**Workspace Member**:
A user's participation in a specific workspace.
_Avoid_: User, account

## Relationships

- A **Workspace Invitation** belongs to exactly one **Workspace**
- A **Workspace Invitation** assigns exactly one **Workspace Role**
- A **Workspace** can have at most one pending **Workspace Invitation** per email address
- A **Workspace Invitation** can result in one **Workspace Member**
- A pending **Workspace Invitation** can be renewed, canceled, accepted, or rejected
- An expired **Workspace Invitation** cannot be renewed, canceled, accepted, or rejected
- Accepting a **Workspace Invitation** requires the accepting user's email address to match the invitation email address

## Flagged ambiguities

- **Workspace Invitation** lifecycle rules are unresolved beyond pending, accepted, rejected, canceled, and expired behavior.
- Acceptance creates a **Workspace Member**, but transaction ordering is owned by the application-level acceptance flow.
