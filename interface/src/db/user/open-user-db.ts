import { snakeCamelMapper } from "@electric-sql/client";
import { electricCollectionOptions } from "@tanstack/electric-db-collection";
import { createCollection } from "@tanstack/react-db";

import { authFetch } from "~/lib/auth";

import { userShapes } from "../sync-shapes";

export type UserDb = ReturnType<typeof openUserDb>;

const fetchWithPreconnect = fetch as typeof fetch & {
  preconnect?: typeof fetch;
};

export function openUserDb(userId: string) {
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
