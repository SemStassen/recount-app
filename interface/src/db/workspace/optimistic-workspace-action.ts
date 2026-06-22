import type { Transaction } from "@tanstack/react-db";
import { createTransaction } from "@tanstack/react-db";

import type { AnyBackendReconciliationTarget } from "~/db/synced-collections/electric-reconciliation";
import { awaitBackendReconciliation } from "~/db/synced-collections/electric-reconciliation";

interface OptimisticWorkspaceActionParams<RemoteResult, Success> {
  readonly onTransaction?: (transaction: Transaction) => void;
  readonly mutateLocal: () => Success;
  readonly persistRemote: (params: {
    readonly accepted: Success;
  }) => Promise<RemoteResult>;
  readonly awaitRemoteSync: (params: {
    readonly accepted: Success;
    readonly remoteResult: RemoteResult;
  }) => Promise<void>;
}

export function runOptimisticWorkspaceTransaction<RemoteResult, Success>(
  params: OptimisticWorkspaceActionParams<RemoteResult, Success>
) {
  // Generic optimistic transaction runner: accept local state synchronously,
  // persist remotely, then wait for caller-defined backend reconciliation before
  // allowing TanStack DB to drop the optimistic overlay.
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

  params.onTransaction?.(transaction);

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
  readonly onTransaction?: (transaction: Transaction) => void;
  readonly mutateLocal: () => Success;
  readonly persistRemote: (params: {
    readonly accepted: Success;
  }) => Promise<RemoteResult>;
  readonly remoteSync: AnyBackendReconciliationTarget<RemoteResult>;
}

export function runElectricReconciledWorkspaceAction<RemoteResult, Success>(
  params: SyncedWorkspaceActionParams<RemoteResult, Success>
) {
  // Most workspace writes reconcile through Electric. This wrapper keeps action
  // code focused on local acceptance and remote persistence, while the generic
  // helper owns the transaction lifecycle.
  return runOptimisticWorkspaceTransaction<RemoteResult, Success>({
    awaitRemoteSync: ({ remoteResult }) =>
      awaitBackendReconciliation({
        remoteResult,
        target: params.remoteSync,
      }),
    mutateLocal: params.mutateLocal,
    onTransaction: params.onTransaction,
    persistRemote: params.persistRemote,
  });
}
