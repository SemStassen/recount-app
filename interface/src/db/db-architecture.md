# DB architecture plan

## Current direction

We keep two separate scopes:

- `UserDb`
- `WorkspaceDb`

They stay separate because they have different lifetimes:

- `UserDb` lives for the authenticated user session
- `WorkspaceDb` lives for the active workspace

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
