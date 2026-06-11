# Synced Collections Refactor Plan

## Goal

Make Local Workspace State easier to reason about by giving each synced
collection one definition that owns its Electric sync shape, local collection row
schema, and optional optimistic repository behavior.

## Current Pain

- `sync-shapes` owns Electric route metadata while
  `workspace-collection-codecs.ts` owns schemas, Electric decoders, domain-row
  mapping, and patch mapping.
- `open-workspace-db.ts` knows too much about derived tracked-time views, causing
  casts such as `as unknown as Collection<...>` to appear in setup code.
- Client repositories depend on local collection row details instead of mostly
  mirroring core repository semantics.
- `TimerCollectionInsert` and `TimeEntryCollectionInsert` imply separate storage
  rows, but timers and time entries are view roles over one tracked-time row.

## Target Structure

- Replace `sync-shapes` with `synced-collections`.
- Export `userSyncedCollections` and `workspaceSyncedCollections`.
- Use `defineSyncedCollection` for both user-scoped and workspace-scoped synced
  collections.
- Each synced collection definition owns:
  - `name`
  - `routePath`
  - `url`
  - `schema`
  - `getKey`
  - `decodeElectricRow`
- Optimistic workspace data also owns local repository behavior or mapping that
  mirrors the matching core repository semantics.

## Repository Parity

Local optimistic repositories should mimic server repository behavior for:

- accepted writes
- workspace filters
- timer/time-entry role filters
- not-found semantics
- delete scope

Future tests should run the same repository contract cases against server DB
repositories and local optimistic repositories.

## Tracked Time

Tracked time is the special case.

- Storage row: `TrackedTimeRow` from core persistence.
- Domain roles: `Timer` and `TimeEntry` from core domain.
- Local collection row: TanStack-friendly representation of `TrackedTimeRow`
  using local `Date` and `null` values.
- Role mapping should use core functions from
  `@recount/core/modules/time/persistence` when possible:
  - `timerFromTrackedTimeRow`
  - `timeEntryFromTrackedTimeRow`
  - `trackedTimeRowFromTimer`
  - `trackedTimeRowFromTimeEntry`
  - `trackedTimeUpdateFromTimeEntryChanges`

`timersCollection` and `timeEntriesCollection` remain derived live query
collections over `allTrackedTimeCollection`. If TanStack DB cannot express the
filter-based type refinement, keep the cast inline with a comment at the view
boundary.

## Non-Goals

- No local persistence or offline queue yet.
- No rollback/undo UX changes.
- No broad behavior changes before repository parity tests exist.
- No helper/factory extraction unless there is real reuse.

## Implementation Checklist

- Add `define-synced-collection.ts`.
- Add `workspace-synced-collections.ts` and `user-synced-collections.ts`.
- Move schemas, Electric decoders, and local mapping out of
  `workspace-collection-codecs.ts`.
- Update `open-workspace-db.ts` to import synced collection definitions.
- Keep Electric collection setup boilerplate inline for now.
- Update workspace runtime and client repositories to use new definitions.
- Remove misleading timer/time-entry insert types.
- Delete old `sync-shapes` and `workspace-collection-codecs.ts` after callers
  move.
- Run focused typecheck/lint after refactor.
