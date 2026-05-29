import {
  isChangeMessage,
  type ElectricCollectionUtils,
} from "@tanstack/electric-db-collection";
import type { Collection } from "@tanstack/react-db";

type ElectricOperation = "insert" | "update" | "delete";

type ReconciledCollection = Collection<
  any,
  any,
  ElectricCollectionUtils<any>,
  any,
  any
>;

export function awaitCollectionChange<Id>(params: {
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

export function awaitCollectionChanges<Id>(params: {
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
