import { createTransaction } from "@tanstack/react-db";
import { Exit } from "effect";

import {
  awaitCollectionChanges,
  type ElectricOperation,
  type ReconciledCollection,
} from "./electric-reconciliation";

interface OptimisticWorkspaceActionParams<
  Entity extends object,
  RemoteResult,
  Success,
> {
  readonly mutateLocal: () => Success;
  readonly persistRemote: (params: { readonly accepted: Success }) =>
    Promise<RemoteResult>;
  readonly awaitRemoteSync: (params: {
    readonly accepted: Success;
    readonly remoteResult: RemoteResult;
  }) => Promise<void>;
}

export function runOptimisticWorkspaceAction<
  Entity extends object,
  RemoteResult,
  Success,
>(
  params: OptimisticWorkspaceActionParams<Entity, RemoteResult, Success>
) {
  let accepted: Success | undefined;
  const transaction = createTransaction<Entity>({
    mutationFn: async () => {
      if (accepted === undefined) {
        throw new Error(
          "Optimistic action was persisted before local mutation"
        );
      }

      const remoteResult = await params.persistRemote({
        accepted,
      });

      await params.awaitRemoteSync({
        accepted,
        remoteResult,
      });
    },
  });

  try {
    transaction.mutate(() => {
      accepted = params.mutateLocal();
    });

    if (accepted === undefined) {
      throw new Error("Optimistic action did not produce a local result");
    }

    return Exit.succeed(accepted);
  } catch (cause) {
    return Exit.fail(cause);
  }
}

interface SyncedWorkspaceActionParams<
  Entity extends object,
  RemoteResult,
  Success,
  Id,
> {
  readonly mutateLocal: () => Success;
  readonly persistRemote: (params: { readonly accepted: Success }) =>
    Promise<RemoteResult>;
  readonly remoteSync: {
    readonly collection: ReconciledCollection;
    readonly operation: ElectricOperation;
    readonly getIds: (remoteResult: RemoteResult) => ReadonlyArray<Id>;
  };
}

export function runSyncedWorkspaceAction<
  Entity extends object,
  RemoteResult,
  Success,
  Id = unknown,
>(
  params: SyncedWorkspaceActionParams<Entity, RemoteResult, Success, Id>
) {
  return runOptimisticWorkspaceAction<Entity, RemoteResult, Success>({
    mutateLocal: params.mutateLocal,
    persistRemote: params.persistRemote,
    awaitRemoteSync: ({ remoteResult }) =>
      awaitCollectionChanges({
        collection: params.remoteSync.collection,
        operation: params.remoteSync.operation,
        ids: params.remoteSync.getIds(remoteResult),
      }).then(() => {}),
  });
}
