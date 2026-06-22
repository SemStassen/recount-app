import { snakeCamelMapper } from "@electric-sql/client";
import type { UserId } from "@recount/core/shared/schemas";
import { electricCollectionOptions } from "@tanstack/electric-db-collection";
import { createCollection } from "@tanstack/react-db";

import { userSyncedCollections } from "~/db/synced-collections";
import { authFetch } from "~/lib/auth";

export type UserDb = ReturnType<typeof openUserDb>;

const fetchWithPreconnect = fetch as typeof fetch & {
  preconnect?: typeof fetch;
};

export function openUserDb(userId: UserId) {
  const abortController = new AbortController();
  const userFetchClient: typeof fetch = Object.assign(
    (url: RequestInfo | URL, options?: RequestInit) =>
      authFetch(url, {
        ...options,
        cache: "no-store",
      }),
    {
      preconnect: fetchWithPreconnect.preconnect?.bind(fetch),
    }
  );

  const createCollectionId = (collectionId: string) =>
    `user:${userId}:${collectionId}`;

  const userSettingsCollection = createCollection(
    electricCollectionOptions({
      id: createCollectionId(userSyncedCollections.userSettings.name),
      getKey: userSyncedCollections.userSettings.getKey,
      schema: userSyncedCollections.userSettings.schema,
      shapeOptions: {
        columnMapper: snakeCamelMapper(),
        fetchClient: userFetchClient,
        signal: abortController.signal,
        transformer: userSyncedCollections.userSettings.decodeElectricRow,
        url: userSyncedCollections.userSettings.url,
      },
    })
  );

  let preloadPromise: Promise<void> | null = null;

  return {
    collections: {
      userSettingsCollection,
    },
    preload: () => {
      if (!preloadPromise) {
        // oxlint-disable-next-line no-single-promise-in-promise-methods prefer-await-to-then
        preloadPromise = Promise.all([userSettingsCollection.preload()]).then(
          // oxlint-disable-next-line  no-empty-function
          () => {}
        );
      }

      return preloadPromise;
    },
    dispose: async () => {
      abortController.abort();

      await Promise.allSettled([userSettingsCollection.cleanup()]);
    },
  };
}
