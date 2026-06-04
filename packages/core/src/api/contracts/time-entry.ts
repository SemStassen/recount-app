import { Schema } from "effect";

import { RunningTimeEntry, TimeEntry } from "#modules/time/index";

export const CreateTimeEntryCommand = TimeEntry.jsonCreate;
export const CreateTimeEntryResult = TimeEntry.json;

export const StartRunningTimeEntryCommand = RunningTimeEntry.jsonCreate;
export const StartRunningTimeEntryResult = RunningTimeEntry.json;

export const UpdateRunningTimeEntryCommand = RunningTimeEntry.jsonUpdate;
export const UpdateRunningTimeEntryResult = RunningTimeEntry.json;

export const StopRunningTimeEntryCommand = Schema.Void;
export const StopRunningTimeEntryResult = TimeEntry.json;

export const UpdateTimeEntryCommand = Schema.Struct({
  timeEntryId: TimeEntry.fields.id,
  data: TimeEntry.jsonUpdate,
});
export const UpdateTimeEntryResult = TimeEntry.json;

export const DeleteTimeEntryCommand = Schema.Struct({
  timeEntryId: TimeEntry.fields.id,
});
export const DeleteTimeEntryResult = Schema.Void;
