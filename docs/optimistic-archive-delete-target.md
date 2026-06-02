# Optimistic Archive And Delete Target

## Context

`WorkspaceDb.actions` is the optimistic seam for `Optimistic Workspace Data`.

Current decisions:

- `WorkspaceDb.preload()` is the readiness seam before optimistic interactions render.
- Optimistic `WorkspaceDb.actions` return local acceptance synchronously.
- Local rejection throws.
- Backend persistence and Backend Reconciliation happen behind the `WorkspaceDb.actions` seam.
- Server-only Workspace concerns stay async and wait for backend authority.
- `packages/core` remains the shared validation Module for both authoritative backend flows and frontend optimism.
- Core batch methods stay for now; frontend actions may call batch methods with one item.

Existing optimistic actions:

- `createProject`
- `updateProject`
- `createTask`
- `updateTask`
- `createTimeEntry`
- `updateTimeEntry`

Target additional optimistic actions:

- `archiveProject`
- `unarchiveProject`
- `archiveTask`
- `unarchiveTask`
- `deleteTimeEntry`

## Existing Backend Contracts

Project archive/unarchive already exists:

- `packages/core/src/api/contracts/project.ts`
- `packages/core/src/api/rpc/project.ts`
- `apps/backend/src/rpc/handlers/project.ts`
- `packages/application/src/modules/project/flows/archive-project.flow.ts`
- `packages/application/src/modules/project/flows/unarchive-project.flow.ts`
- `packages/application/src/modules/project/flows/archive-task.flow.ts`
- `packages/application/src/modules/project/flows/unarchive-task.flow.ts`

Time Entry delete already exists:

- `packages/core/src/api/contracts/time-entry.ts`
- `packages/core/src/api/rpc/time-entry.ts`
- `apps/backend/src/rpc/handlers/time-entry.ts`
- `packages/application/src/modules/time/flows/delete-time-entry.flow.ts`

No new backend contract should be needed for the first implementation pass.

## Target Shape

Frontend calls stay simple:

```ts
workspaceDb.actions.archiveProject(projectId);
workspaceDb.actions.unarchiveProject(projectId);
workspaceDb.actions.archiveTask(taskId);
workspaceDb.actions.unarchiveTask(taskId);
workspaceDb.actions.deleteTimeEntry(timeEntryId);
```

Each action should:

1. Mutate `Local Workspace State` synchronously through the relevant core Module.
2. Return local acceptance immediately.
3. Persist remotely through `BackendAtomRpcClient` with `WORKSPACE_ID_HEADER`.
4. Await Backend Reconciliation internally through `updatedRecords(...)` or `deletedRecords(...)`.

Expected reconciliation targets:

- `archiveProject`: `updatedRecords({ collection: allProjectsCollection, getIds: () => [projectId] })`
- `unarchiveProject`: `updatedRecords({ collection: allProjectsCollection, getIds: () => [projectId] })`
- `archiveTask`: `updatedRecords({ collection: allTasksCollection, getIds: () => [taskId] })`
- `unarchiveTask`: `updatedRecords({ collection: allTasksCollection, getIds: () => [taskId] })`
- `deleteTimeEntry`: `deletedRecords({ collection: timeEntriesCollection, getIds: () => [timeEntryId] })`

The Project archive/unarchive RPC results are `void`, so `getIds` should close over the local id rather than depend on `remoteResult`.

The Time Entry delete RPC result is `void`, so `getIds` should close over `timeEntryId`.

## File-Level Implementation Plan

### 1. Extend Project actions

File: `interface/src/db/workspace/project-actions.ts`

Add imports:

```ts
import { deletedRecords, insertedRecords, updatedRecords } from "./electric-reconciliation";
```

Only import `deletedRecords` if a Project or Task hard delete action is added later. For archive/unarchive, `updatedRecords` is enough.

Add actions:

```ts
const archiveProject = (id: Project["id"]) =>
  runSyncedWorkspaceAction<void, void>({
    mutateLocal: () =>
      params.workspaceRuntime.runSync(
        Effect.gen(function* () {
          const projectModule = yield* ProjectModule;

          yield* projectModule.archiveProject({
            workspaceId: params.workspaceId,
            id,
          });
        })
      ),
    persistRemote: async () =>
      params.workspaceRuntime.runPromise(
        Effect.gen(function* () {
          const client = yield* BackendAtomRpcClient;

          return yield* client(
            "Project.Archive",
            { id },
            {
              headers: {
                [WORKSPACE_ID_HEADER]: workspaceIdHeader,
              },
            }
          );
        })
      ),
    remoteSync: updatedRecords({
      collection: params.allProjectsCollection,
      getIds: () => [id],
    }),
  });
```

`unarchiveProject` is identical except:

- local call: `projectModule.unarchiveProject(...)`
- remote call: `"Project.Unarchive"`

`archiveTask` is identical except:

- id type: `Task["id"]`
- local call: `projectModule.archiveTask(...)`
- remote call: `"Task.Archive"`
- collection: `params.allTasksCollection`

`unarchiveTask` is identical except:

- local call: `projectModule.unarchiveTask(...)`
- remote call: `"Task.Unarchive"`

Return them from `createProjectActions`:

```ts
return {
  archiveProject,
  archiveTask,
  createProject,
  createTask,
  unarchiveProject,
  unarchiveTask,
  updateProject,
  updateTask,
};
```

### 2. Extend Time Entry actions

File: `interface/src/db/workspace/time-entry-actions.ts`

Add `deletedRecords` import from `./electric-reconciliation`.

Add action:

```ts
const deleteTimeEntry = (id: TimeEntry["id"]) =>
  runSyncedWorkspaceAction<void, void>({
    mutateLocal: () =>
      params.workspaceRuntime.runSync(
        Effect.gen(function* () {
          const timeModule = yield* TimeModule;

          yield* timeModule.hardDeleteTimeEntries({
            workspaceId: params.workspaceId,
            ids: [id],
          });
        })
      ),
    persistRemote: async () =>
      params.workspaceRuntime.runPromise(
        Effect.gen(function* () {
          const client = yield* BackendAtomRpcClient;

          return yield* client(
            "TimeEntry.Delete",
            { timeEntryId: id },
            {
              headers: {
                [WORKSPACE_ID_HEADER]: workspaceIdHeader,
              },
            }
          );
        })
      ),
    remoteSync: deletedRecords({
      collection: params.timeEntriesCollection,
      getIds: () => [id],
    }),
  });
```

Return it from `createTimeEntryActions`:

```ts
return {
  createTimeEntry,
  deleteTimeEntry,
  updateTimeEntry,
};
```

### 3. Check collection behaviour

Files:

- `interface/src/db/workspace/open-workspace-db.ts`
- `interface/src/lib/services/client-project-repository.layer.ts`
- `interface/src/lib/services/client-task-repository.layer.ts`
- `interface/src/lib/services/client-time-entry-repository.layer.ts`

Expected local behaviour:

- Archiving Project updates `allProjectsCollection.archivedAt`.
- `activeProjectsCollection` and `archivedProjectsCollection` update automatically because they derive from `allProjectsCollection`.
- Archiving Task updates `allTasksCollection.archivedAt`.
- `activeTasksCollection` and `archivedTasksCollection` update automatically because they derive from `allTasksCollection`.
- Deleting Time Entry removes from `timeEntriesCollection`.

No new collection should be needed.

### 4. Add UI call sites

Likely files:

- `interface/src/routes/_app/$workspaceSlug/_sidebar/projects/$projectId/index.tsx`
- `interface/src/routes/_app/$workspaceSlug/_sidebar/projects/-components/projects-list.tsx`
- `interface/src/routes/_app/$workspaceSlug/_sidebar/archive/projects/-components/archived-projects-list.tsx`
- calendar Time Entry controls once delete UX exists

UI should call `WorkspaceDb.actions` synchronously and not await Backend Reconciliation.

Example:

```ts
workspaceDb.actions.archiveProject(project.id);
```

If an action throws, treat it as a local state/precondition error. Do not build per-action backend status UI in this pass.

## Core Module Assessment

Keep the current batch-shaped core methods for now:

- `ProjectModule.createProjects`
- `ProjectModule.createTasks`
- `TimeModule.createTimeEntries`
- `TimeModule.hardDeleteTimeEntries`

They are acceptable even when frontend actions call them with one item.

The important invariant remains in core:

- `TimeModuleLayer` owns the “one Running Time Entry per Workspace Member” rule.
- `ProjectModuleLayer` owns Project/Task archive constraints.

Do not duplicate these rules in `interface/src/db`.

## Open Design Constraint

The archive/delete actions will increase repeated action boilerplate.

After this pass, consider a deliberate internal action builder for `WorkspaceDb.actions`, but do not add it before seeing the create/update/archive/delete patterns together.

Potential future shape:

```ts
workspaceAction.updated({
  collection: params.allProjectsCollection,
  local: () => ...,
  remote: () => ...,
  getIds: () => [id],
});
```

The builder should hide RPC header wiring and Backend Reconciliation target wiring without changing the public `WorkspaceDb.actions` interface.

## Verification

Run after implementation:

```sh
bunx oxfmt --write interface/src/db interface/src/lib/services
bun run typecheck
```

Current known baseline: `interface` typecheck already fails on unrelated route/core/UI issues. The implementation should not introduce new errors in:

- `interface/src/db/workspace/project-actions.ts`
- `interface/src/db/workspace/time-entry-actions.ts`
- `interface/src/db/workspace/electric-reconciliation.ts`
- `interface/src/db/workspace/optimistic-workspace-action.ts`
