import {
  isChangeMessage,
  type ElectricCollectionUtils,
} from "@tanstack/electric-db-collection";
import type { Collection } from "@tanstack/react-db";

type ElectricOperation = "insert" | "update" | "delete";

export type ReconciledCollection = Collection<
  any,
  any,
  ElectricCollectionUtils<any>,
  any,
  any
>;

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
        operation: params.operation,
        id,
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

export function awaitBackendReconciliation<RemoteResult>(params: {
  readonly target: AnyBackendReconciliationTarget<RemoteResult>;
  readonly remoteResult: RemoteResult;
}) {
  return awaitCollectionChanges({
    collection: params.target.collection,
    operation: params.target.operation,
    ids: params.target.getIds(params.remoteResult),
  }).then(() => {});
}
