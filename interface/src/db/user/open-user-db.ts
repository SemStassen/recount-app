import { snakeCamelMapper } from "@electric-sql/client";
import { electricCollectionOptions } from "@tanstack/electric-db-collection";
import { createCollection } from "@tanstack/react-db";

import { userShapes } from "../sync-shapes";

export type UserDb = ReturnType<typeof openUserDb>;

export function openUserDb(userId: string) {
  const abortController = new AbortController();
  const userFetchClient: typeof fetch = Object.assign(
    (url: RequestInfo | URL, options?: RequestInit) =>
      fetch(url, {
        ...options,
        cache: "no-store",
        credentials: "include",
      }),
    {
      preconnect: fetch.preconnect?.bind(fetch),
    }
  );

  const createCollectionId = (collectionId: string) =>
    `user:${userId}:${collectionId}`;

  const userSettingsCollection = createCollection(
    electricCollectionOptions({
      id: createCollectionId(userShapes.userSettings.name),
      schema: userShapes.userSettings.schema,
      getKey: userShapes.userSettings.getKey,
      shapeOptions: {
        url: userShapes.userSettings.url,
        columnMapper: snakeCamelMapper(),
        transformer: userShapes.userSettings.decodeRow,
        fetchClient: userFetchClient,
        signal: abortController.signal,
      },
    })
  );

  let preloadPromise: Promise<void> | null = null;

  return {
    collections: {
      userSettingsCollection,
    },
    preload: async () => {
      if (!preloadPromise) {
        preloadPromise = Promise.all([userSettingsCollection.preload()]).then(
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
