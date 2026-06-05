# Recount

Recount is a workspace-based time tracking product where workspace members record time against projects and optional tasks, with optional links to external tools.

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
A work interval recorded by a workspace member, with one lifecycle identity that is either active as a timer or completed as a time entry.
_Avoid_: Time record, time log, timesheet row

**Time Entry**:
Completed tracked time recorded by a workspace member against a project.
_Avoid_: Timer, running time entry, timesheet row, log

**Timer**:
Active tracked time for a workspace member's current work interval.
_Avoid_: Running Time Entry, Time Entry

**Current Timer**:
The active timer role for a workspace member in a workspace, if one exists.
_Avoid_: Running Time Entry, Current Time Entry

**Duration**:
The elapsed length of a time entry.
_Avoid_: Hours, billable time

**Tracked Time Target**:
The project and optional task that tracked time is recorded against.
_Avoid_: Work item, target entity

**Archived**:
A lifecycle state that removes a project or task from active use until it is restored, without deleting historical time entries.
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

**Local Workspace State**:
The frontend's short-lived local view of a workspace, used for optimistic updates and brief offline tolerance before backend reconciliation.
_Avoid_: Offline source of truth, local backend

**Optimistic Workspace Data**:
Workspace data that local workspace state may change before backend reconciliation.
_Avoid_: Server-only workspace data, offline source of truth

**Backend Reconciliation**:
The process where authoritative backend state replaces or confirms local workspace state after a local action.
_Avoid_: Conflict resolution, sync merge

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
- **Tracked Time** is recorded against exactly one **Tracked Time Target**
- A **Task** belongs to exactly one **Project**
- A **Task** belongs to the same **Workspace** as its **Project**
- **Tracked Time** is either a **Timer** or a **Time Entry**
- A **Time Entry** may be recorded against one **Task**
- A **Time Entry** with a **Task** is recorded against that task's **Project**
- **Tracked Time** with a **Task** is recorded against that task's **Project**
- A **Tracked Time Target** has exactly one **Project** and may have one **Task**
- Updating **Tracked Time** validates the effective **Tracked Time Target** after applying the **Partial Update**
- Changing the **Task** of **Tracked Time** does not implicitly change its **Project**
- A **Time Entry** belongs to exactly one **Workspace Member**
- A **Time Entry** stops at or after it starts
- A **Time Entry** has one **Duration**
- A **Timer** does not have a final **Duration**
- A **Timer** start time does not change after the timer starts
- A **Workspace Member** can have at most one **Timer** in a **Workspace**
- A **Current Timer** is the active **Timer** role for one **Workspace Member** in one **Workspace**
- Starting a **Timer** fails if the **Workspace Member** already has one in the workspace
- Stopping a **Timer** completes the **Tracked Time** as a **Time Entry**
- A **Time Entry** cannot become a **Timer** again
- A **Time Entry** start time can be corrected after completion
- **Time Entries** for the same **Workspace Member** may overlap
- Overlapping **Time Entries** count as separate tracked durations, not unique elapsed clock time
- An **Archived** project or task can still be referenced by historical **Time Entries**
- An **Archived** project or task cannot be chosen when starting or updating a **Timer**, creating a **Time Entry**, or correcting a **Time Entry**
- A **Timer** can stop after its project or task becomes **Archived**
- A **Removed Workspace Member** can still be referenced by historical **Time Entries**
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
- An **External Reference** can remain after an **Integration Connection** is disconnected
- A **Workspace** has exactly one **Data Residency Region**, chosen at creation
- Workspace-owned objects must not reference objects owned by another **Workspace**
- **Local Workspace State** may decide optimistic **Project**, **Task**, and **Time Entry** changes before backend confirmation
- **Project**, **Task**, and **Time Entry** are currently **Optimistic Workspace Data**
- More workspace data may become **Optimistic Workspace Data** as Recount grows
- **Workspace Invitation** and **Integration Connection** are server-only unless explicitly made **Optimistic Workspace Data**
- **Local Workspace State** is not authoritative; **Backend Reconciliation** may silently replace it with backend truth
- **Local Workspace State** should support brief offline tolerance, not weeks of divergent offline work
- Future local persistence should make unpersisted **Optimistic Workspace Data** visible without forcing callers to await **Backend Reconciliation** for local acceptance
- Optimistic **WorkspaceDb** actions should return local acceptance synchronously; server-only workspace concerns should stay asynchronous because they wait for backend authority
- Workspace routes should preload **WorkspaceDb** before rendering optimistic interactions; missing required local data after preload is a local state error, not a normal loading path
- **Backend Reconciliation** should preserve backend authority over permissions, validation, and persisted workspace data
- A **Partial Update** must persist only the fields supplied by the request
- Omitted fields in a **Partial Update** must remain unchanged
- Independent **Partial Updates** to different fields of the same object can both be preserved during **Backend Reconciliation**

## Example dialogue

> **Dev:** "When a user starts a timer for a Linear issue, do we create a todo in Recount?"
> **Domain expert:** "No. A **Workspace Member** starts a **Timer** against a **Project** and optionally a **Task**. Stopping the **Timer** creates a **Time Entry**. If that task maps to Linear, it has an **External Reference**; Linear owns the todo state."

## Flagged ambiguities

- "user" must not be used for workspace-scoped roles, permissions, or time entries; use **Workspace Member** instead.
- "account" is ambiguous and must not be used as a domain term; use **User**, **Workspace**, **Workspace Member**, or future **Client**.
- "organization" must not be used as a synonym for **Workspace**.
- "team" is reserved for a future grouping within a **Workspace** and must not be used as a synonym for **Workspace**.
- "task" in Recount is not a todo item; external tools own todo state such as status, assignee, priority, and due date.
- **Timer** describes active tracking behavior, not completed historical work.
- **Tracked Time** is the umbrella term for active and completed tracked work intervals; use **Timer** or **Time Entry** when the lifecycle state matters.
- **Time Entry** describes completed historical work, not active tracking.
- "timesheet" must not be used unless Recount introduces a submission or approval period for time entries.
- "archived" does not mean deleted; archived projects and tasks remain part of historical time records.
- "deleted" and "soft-deleted" are implementation language for workspace members; use **Removed Workspace Member** in product discussions.
- **Workspace Role** values and lifecycle rules are unresolved, including ownership transfer, last-owner constraints, and what standard members can do.
- **Workspace Invitation** lifecycle rules are unresolved, including expiry, rejection, cancellation, resending, and what acceptance creates.
- **Workspace** deletion lifecycle is unresolved, including whether deletion is reversible and what happens to members, projects, time entries, integration connections, and external references.
- **Integration Connection** scope may expand beyond workspaces later; current connections are workspace-scoped.
- **External References** identify provider objects, not the specific **Integration Connection** that created them.
- Disconnecting an **Integration Connection** stops access, import, and sync but should not delete **External References** by default.
- External object **Linking** vs **Importing** is unresolved; a Recount object may be manually linked to a provider object or created from one during import.
- Integration **Import** and **Sync** vocabulary is unresolved; import likely creates or updates Recount objects from external provider objects, while sync likely keeps already-linked objects aligned over time.
- **Client** is future vocabulary for project-related billing/reporting concerns and must not be used as a synonym for **Project**.
- **Local Workspace State** is a product behaviour, not a storage choice; IndexedDB, TanStack DB, SQLite, PGlite, or Turso are adapter options.
- Long-lived offline conflict resolution is not currently a product goal.
