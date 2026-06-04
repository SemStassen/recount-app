import { Schema } from "effect";

import { Timer, TimeEntry } from "#modules/time/index";

export const CreateTimeEntryCommand = TimeEntry.jsonCreate;
export const CreateTimeEntryResult = TimeEntry.json;

export const StartTimerCommand = Timer.jsonCreate;
export const StartTimerResult = Timer.json;

export const UpdateTimerCommand = Timer.jsonUpdate;
export const UpdateTimerResult = Timer.json;

export const StopTimerCommand = Schema.Void;
export const StopTimerResult = TimeEntry.json;

export const UpdateTimeEntryCommand = Schema.Struct({
  timeEntryId: TimeEntry.fields.id,
  data: TimeEntry.jsonUpdate,
});
export const UpdateTimeEntryResult = TimeEntry.json;

export const DeleteTimeEntryCommand = Schema.Struct({
  timeEntryId: TimeEntry.fields.id,
});
export const DeleteTimeEntryResult = Schema.Void;
