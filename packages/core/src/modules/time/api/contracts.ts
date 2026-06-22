import { Schema } from "effect";

import { Timer, TimeEntry } from "../index";

export const CreateTimeEntryRpcCommand = TimeEntry.jsonCreate.mapFields(
  (fields) => ({
    ...fields,
    id: Schema.requiredKey(fields.id),
  })
);
export const CreateTimeEntryResult = TimeEntry.json;

export const StartTimerRpcCommand = Timer.jsonCreate.mapFields((fields) => ({
  ...fields,
  id: Schema.requiredKey(fields.id),
}));
export const StartTimerResult = Timer.json;

export const UpdateTimerCommand = Timer.jsonUpdate;
export const UpdateTimerResult = Timer.json;

export const StopTimerCommand = Schema.Struct({
  stoppedAt: Schema.optionalKey(Schema.DateTimeUtcFromDate),
});
export const StopTimerResult = TimeEntry.json;

export const UpdateTimeEntryCommand = Schema.Struct({
  id: TimeEntry.fields.id,
  data: TimeEntry.jsonUpdate,
});
export const UpdateTimeEntryResult = TimeEntry.json;

export const DeleteTimeEntryCommand = Schema.Struct({
  id: TimeEntry.fields.id,
});
export const DeleteTimeEntryResult = Schema.Void;
