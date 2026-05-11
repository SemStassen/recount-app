import type { TimeEntryId } from "@recount/core/shared/schemas";

import { atomRegistry } from "~/atoms/registry";

import { calendarEditingPreviewAtom, calendarEditorAtom } from "./atoms";

type TimeRange = {
  startedAt: Date;
  stoppedAt: Date;
};

export function openCreateTimeEntryEditor(initialRange: TimeRange | null) {
  atomRegistry.set(calendarEditingPreviewAtom, null);
  atomRegistry.set(calendarEditorAtom, { mode: "create", initialRange });
}

export function openUpdateTimeEntryEditor(timeEntryId: TimeEntryId) {
  atomRegistry.set(calendarEditingPreviewAtom, null);
  atomRegistry.set(calendarEditorAtom, { mode: "update", timeEntryId });
}

export function closeTimeEntryEditor() {
  atomRegistry.set(calendarEditorAtom, null);
  atomRegistry.set(calendarEditingPreviewAtom, null);
}
