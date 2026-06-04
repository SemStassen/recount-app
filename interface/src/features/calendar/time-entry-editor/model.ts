import type { TimeEntryId } from "@recount/core/shared/schemas";
import { DateTime, Option } from "effect";

import type { EditingPreview } from "../state/atoms";
import type { TimeRange } from "../state/time-range";
import type { TimeEntryFormValues } from "./field-group";

type StoredTimeEntry = {
  id: TimeEntryId;
  startedAt: DateTime.DateTime;
  stoppedAt: DateTime.DateTime;
  projectId: string;
  taskId: Option.Option<string>;
  notes: Option.Option<unknown>;
};

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
  timeEntry: StoredTimeEntry;
}): TimeEntryFormValues {
  return {
    startedAt: initialRange?.startedAt ?? DateTime.toDate(timeEntry.startedAt),
    stoppedAt: initialRange?.stoppedAt ?? DateTime.toDate(timeEntry.stoppedAt),
    projectId: timeEntry.projectId,
    taskId: Option.getOrNull(timeEntry.taskId),
    notes: Option.getOrNull(timeEntry.notes),
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
