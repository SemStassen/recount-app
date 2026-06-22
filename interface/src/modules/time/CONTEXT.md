# Interface Time Module

The Interface Time Module owns time-entry-specific frontend composition.

## Module boundary

The time module owns:

- time entry editor state and UI
- reusable time entry query hooks
- generic time range types used by calendar surfaces

Calendar layout, drag selection, and multi-day grid rendering stay in `interface/src/features/calendar` because they are presentation concerns around a calendar view. Workspace-scoped optimistic persistence stays in `modules/workspace/db` because `WorkspaceDb` owns local workspace state and backend reconciliation.

Consumers should import from `~/modules/time`, not from time module internals.
