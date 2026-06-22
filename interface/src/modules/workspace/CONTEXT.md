# Interface Workspace State

The Interface Workspace State context describes how the frontend presents local workspace data before backend confirmation.

## Module boundary

The workspace module owns the workspace-scoped frontend runtime:

- `WorkspaceDb` lifecycle, provider, and React hook
- workspace-scoped optimistic actions
- workspace runtime wiring for local repository parity

Shared sync infrastructure, Electric collection helpers, and user-scoped local data stay outside this module under `interface/src/db`. This keeps the two local DB scopes explicit: `UserDb` is session-scoped, while `WorkspaceDb` is active-workspace-scoped.

## Language

**Local Workspace State**:
The frontend's short-lived local view of a workspace, used for optimistic updates and brief offline tolerance before backend reconciliation.
_Avoid_: Offline source of truth, local backend

**Optimistic Workspace Data**:
Workspace data that local workspace state may change before backend reconciliation.
_Avoid_: Server-only workspace data, offline source of truth

**Backend Reconciliation**:
The process where authoritative backend state replaces or confirms local workspace state after a local action.
_Avoid_: Conflict resolution, sync merge

**Optimistic Action Command**:
The command accepted by an optimistic WorkspaceDb action before backend confirmation. It should match the backend RPC command shape as closely as possible while allowing local enrichment such as generated IDs or current timestamps.
_Avoid_: Local mutation payload, collection row input

**Local Repository Parity**:
Local optimistic repository behavior matches server repository behavior for accepted writes, role filters, and not-found semantics so backend reconciliation does not undo locally accepted impossible states.
_Avoid_: Best-effort local mock, UI-only behavior

## Relationships

- **Local Workspace State** may decide optimistic **Project**, **Task**, and **Time Entry** changes before backend confirmation
- **Project**, **Task**, and **Time Entry** are currently **Optimistic Workspace Data**
- More workspace data may become **Optimistic Workspace Data** as Recount grows
- **Workspace Invitation** and **Integration Connection** are server-only unless explicitly made **Optimistic Workspace Data**
- **Local Workspace State** is not authoritative; **Backend Reconciliation** may silently replace it with backend truth
- **Local Workspace State** should support brief offline tolerance, not weeks of divergent offline work
- Future local persistence should make unpersisted **Optimistic Workspace Data** visible without forcing callers to await **Backend Reconciliation** for local acceptance
- Optimistic **WorkspaceDb** actions should return local acceptance synchronously; server-only workspace concerns should stay asynchronous because they wait for backend authority
- **Optimistic Action Commands** are RPC-shaped at the action boundary; domain and collection row adaptation stays behind that boundary
- **Local Repository Parity** keeps local optimistic acceptance aligned with backend acceptance
- **Local Workspace State** rows use the domain field's source representation for domain codec fields, such as local Dates and nullable values, rather than storing decoded domain wrappers
- Workspace routes should preload **WorkspaceDb** before rendering optimistic interactions; missing required local data after preload is a local state error, not a normal loading path
- **Backend Reconciliation** should preserve backend authority over permissions, validation, and persisted workspace data

## Flagged ambiguities

- **Local Workspace State** is a product behaviour, not a storage choice; IndexedDB, TanStack DB, SQLite, PGlite, or Turso are adapter options.
- Long-lived offline conflict resolution is not currently a product goal.
