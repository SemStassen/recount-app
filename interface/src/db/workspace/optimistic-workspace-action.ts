import { createTransaction } from "@tanstack/react-db";
import { Exit } from "effect";

interface OptimisticWorkspaceActionParams<
  Entity extends object,
  Accepted,
  RemoteResult,
  Success,
> {
  readonly mutateLocal: () => Accepted;
  readonly persistRemote: (params: {
    readonly transaction: ReturnType<typeof createTransaction<Entity>>;
    readonly accepted: Accepted;
  }) => Promise<RemoteResult>;
  readonly awaitRemoteSync: (params: {
    readonly transaction: ReturnType<typeof createTransaction<Entity>>;
    readonly accepted: Accepted;
    readonly remoteResult: RemoteResult;
  }) => Promise<void>;
  readonly toSuccess: (params: {
    readonly accepted: Accepted;
    readonly transaction: ReturnType<typeof createTransaction<Entity>>;
  }) => Success;
}

export function runOptimisticWorkspaceAction<
  Entity extends object,
  Accepted,
  RemoteResult,
  Success,
>(
  params: OptimisticWorkspaceActionParams<
    Entity,
    Accepted,
    RemoteResult,
    Success
  >
) {
  let accepted: Accepted | undefined;
  const transaction = createTransaction<Entity>({
    mutationFn: async ({ transaction }) => {
      if (accepted === undefined) {
        throw new Error(
          "Optimistic action was persisted before local mutation"
        );
      }

      const remoteResult = await params.persistRemote({
        transaction,
        accepted,
      });

      await params.awaitRemoteSync({
        transaction,
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

    return Exit.succeed(
      params.toSuccess({
        accepted,
        transaction,
      })
    );
  } catch (cause) {
    return Exit.fail(cause);
  }
}
