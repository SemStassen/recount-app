# Time

The Time context describes tracked work intervals, including active timers and completed time entries.

## Language

**Tracked Time**:
A work interval with one lifecycle identity that is either active as a timer or completed as a time entry.
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

## Relationships

- **Tracked Time** is recorded against exactly one **Tracked Time Target**
- **Tracked Time** is either a **Timer** or a **Time Entry**
- A **Tracked Time Target** has exactly one **Project** and may have one **Task**
- A **Time Entry** belongs to exactly one **Workspace Member**
- Updating **Tracked Time** validates the effective **Tracked Time Target** after applying a **Partial Update** that changes the **Project** or **Task**
- Changing the **Task** of **Tracked Time** does not implicitly change its **Project**
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
- An **Archived** project or task cannot be chosen when starting or updating a **Timer**, creating a **Time Entry**, or correcting a **Time Entry**
- A **Timer** can stop after its project or task becomes **Archived**

## Flagged ambiguities

- **Timer** describes active tracking behavior, not completed historical work.
- **Tracked Time** is the umbrella term for active and completed tracked work intervals; use **Timer** or **Time Entry** when the lifecycle state matters.
- **Time Entry** describes completed historical work, not active tracking.
