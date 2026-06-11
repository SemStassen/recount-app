import type { Message } from "@electric-sql/client";
import { describe, expect, it } from "vitest";

import {
  awaitBackendReconciliation,
  deletedRecords,
  insertedRecords,
  updatedRecords,
} from "../../src/db/synced-collections/electric-reconciliation";

interface TestRow {
  readonly id: string;
}

const changeMessage = (
  operation: "insert" | "update" | "delete",
  id: string
): Message<TestRow> => ({
  headers: { operation },
  key: id,
  value: { id },
});

const createCollection = (messages: ReadonlyArray<Message<TestRow>>) => ({
  utils: {
    awaitMatch: async (predicate: (message: Message<TestRow>) => boolean) => {
      const match = messages.find(predicate);

      if (!match) {
        throw new Error("No matching reconciliation message");
      }

      return match;
    },
  },
});

describe("awaitBackendReconciliation", () => {
  it("waits for the expected insert operation and id", async () => {
    const collection = createCollection([
      changeMessage("update", "row-1"),
      changeMessage("insert", "row-2"),
    ]);

    await expect(
      awaitBackendReconciliation({
        remoteResult: { id: "row-2" },
        target: insertedRecords({
          collection,
          getIds: (remoteResult) => [remoteResult.id],
        }),
      })
    ).resolves.toBeUndefined();
  });

  it("waits for the expected update operation and id", async () => {
    const collection = createCollection([
      changeMessage("insert", "row-1"),
      changeMessage("update", "row-1"),
    ]);

    await expect(
      awaitBackendReconciliation({
        remoteResult: { id: "row-1" },
        target: updatedRecords({
          collection,
          getIds: (remoteResult) => [remoteResult.id],
        }),
      })
    ).resolves.toBeUndefined();
  });

  it("waits for delete reconciliation", async () => {
    const collection = createCollection([
      changeMessage("update", "row-1"),
      changeMessage("delete", "row-1"),
    ]);

    await expect(
      awaitBackendReconciliation({
        remoteResult: { id: "row-1" },
        target: deletedRecords({
          collection,
          getIds: (remoteResult) => [remoteResult.id],
        }),
      })
    ).resolves.toBeUndefined();
  });
});
