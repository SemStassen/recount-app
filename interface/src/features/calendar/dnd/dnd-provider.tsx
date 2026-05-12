import {
  Accessibility,
  AutoScroller,
  Cursor,
  Feedback,
  KeyboardSensor,
  PointerSensor,
  PreventSelection,
} from "@dnd-kit/dom";
import { DragDropProvider } from "@dnd-kit/react";
import type { PropsWithChildren } from "react";

export function DndProvider({ children }: PropsWithChildren) {
  return (
    <DragDropProvider
      modifiers={[]}
      plugins={[
        Accessibility,
        AutoScroller.configure({
          threshold: { x: 0, y: 0.16 },
          acceleration: 18,
        }),
        Cursor,
        Feedback.configure({
          feedback: (source) =>
            source.data.kind === "calendar-selection" ? "none" : "default",
        }),
        PreventSelection,
      ]}
      sensors={[PointerSensor, KeyboardSensor]}
    >
      {children}
    </DragDropProvider>
  );
}
