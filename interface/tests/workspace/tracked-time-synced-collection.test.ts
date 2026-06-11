import { TrackedTimeRow } from "@recount/core/modules/time/persistence";
import {
  ProjectId,
  TaskId,
  TimeEntryId,
  WorkspaceId,
  WorkspaceMemberId,
} from "@recount/core/shared/schemas";
import { generateUUID } from "@recount/core/shared/utils";
import { DateTime, Option } from "effect";
import { describe, expect, it } from "vitest";

import {
  toTrackedTimeCollectionInsert,
  toTrackedTimeCollectionPatch,
  toTrackedTimeRow,
  workspaceSyncedCollections,
} from "../../src/db/synced-collections";
import type { TrackedTimeCollectionRow } from "../../src/db/synced-collections";

const makeId = <T>(brand: { make: (value: string) => T }) =>
  brand.make(generateUUID());

const ids = {
  projectId: makeId(ProjectId),
  taskId: makeId(TaskId),
  timeEntryId: makeId(TimeEntryId),
  workspaceId: makeId(WorkspaceId),
  workspaceMemberId: makeId(WorkspaceMemberId),
};

const startedAtDate = new Date("2026-01-01T09:00:00.000Z");
const stoppedAtDate = new Date("2026-01-01T10:00:00.000Z");
const startedAt = DateTime.makeUnsafe(startedAtDate);
const stoppedAt = DateTime.makeUnsafe(stoppedAtDate);

const makeCollectionRow = (
  overrides: Partial<TrackedTimeCollectionRow> = {}
): TrackedTimeCollectionRow => ({
  id: ids.timeEntryId,
  notes: null,
  projectId: ids.projectId,
  startedAt: startedAtDate,
  stoppedAt: stoppedAtDate,
  taskId: null,
  workspaceId: ids.workspaceId,
  workspaceMemberId: ids.workspaceMemberId,
  ...overrides,
});

describe("tracked time synced collection", () => {
  it("decodes Electric transport rows into Local Workspace State rows", () => {
    const row = workspaceSyncedCollections.timeEntries.decodeElectricRow({
      id: ids.timeEntryId,
      notes: null,
      projectId: ids.projectId,
      startedAt: startedAtDate.toISOString(),
      stoppedAt: null,
      taskId: ids.taskId,
      workspaceId: ids.workspaceId,
      workspaceMemberId: ids.workspaceMemberId,
    });

    expect(row.startedAt).toBeInstanceOf(Date);
    expect(row.startedAt.toISOString()).toBe(startedAtDate.toISOString());
    expect(row.stoppedAt).toBeNull();
    expect(row.taskId).toBe(ids.taskId);
  });

  it("maps collection rows to domain rows at the adapter seam", () => {
    const domainRow = toTrackedTimeRow(
      makeCollectionRow({
        notes: { text: "worked on codec cleanup" },
        taskId: ids.taskId,
      })
    );

    expect(domainRow.startedAt).toEqual(startedAt);
    expect(domainRow.stoppedAt).toEqual(Option.some(stoppedAt));
    expect(domainRow.taskId).toEqual(Option.some(ids.taskId));
    expect(domainRow.notes).toEqual(
      Option.some({ text: "worked on codec cleanup" })
    );
  });

  it("maps domain rows to collection rows for optimistic writes", () => {
    const row = TrackedTimeRow.make({
      id: ids.timeEntryId,
      notes: Option.none(),
      projectId: ids.projectId,
      startedAt,
      stoppedAt: Option.none(),
      taskId: Option.some(ids.taskId),
      workspaceId: ids.workspaceId,
      workspaceMemberId: ids.workspaceMemberId,
    });

    expect(toTrackedTimeCollectionInsert(row)).toMatchObject({
      notes: null,
      startedAt: startedAtDate,
      stoppedAt: null,
      taskId: ids.taskId,
    });
  });

  it("preserves omitted and intentionally cleared partial update fields", () => {
    expect(toTrackedTimeCollectionPatch({ notes: Option.none() })).toEqual({
      notes: null,
      startedAt: undefined,
      stoppedAt: undefined,
      taskId: undefined,
    });
    expect(toTrackedTimeCollectionPatch({ startedAt })).toEqual({
      notes: undefined,
      startedAt: startedAtDate,
      stoppedAt: undefined,
      taskId: undefined,
    });
  });
});
