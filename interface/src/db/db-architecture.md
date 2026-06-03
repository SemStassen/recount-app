# DB architecture plan

## Current direction

We keep two separate scopes:

- `UserDb`
- `WorkspaceDb`

They stay separate because they have different lifetimes:

- `UserDb` lives for the authenticated user session
- `WorkspaceDb` lives for the active workspace

`WorkspaceDb` is also the frontend seam for optimistic workspace data. UI code
should not choose between local state, RPC, and Electric reconciliation directly.
It should call `WorkspaceDb.actions`.

## Phase 1: React-owned lifecycle

### Goals

- keep implementation simple
- colocate setup and teardown in providers
- avoid global singleton collections
- prepare for persistence later

### Structure

- `openUserDb()` is a plain TypeScript factory
- `openWorkspaceDb()` is a plain TypeScript factory
- `UserDbProvider` owns the current user DB instance
- `WorkspaceDbProvider` owns the current workspace DB instance
- React context exposes the active DB instances

### Rules

- `UserDbProvider` sits above the workspace route boundary
- `WorkspaceDbProvider` sits at the workspace route boundary
- providers pass the whole DB instance through context
- each DB instance exposes a single `dispose()` method
- workspace routes call `WorkspaceDb.preload()` before rendering optimistic interactions
- `WorkspaceDb.actions` return local acceptance synchronously for optimistic workspace changes
- `WorkspaceDb.actions` throw when required local state is missing after preload
- backend persistence and reconciliation stay behind the `WorkspaceDb.actions` seam
- server-only workspace concerns stay async and wait for backend authority

### Optimistic workspace seam

Public optimistic workspace calls should look like simple synchronous commands:

```ts
workspaceDb.actions.archiveProject(projectId);
workspaceDb.actions.updateTask(taskId, data);
workspaceDb.actions.deleteTimeEntry(timeEntryId);
```

Each optimistic action must do three things in order:

- mutate local workspace state synchronously through the relevant core module
- return local acceptance immediately, or throw on local rejection
- persist remotely and await Electric reconciliation behind the action seam

The local mutation runs inside a TanStack DB transaction. The remote mutation
and reconciliation are the transaction persistence step. Callers should not
`await` optimistic actions and should not build normal happy-path UI around
backend completion.

Local rejection means a local invariant or preload assumption failed. UI may
catch that synchronous throw to show an error toast, but most call sites should
be written as happy-path synchronous commands.

Backend failure is not part of the immediate caller contract. TanStack DB owns
rollback of the optimistic transaction if the persistence step fails. Do not add
per-action backend loading flags unless the interaction is intentionally
server-authoritative instead of optimistic.

### Workspace action implementation rules

`interface/src/db/workspace/*-actions.ts` should be thin adapters:

- call `runSyncedWorkspaceAction(...)`
- use `params.workspaceRuntime.runSync(...)` for `mutateLocal`
- use core modules for all domain rules and local transitions
- use `BackendAtomRpcClient` for the matching RPC command
- pass `WORKSPACE_ID_HEADER` on every workspace RPC call
- use `insertedRecords(...)`, `updatedRecords(...)`, or `deletedRecords(...)`
  for reconciliation targets
- close over local ids for `void` RPC results instead of reading `remoteResult`

Do not duplicate core invariants in `interface/src/db`. Examples:

- Project and Task archive constraints belong to `ProjectModule`
- Running Time Entry constraints belong to `TimeModule`
- repository mutations should remain in client repository layers

Derived collections should update from base collections. For example,
archiving a Project updates `allProjectsCollection`; active and archived Project
collections derive from that. Do not add new collections just to make archive
or unarchive appear optimistic.

### Effect guidance

Keep the public `WorkspaceDb.actions` API synchronous for optimistic actions.
This is intentional. The UI-facing seam is local acceptance, not backend
completion.

Effects are still appropriate inside the seam:

- core modules expose Effect-based domain operations
- action factories may run local Effects with `workspaceRuntime.runSync(...)`
- remote persistence may run Effects with `workspaceRuntime.runPromise(...)`

Do not make optimistic action call sites return `Effect` just to enable typed
error handling. That pushes domain/runtime ceremony into React components and
weakens the simple happy-path command shape. If repeated try/catch handling
appears in UI, add a small UI helper around synchronous local rejection instead
of changing the action boundary.

Server-authoritative workspace operations are different. They may stay async or
Effect-shaped when the UI must wait for backend authority before updating local
state.

### Things to watch out for

- Do not use `undefined` as the only acceptance sentinel in optimistic helpers;
  `void` actions are valid and accept as `undefined`.
- Do not `await` backend reconciliation in UI call sites for optimistic actions.
- Do not call RPC mutations directly from UI when a `WorkspaceDb.actions` method
  exists.
- Do not add optimistic-specific business rules in route components.
- Do not hand-edit generated route or sync output while working on DB actions.
- Do check that `WorkspaceDb.preload()` includes every collection needed for
  local action preconditions.
- Do check reconciliation operation type: create uses insert, update/archive
  uses update, hard delete uses delete.
- Do check `void` RPC results: reconciliation ids usually need to close over the
  local id.
- Do keep action boilerplate explicit until enough patterns justify a deliberate
  internal action builder.

### Query access

Prefer:

- `useUserDb()`
- `useWorkspaceDb()`
- small collection hooks like `useProjectsCollection()`

Use custom hooks for real reusable domain queries, for example:

- `useProjects()`
- `useProjectById(projectId)`

Do not create a generic hook that returns both collections and `useLiveQuery`.

## Phase 2: Outside-React runtime ownership

When DB lifetime needs to be controlled outside React, introduce a runtime manager:

```ts
class DataRuntime {
  async setUser(userId: string) {}
  async setWorkspace(workspaceId: string) {}
  getUserDb() {}
  getWorkspaceDb() {}
  async disposeAll() {}
}
```
