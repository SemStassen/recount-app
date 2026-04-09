import { snakeCamelMapper } from "@electric-sql/client";
import { UserSettings } from "@recount/core/modules/identity";
import { electricCollectionOptions } from "@tanstack/electric-db-collection";
import { createCollection, useLiveQuery } from "@tanstack/react-db";
import type {
  Context,
  InitialQueryBuilder,
  QueryBuilder,
} from "@tanstack/react-db";
import { Schema } from "effect";

import { env } from "~/lib/env";

export type UserCollections = ReturnType<typeof createUserCollections>;

// Bridge until TanStack DB persistence is generally available: hold the
// user-scoped collections in memory once startup preload completes.
let activeUserCollections: UserCollections | null = null;

function createUserCollections() {
  const preconnectFetch = fetch as typeof fetch & {
    preconnect?: typeof fetch;
  };

  const userFetchClient: typeof fetch = Object.assign(
    (url: RequestInfo | URL, options?: RequestInit) =>
      fetch(url, {
        ...options,
        credentials: "include",
      }),
    {
      preconnect: preconnectFetch.preconnect?.bind(fetch),
    }
  );

  const userSettingsCollection = createCollection(
    electricCollectionOptions({
      id: "current-user-settings",
      schema: Schema.toStandardSchemaV1(UserSettings.json),
      getKey: (userSettings) => userSettings.id,
      shapeOptions: {
        url: `${env.VITE_ELECTRIC_PROXY_URL}/me/user-settings`,
        columnMapper: snakeCamelMapper(),
        fetchClient: userFetchClient,
      },
    })
  );

  return {
    userSettingsCollection,
  };
}

export async function preloadUserCollections(): Promise<void> {
  // Bridge until persistence lands: preload user-scoped data during app
  // startup instead of restoring it from a persisted cache.
  if (activeUserCollections === null) {
    activeUserCollections = createUserCollections();
  }

  const { userSettingsCollection } = activeUserCollections;

  await userSettingsCollection.preload();
}

export function useUserLiveQuery<TContext extends Context>(
  queryFn: (
    q: InitialQueryBuilder,
    collections: UserCollections
  ) => QueryBuilder<TContext> | undefined | null,
  deps?: Array<unknown>
) {
  if (activeUserCollections === null) {
    throw new Error("User collections have not been initialized");
  }

  const collections = activeUserCollections;

  return useLiveQuery((q) => queryFn(q, collections), deps);
}
