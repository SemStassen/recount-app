import type { ElectricCollectionUtils } from "@tanstack/electric-db-collection";
import { isChangeMessage } from "@tanstack/electric-db-collection";
import type { Row } from "@tanstack/react-db";

type ElectricOperation = "insert" | "update" | "delete";

export interface ReconciledCollection {
  // Reconciliation only depends on Electric's awaitMatch utility.
  // Keep this boundary narrow so TanStack DB collection generics do not leak into action code,
  // while package-version changes to ElectricCollectionUtils still typecheck.
  readonly utils: Pick<ElectricCollectionUtils<Row<unknown>>, "awaitMatch">;
}

interface BackendReconciliationTarget<RemoteResult, Id> {
  readonly collection: ReconciledCollection;
  readonly operation: ElectricOperation;
  readonly getIds: (remoteResult: RemoteResult) => ReadonlyArray<Id>;
}

export type AnyBackendReconciliationTarget<RemoteResult> =
  BackendReconciliationTarget<RemoteResult, unknown>;

function awaitCollectionChange<Id>(params: {
  readonly collection: ReconciledCollection;
  readonly operation: ElectricOperation;
  readonly id: Id;
}) {
  return params.collection.utils.awaitMatch((message) => {
    if (!isChangeMessage(message)) {
      return false;
    }

    const change = message as unknown as {
      readonly headers: { readonly operation: ElectricOperation };
      readonly value: { readonly id: Id };
    };

    return (
      change.headers.operation === params.operation &&
      change.value.id === params.id
    );
  });
}

function awaitCollectionChanges<Id>(params: {
  readonly collection: ReconciledCollection;
  readonly operation: ElectricOperation;
  readonly ids: ReadonlyArray<Id>;
}) {
  return Promise.all(
    params.ids.map((id) =>
      awaitCollectionChange({
        collection: params.collection,
        id,
        operation: params.operation,
      })
    )
  );
}

export function insertedRecords<RemoteResult, Id>(params: {
  readonly collection: ReconciledCollection;
  readonly getIds: (remoteResult: RemoteResult) => ReadonlyArray<Id>;
}): BackendReconciliationTarget<RemoteResult, Id> {
  return {
    ...params,
    operation: "insert",
  };
}

export function updatedRecords<RemoteResult, Id>(params: {
  readonly collection: ReconciledCollection;
  readonly getIds: (remoteResult: RemoteResult) => ReadonlyArray<Id>;
}): BackendReconciliationTarget<RemoteResult, Id> {
  return {
    ...params,
    operation: "update",
  };
}

export function deletedRecords<RemoteResult, Id>(params: {
  readonly collection: ReconciledCollection;
  readonly getIds: (remoteResult: RemoteResult) => ReadonlyArray<Id>;
}): BackendReconciliationTarget<RemoteResult, Id> {
  return {
    ...params,
    operation: "delete",
  };
}

export async function awaitBackendReconciliation<RemoteResult>(params: {
  readonly target: AnyBackendReconciliationTarget<RemoteResult>;
  readonly remoteResult: RemoteResult;
}): Promise<void> {
  await awaitCollectionChanges({
    collection: params.target.collection,
    ids: params.target.getIds(params.remoteResult),
    operation: params.target.operation,
  });
}
