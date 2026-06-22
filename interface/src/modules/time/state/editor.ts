import type { TimeEntryId } from "@recount/core/shared/schemas";
import { Atom } from "effect/unstable/reactivity";

import type { TimeRange } from "../types";

type EditorState =
  | null
  | {
      mode: "create";
      initialRange: TimeRange | null;
    }
  | {
      mode: "update";
      timeEntryId: TimeEntryId;
      initialRange?: TimeRange;
    };

export type EditingPreview = null | {
  startedAt: Date;
  stoppedAt: Date | null;
  projectId: string | null;
  replacingTimeEntryId: TimeEntryId | null;
};

export const editorAtom = Atom.make<EditorState>(null);
export const editingPreviewAtom = Atom.make<EditingPreview>(null);

export const openCreateTimeEntryEditor = Atom.fnSync(
  (initialRange: TimeRange | null, context) => {
    context.set(editingPreviewAtom, null);
    context.set(editorAtom, { mode: "create", initialRange });
  }
);

export const openUpdateTimeEntryEditor = Atom.fnSync(
  (input: { timeEntryId: TimeEntryId; initialRange?: TimeRange }, context) => {
    context.set(editingPreviewAtom, null);
    context.set(editorAtom, {
      mode: "update",
      timeEntryId: input.timeEntryId,
      initialRange: input.initialRange,
    });
  }
);

export const closeTimeEntryEditor = Atom.fnSync((_: undefined, context) => {
  context.set(editorAtom, null);
  context.set(editingPreviewAtom, null);
});
