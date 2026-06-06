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
