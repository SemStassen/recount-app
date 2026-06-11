import { snakeCamelMapper } from "@electric-sql/client";
import { WORKSPACE_ID_HEADER } from "@recount/core/shared/headers";
import type { UserId, WorkspaceId } from "@recount/core/shared/schemas";
import { electricCollectionOptions } from "@tanstack/electric-db-collection";
import {
  createCollection,
  createLiveQueryCollection,
  isNull,
  not,
} from "@tanstack/react-db";
import type { Collection } from "@tanstack/react-db";

import type { TimeEntryViewRow, TimerViewRow } from "~/db/synced-collections";
import { workspaceSyncedCollections } from "~/db/synced-collections";
import { authFetch } from "~/lib/auth";

import { createProjectActions } from "./project-actions";
import { createTimeEntryActions } from "./time-entry-actions";
import { createWorkspaceRuntime } from "./workspace-runtime";

export type WorkspaceDb = Awaited<ReturnType<typeof openWorkspaceDb>>;

const fetchWithPreconnect = fetch as typeof fetch & {
  preconnect?: typeof fetch;
};

/* Should stay async for persistence later */
/* oxlint-disable-next-line require-await */
export async function openWorkspaceDb(
  workspaceId: WorkspaceId,
  userId: UserId
) {
  const abortController = new AbortController();
  const workspaceFetchClient: typeof fetch = Object.assign(
    (url: RequestInfo | URL, options?: RequestInit) =>
      authFetch(url, {
        ...options,
        cache: "no-store",
        headers: {
          ...options?.headers,
          [WORKSPACE_ID_HEADER]: workspaceId,
        },
      }),
    {
      preconnect: fetchWithPreconnect.preconnect?.bind(fetch),
    }
  );

  const createCollectionId = (collectionId: string) =>
    `workspace:${workspaceId}:${collectionId}`;

  const workspaceMembersCollection = createCollection(
    electricCollectionOptions({
      id: createCollectionId(workspaceSyncedCollections.workspaceMembers.name),
      getKey: workspaceSyncedCollections.workspaceMembers.getKey,
      schema: workspaceSyncedCollections.workspaceMembers.schema,
      shapeOptions: {
        columnMapper: snakeCamelMapper(),
        fetchClient: workspaceFetchClient,
        signal: abortController.signal,
        transformer:
          workspaceSyncedCollections.workspaceMembers.decodeElectricRow,
        url: workspaceSyncedCollections.workspaceMembers.url,
      },
    })
  );

  const workspaceIntegrationConnectionsCollection = createCollection(
    electricCollectionOptions({
      id: createCollectionId(
        workspaceSyncedCollections.workspaceIntegrationConnections.name
      ),
      getKey: workspaceSyncedCollections.workspaceIntegrationConnections.getKey,
      schema: workspaceSyncedCollections.workspaceIntegrationConnections.schema,
      shapeOptions: {
        columnMapper: snakeCamelMapper(),
        fetchClient: workspaceFetchClient,
        signal: abortController.signal,
        transformer:
          workspaceSyncedCollections.workspaceIntegrationConnections
            .decodeElectricRow,
        url: workspaceSyncedCollections.workspaceIntegrationConnections.url,
      },
    })
  );

  const allProjectsCollection = createCollection(
    electricCollectionOptions({
      id: createCollectionId(workspaceSyncedCollections.projects.name),
      getKey: workspaceSyncedCollections.projects.getKey,
      schema: workspaceSyncedCollections.projects.schema,
      shapeOptions: {
        columnMapper: snakeCamelMapper(),
        fetchClient: workspaceFetchClient,
        signal: abortController.signal,
        transformer: workspaceSyncedCollections.projects.decodeElectricRow,
        url: workspaceSyncedCollections.projects.url,
      },
    })
  );

  const activeProjectsCollection = createLiveQueryCollection((q) =>
    q.from({ p: allProjectsCollection }).where(({ p }) => isNull(p.archivedAt))
  );

  const archivedProjectsCollection = createLiveQueryCollection((q) =>
    q
      .from({ p: allProjectsCollection })
      .where(({ p }) => not(isNull(p.archivedAt)))
  );

  const allTasksCollection = createCollection(
    electricCollectionOptions({
      id: createCollectionId(workspaceSyncedCollections.tasks.name),
      getKey: workspaceSyncedCollections.tasks.getKey,
      schema: workspaceSyncedCollections.tasks.schema,
      shapeOptions: {
        columnMapper: snakeCamelMapper(),
        fetchClient: workspaceFetchClient,
        signal: abortController.signal,
        transformer: workspaceSyncedCollections.tasks.decodeElectricRow,
        url: workspaceSyncedCollections.tasks.url,
      },
    })
  );

  const activeTasksCollection = createLiveQueryCollection((q) =>
    q.from({ t: allTasksCollection }).where(({ t }) => isNull(t.archivedAt))
  );

  const archivedTasksCollection = createLiveQueryCollection((q) =>
    q
      .from({ t: allTasksCollection })
      .where(({ t }) => not(isNull(t.archivedAt)))
  );

  const allTrackedTimeCollection = createCollection(
    electricCollectionOptions({
      id: createCollectionId(workspaceSyncedCollections.timeEntries.name),
      getKey: workspaceSyncedCollections.timeEntries.getKey,
      schema: workspaceSyncedCollections.timeEntries.schema,
      shapeOptions: {
        columnMapper: snakeCamelMapper(),
        fetchClient: workspaceFetchClient,
        signal: abortController.signal,
        transformer: workspaceSyncedCollections.timeEntries.decodeElectricRow,
        url: workspaceSyncedCollections.timeEntries.url,
      },
    })
  );

  /**
   * TanStack DB cannot express that this live query narrows
   * TrackedTimeCollectionRow by stoppedAt, so keep this cast at view boundary.
   */
  const timersCollection = createLiveQueryCollection((q) =>
    q
      .from({ trackedTime: allTrackedTimeCollection })
      .where(({ trackedTime }) => isNull(trackedTime.stoppedAt))
  ) as unknown as Collection<
    TimerViewRow,
    string | number,
    Record<string, never>
  >;

  /**
   * TanStack DB cannot express that this live query narrows
   * TrackedTimeCollectionRow by stoppedAt, so keep this cast at view boundary.
   */
  const timeEntriesCollection = createLiveQueryCollection((q) =>
    q
      .from({ trackedTime: allTrackedTimeCollection })
      .where(({ trackedTime }) => not(isNull(trackedTime.stoppedAt)))
  ) as unknown as Collection<
    TimeEntryViewRow,
    string | number,
    Record<string, never>
  >;

  const workspaceRuntime = createWorkspaceRuntime({
    allProjectsCollection,
    allTasksCollection,
    timeEntriesCollection: allTrackedTimeCollection,
  });

  const projectActions = createProjectActions({
    allProjectsCollection,
    allTasksCollection,
    workspaceId,
    workspaceRuntime,
  });
  const timeEntryActions = createTimeEntryActions({
    timeEntriesCollection: allTrackedTimeCollection,
    userId,
    workspaceId,
    workspaceMembersCollection,
    workspaceRuntime,
  });

  let preloadPromise: Promise<void> | null = null;

  return {
    actions: {
      ...projectActions,
      ...timeEntryActions,
    },
    collections: {
      activeProjectsCollection,
      activeTasksCollection,
      allProjectsCollection,
      allTasksCollection,
      allTrackedTimeCollection,
      archivedProjectsCollection,
      archivedTasksCollection,
      timeEntriesCollection,
      timersCollection,
      workspaceIntegrationConnectionsCollection,
      workspaceMembersCollection,
    },
    preload: () => {
      if (!preloadPromise) {
        preloadPromise = Promise.all([
          workspaceMembersCollection.preload(),
          workspaceIntegrationConnectionsCollection.preload(),
          allProjectsCollection.preload(),
          activeProjectsCollection.preload(),
          archivedProjectsCollection.preload(),
          allTasksCollection.preload(),
          activeTasksCollection.preload(),
          archivedTasksCollection.preload(),
          allTrackedTimeCollection.preload(),
          timersCollection.preload(),
          timeEntriesCollection.preload(),
          // oxlint-disable-next-line prefer-await-to-then no-empty-function
        ]).then(() => {});
      }

      return preloadPromise;
    },
    dispose: async () => {
      abortController.abort();

      await Promise.allSettled([
        workspaceRuntime.dispose(),
        workspaceMembersCollection.cleanup(),
        workspaceIntegrationConnectionsCollection.cleanup(),
        allProjectsCollection.cleanup(),
        activeProjectsCollection.cleanup(),
        archivedProjectsCollection.cleanup(),
        allTasksCollection.cleanup(),
        activeTasksCollection.cleanup(),
        archivedTasksCollection.cleanup(),
        allTrackedTimeCollection.cleanup(),
        timersCollection.cleanup(),
        timeEntriesCollection.cleanup(),
      ]);
    },
  };
}
