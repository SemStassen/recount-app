# Interface Project Module

The Interface Project Module owns project-specific frontend composition.

## Module boundary

The project module owns project UI and reusable project queries:

- project creation dialog and command registration
- task creation dialog and command registration
- active and archived project list components
- project-scoped task list components
- project query hooks used by other modules or features

Workspace-scoped persistence and optimistic actions stay in the workspace module because `WorkspaceDb` owns local workspace state and backend reconciliation. Shared collection row schemas stay in `interface/src/db/synced-collections`.

Consumers should import from `~/modules/project`, not from component or hook internals.
