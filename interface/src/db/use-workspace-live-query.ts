import {
  type Context,
  type InitialQueryBuilder,
  type QueryBuilder,
  useLiveQuery as useTanstackLiveQuery,
} from "@tanstack/react-db";

import type { WorkspaceCollections } from "./collections";
import { getWorkspaceCollections } from "./workspace-collections";

export function useWorkspaceLiveQuery<TContext extends Context>(
  queryFn: (
    q: InitialQueryBuilder,
    db: WorkspaceCollections
  ) => QueryBuilder<TContext>
) {
  const db = getWorkspaceCollections();

  return useTanstackLiveQuery<TContext>((q) => queryFn(q, db));
}
