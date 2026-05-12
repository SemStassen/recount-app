import { useDraggable, useDragOperation } from "@dnd-kit/react";
import { cn } from "@recount/ui/utils";

import type { TimeEntryDragData } from "./types";

type DraggableTimeEntryProps = {
  id: string;
  timeRange: TimeEntryDragData["timeRange"];
  children: React.ReactNode;
};

export function DraggableTimeEntry({
  children,
  id,
  timeRange,
}: DraggableTimeEntryProps) {
  const operation = useDragOperation();
  const { ref } = useDraggable({
    id: id,
    data: {
      kind: "time-entry",
      timeRange,
    } satisfies TimeEntryDragData,
  });
  const isDragging = operation?.source?.id === id;

  return (
    <div
      className={cn("h-full transition-opacity", isDragging && "opacity-35")}
      ref={ref}
    >
      {children}
    </div>
  );
}
