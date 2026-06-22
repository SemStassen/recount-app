# Recount

Recount is a workspace-based time tracking product where workspace members record time against projects and optional tasks, with optional links to external tools.

## Contexts

- [Recount](./CONTEXT.md) describes workspace-wide product language.
- [Project](./packages/core/src/modules/project/CONTEXT.md) describes workspace-scoped work containers and task subdivisions.
- [Time](./packages/core/src/modules/time/CONTEXT.md) describes tracked time, timers, and time entries.
- [Workspace Member](./packages/core/src/modules/workspace-member/CONTEXT.md) describes a user's participation in one workspace.
- [Workspace Invitation](./packages/core/src/modules/workspace-invitation/CONTEXT.md) describes invitations for email addresses to become workspace members.
- [Integrations](./packages/integrations/CONTEXT.md) describes external providers, provider objects, linking, import, and sync.
- [Interface Workspace State](./interface/src/db/workspace/CONTEXT.md) describes local workspace state, optimistic workspace data, and backend reconciliation.

## Language

**User**:
A login identity for a person who can access Recount.
_Avoid_: Member, account

**Workspace Member**:
A user's participation in a specific workspace.
_Avoid_: User, account

**Workspace**:
A collaboration and data boundary where members track work.
_Avoid_: Organization, account, team

**Project**:
A workspace-scoped work container that time is tracked against.
_Avoid_: Job, client, initiative

**Task**:
An optional project-scoped subdivision of work that time can be tracked against.
_Avoid_: Todo, issue

**Tracked Time**:
A work interval recorded by a workspace member against a project and optional task.
_Avoid_: Time record, time log, timesheet row

**Time Entry**:
Completed tracked time recorded by a workspace member against a project.
_Avoid_: Timer, running time entry, timesheet row, log

**Timer**:
Active tracked time for a workspace member's current work interval.
_Avoid_: Running Time Entry, Time Entry

**Tracked Time Target**:
The project and optional task that tracked time is recorded against.
_Avoid_: Work item, target entity

**Archived**:
A lifecycle state that removes an object from active use until it is restored, without deleting historical records that reference it.
_Avoid_: Deleted, inactive

**Removed Workspace Member**:
A workspace member who no longer participates in a workspace but remains attached to historical records.
_Avoid_: Deleted member, soft-deleted member, inactive user

**Workspace Invitation**:
An invitation for an email address to become a workspace member with a role.
_Avoid_: Invite, membership request

**Workspace Role**:
A workspace-scoped permission level assigned to a workspace member or invitation.
_Avoid_: Global role, user role

**Integration Provider**:
An external service Recount can integrate with.
_Avoid_: Integration type

**Integration Connection**:
A configured connection between Recount and one integration provider.
_Avoid_: Workspace integration, provider connection

**External Reference**:
A link between a Recount object and an external provider object.
_Avoid_: Integration, synced object

**Data Residency Region**:
The region where a workspace's data is stored.
_Avoid_: Server region, locale

**Partial Update**:
A request to change only the supplied fields of an existing Recount object.
_Avoid_: Full replacement, overwrite, merge

## Relationships

- A **User** can be a **Workspace Member** in zero or more **Workspaces**, at most once per **Workspace**
- A **Workspace Member** belongs to exactly one **Workspace**
- A **Workspace Member** belongs to exactly one **User**
- A **Workspace Member** has workspace-specific presentation such as display name and avatar
- A **Workspace** contains its own projects, tasks, timers, time entries, workspace members, invitations, and integration connections
- A **Project** belongs to exactly one **Workspace**
- A **Time Entry** is recorded against exactly one **Project**
- A **Task** belongs to exactly one **Project**
- An **Archived** project or task can still be referenced by historical **Time Entries**
- A **Removed Workspace Member** can still be referenced by historical records
- A **Workspace Invitation** belongs to exactly one **Workspace**
- A **Workspace Invitation** can result in one **Workspace Member**
- A **Workspace** can have at most one pending **Workspace Invitation** per email address
- A **Workspace Member** has exactly one **Workspace Role**
- A **Workspace Invitation** assigns exactly one **Workspace Role**
- **Workspace Role** permissions apply only within the **Workspace** where the member has that role
- An **Integration Connection** can be scoped to a **Workspace**
- An **Integration Connection** uses exactly one **Integration Provider**
- A **Workspace** should have at most one **Integration Connection** per **Integration Provider**
- An **External Reference** links one Recount object to one object from an **Integration Provider**
- A **Workspace** has exactly one **Data Residency Region**, chosen at creation
- Workspace-owned objects must not reference objects owned by another **Workspace**
- Omitted fields in a **Partial Update** must remain unchanged

## Example dialogue

> **Dev:** "When a user starts a timer for a Linear issue, do we create a todo in Recount?"
> **Domain expert:** "No. A **Workspace Member** starts a **Timer** against a **Project** and optionally a **Task**. Stopping the **Timer** creates a **Time Entry**. If that task maps to Linear, it has an **External Reference**; Linear owns the todo state."

## Flagged ambiguities

- "user" must not be used for workspace-scoped roles, permissions, or time entries; use **Workspace Member** instead.
- "account" is ambiguous and must not be used as a domain term; use **User**, **Workspace**, **Workspace Member**, or future **Client**.
- "organization" must not be used as a synonym for **Workspace**.
- "team" is reserved for a future grouping within a **Workspace** and must not be used as a synonym for **Workspace**.
- "task" in Recount is not a todo item; external tools own todo state such as status, assignee, priority, and due date.
- "timesheet" must not be used unless Recount introduces a submission or approval period for time entries.
- "archived" does not mean deleted; archived objects remain part of historical records.
- "deleted" and "soft-deleted" are implementation language for workspace members; use **Removed Workspace Member** in product discussions.
- **Workspace Role** values and lifecycle rules are unresolved, including ownership transfer, last-owner constraints, and what standard members can do.
- **Workspace Invitation** lifecycle rules are unresolved, including expiry, rejection, cancellation, resending, and what acceptance creates.
- **Workspace** deletion lifecycle is unresolved, including whether deletion is reversible and what happens to members, projects, time entries, integration connections, and external references.
- **Client** is future vocabulary for project-related billing/reporting concerns and must not be used as a synonym for **Project**.
