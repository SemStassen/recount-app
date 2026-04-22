import { snakeCamelMapper } from "@electric-sql/client";
import { UserSettings } from "@recount/core/modules/identity";
import { electricCollectionOptions } from "@tanstack/electric-db-collection";
import { createCollection } from "@tanstack/react-db";
import { Schema, Struct } from "effect";

import { env } from "~/lib/env";

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
      id: createCollectionId("current-user-settings"),
      schema: Schema.toStandardSchemaV1(UserSettings.json),
      getKey: (userSettings) => userSettings.id,
      shapeOptions: {
        url: `${env.VITE_ELECTRIC_PROXY_URL}/me/user-settings`,
        columnMapper: snakeCamelMapper(),
        transformer: (row) =>  Schema.decodeUnknownSync(UserSettings.json.mapFields(Struct.map(Schema.optionalKey)))(row),
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
