import { createTransaction } from "@tanstack/react-db";

import {
  awaitBackendReconciliation,
  type AnyBackendReconciliationTarget,
} from "./electric-reconciliation";

interface OptimisticWorkspaceActionParams<RemoteResult, Success> {
  readonly mutateLocal: () => Success;
  readonly persistRemote: (params: {
    readonly accepted: Success;
  }) => Promise<RemoteResult>;
  readonly awaitRemoteSync: (params: {
    readonly accepted: Success;
    readonly remoteResult: RemoteResult;
  }) => Promise<void>;
}

export function runOptimisticWorkspaceAction<RemoteResult, Success>(
  params: OptimisticWorkspaceActionParams<RemoteResult, Success>
) {
  let accepted: readonly [Success] | undefined;
  const transaction = createTransaction({
    mutationFn: async () => {
      if (!accepted) {
        throw new Error(
          "Optimistic action was persisted before local mutation"
        );
      }

      const [acceptedValue] = accepted;

      const remoteResult = await params.persistRemote({
        accepted: acceptedValue,
      });

      await params.awaitRemoteSync({
        accepted: acceptedValue,
        remoteResult,
      });
    },
  });

  transaction.mutate(() => {
    accepted = [params.mutateLocal()];
  });

  if (!accepted) {
    throw new Error("Optimistic action did not produce a local result");
  }

  const [acceptedValue] = accepted;

  return acceptedValue;
}

interface SyncedWorkspaceActionParams<RemoteResult, Success> {
  readonly mutateLocal: () => Success;
  readonly persistRemote: (params: {
    readonly accepted: Success;
  }) => Promise<RemoteResult>;
  readonly remoteSync: AnyBackendReconciliationTarget<RemoteResult>;
}

export function runSyncedWorkspaceAction<RemoteResult, Success>(
  params: SyncedWorkspaceActionParams<RemoteResult, Success>
) {
  return runOptimisticWorkspaceAction<RemoteResult, Success>({
    mutateLocal: params.mutateLocal,
    persistRemote: params.persistRemote,
    awaitRemoteSync: ({ remoteResult }) =>
      awaitBackendReconciliation({
        target: params.remoteSync,
        remoteResult,
      }),
  });
}
