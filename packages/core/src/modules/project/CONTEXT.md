# Project

The Project context describes workspace-scoped work containers and their optional task subdivisions.

## Language

**Project**:
A workspace-scoped work container that time is tracked against.
_Avoid_: Job, client, initiative

**Task**:
An optional project-scoped subdivision of work that time can be tracked against.
_Avoid_: Todo, issue

**Archived**:
A lifecycle state that removes a project or task from active use without deleting historical tracked time that references it.
_Avoid_: Deleted, inactive

## Relationships

- A **Project** belongs to exactly one **Workspace**
- A **Task** belongs to exactly one **Project**
- A **Task** belongs to the same **Workspace** as its **Project**
- A **Project** can have zero or more **Tasks**
- A **Project** can be **Archived** and later restored
- A **Task** can be **Archived** and later restored
- An **Archived** project cannot be updated for active use
- A **Task** cannot be created, updated, or restored while its **Project** is **Archived**
- An **Archived** project or task can still be referenced by historical **Time Entries**

## Flagged ambiguities

- **Task** is not a todo item; external tools own todo state such as status, assignee, priority, and due date.
- **Archived** does not mean deleted; archived projects and tasks remain part of historical records.
- **Client** is future vocabulary for billing/reporting concerns and must not be used as a synonym for **Project**.
