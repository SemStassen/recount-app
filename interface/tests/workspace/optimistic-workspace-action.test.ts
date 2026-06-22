import type { Transaction } from "@tanstack/react-db";
import {
  createCollection,
  localOnlyCollectionOptions,
} from "@tanstack/react-db";
import { describe, expect, it } from "vitest";

import { runElectricReconciledWorkspaceAction } from "../../src/db/workspace/optimistic-workspace-action";

interface TestRow {
  readonly id: string;
  readonly value: string;
}

const createTestCollection = () =>
  createCollection(
    localOnlyCollectionOptions<TestRow>({
      getKey: (row) => row.id,
      id: `test-${crypto.randomUUID()}`,
      initialData: [],
    })
  );

describe("runElectricReconciledWorkspaceAction", () => {
  it("accepts local mutations synchronously before remote persistence settles", async () => {
    const collection = createTestCollection();
    let transaction: Transaction | undefined;
    const remotePersistence = Promise.withResolvers<TestRow>();

    const accepted = runElectricReconciledWorkspaceAction({
      mutateLocal: () => {
        const row = { id: "row-1", value: "local" } satisfies TestRow;
        collection.insert(row);

        return row;
      },
      onTransaction: (tx) => {
        transaction = tx;
      },
      persistRemote: () => remotePersistence.promise,
      remoteSync: {
        collection: {
          utils: {
            awaitMatch: () => Promise.resolve(true),
          },
        },
        getIds: (remoteResult) => [remoteResult.id],
        operation: "insert",
      },
    });

    expect(accepted).toEqual({ id: "row-1", value: "local" });
    expect(collection.get("row-1")?.value).toBe("local");

    remotePersistence.resolve({ id: "row-1", value: "remote" });
    await transaction?.isPersisted.promise;
  });

  it("rolls back optimistic collection writes when remote persistence fails", async () => {
    const collection = createTestCollection();
    let transaction: Transaction | undefined;
    const remoteError = new Error("remote write failed");

    runElectricReconciledWorkspaceAction({
      mutateLocal: () => {
        const row = { id: "row-2", value: "local" } satisfies TestRow;
        collection.insert(row);

        return row;
      },
      onTransaction: (tx) => {
        transaction = tx;
      },
      persistRemote: () => Promise.reject(remoteError),
      remoteSync: {
        collection: {
          utils: {
            awaitMatch: () => Promise.resolve(true),
          },
        },
        getIds: (remoteResult: TestRow) => [remoteResult.id],
        operation: "insert",
      },
    });

    expect(collection.get("row-2")?.value).toBe("local");
    await expect(transaction?.isPersisted.promise).rejects.toBe(remoteError);
    expect(collection.get("row-2")).toBeUndefined();
  });
});
