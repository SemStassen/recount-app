import type { TimeEntryId } from "@recount/core/shared/schemas";

import type { TimeEntryViewRow } from "~/db/synced-collections";

import type { EditingPreview } from "../../state/editor";
import type { TimeRange } from "../../types";
import type { TimeEntryFormValues } from "./field-group";

const createTimeEntryFormDefaults: TimeEntryFormValues = {
  startedAt: new Date(),
  stoppedAt: new Date(),
  projectId: "",
  taskId: null,
  notes: null,
};

export function getCreateTimeEntryFormDefaults(
  initialRange: TimeRange | null
): TimeEntryFormValues {
  return {
    ...createTimeEntryFormDefaults,
    startedAt: initialRange?.startedAt ?? createTimeEntryFormDefaults.startedAt,
    stoppedAt: initialRange?.stoppedAt ?? createTimeEntryFormDefaults.stoppedAt,
  };
}

export function getUpdateTimeEntryFormDefaults({
  initialRange,
  timeEntry,
}: {
  initialRange?: TimeRange;
  timeEntry: TimeEntryViewRow;
}): TimeEntryFormValues {
  return {
    startedAt: initialRange?.startedAt ?? timeEntry.startedAt,
    stoppedAt: initialRange?.stoppedAt ?? timeEntry.stoppedAt,
    projectId: timeEntry.projectId,
    taskId: timeEntry.taskId,
    notes: timeEntry.notes,
  };
}

export function getCreateTimeEntryPreview(
  values: TimeEntryFormValues
): EditingPreview {
  return {
    startedAt: values.startedAt,
    stoppedAt: values.stoppedAt,
    projectId: values.projectId || null,
    replacingTimeEntryId: null,
  };
}

export function getUpdateTimeEntryPreview({
  timeEntryId,
  values,
}: {
  timeEntryId: TimeEntryId;
  values: TimeEntryFormValues;
}): EditingPreview {
  return {
    startedAt: values.startedAt,
    stoppedAt: values.stoppedAt,
    projectId: values.projectId,
    replacingTimeEntryId: timeEntryId,
  };
}
