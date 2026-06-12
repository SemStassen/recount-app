import { useDraggable, useDroppable, useDragDropMonitor } from "@dnd-kit/react";
import { useAtomSet } from "@effect/atom-react";
import { cn } from "@recount/ui/utils";
import { useRef, useState } from "react";

import { getDraggedTimeEntry } from "../dnd/adapter";
import { GRID_DROPPABLE_ID, SELECTION_DRAGGABLE_ID } from "../dnd/types";
import {
  closeTimeEntryEditor,
  openUpdateTimeEntryEditor,
} from "../state/atoms";
import type { EditingPreview } from "../state/atoms";
import type { TimeRange } from "../state/time-range";
import { useDragSelection } from "../state/use-drag-selection";
import { CurrentTimeLine } from "./current-time-line";
import { DayColumn } from "./day-column";
import {
  getDropPreviewKey,
  getMovedTimeEntryPreview,
  getPointFromEvent,
  getRangeKey,
  getSelectionRange,
} from "./grid-interactions";
import type { Point } from "./grid-interactions";
import type { Slot } from "./layout";
import { getSlotFromPoint } from "./layout";
import { TimeEntryDragOverlay } from "./time-entry-drag-overlay";

import styles from "./grid.module.css";

interface GridGeometry {
  left: number;
  top: number;
  width: number;
  height: number;
}

interface CalendarTimeEntry extends TimeRange {
  id: string;
  project: null | {
    name: string;
    color: string;
  };
}

interface GridProps {
  currentTime: Date;
  preview: EditingPreview;
  projects: Array<{ id: string; name: string; color: string }>;
  showCurrentTimeLine: boolean;
  timeEntries: Array<CalendarTimeEntry>;
  weekdays: Array<Date>;
}

function getScrollViewport(element: HTMLElement) {
  return element.closest<HTMLElement>("[data-slot='scroll-area-viewport']");
}

function getPointFromDraggedTop(
  event: Pick<
    Parameters<
      NonNullable<Parameters<typeof useDragDropMonitor>[0]["onDragEnd"]>
    >[0],
    "nativeEvent" | "operation"
  >
): Point | null {
  const rect = event.operation.shape?.current.boundingRectangle;

  if (!rect) {
    return getPointFromEvent(event.nativeEvent);
  }

  return { clientX: rect.left + rect.width / 2, clientY: rect.top };
}

function getPointFromDraggedTopAtPointerX(
  event: Pick<
    Parameters<
      NonNullable<Parameters<typeof useDragDropMonitor>[0]["onDragEnd"]>
    >[0],
    "nativeEvent" | "operation"
  >
): Point | null {
  const draggedTop = getPointFromDraggedTop(event);
  const pointer = getPointFromEvent(event.nativeEvent);

  if (!draggedTop) {
    return pointer;
  }

  return {
    clientX: pointer?.clientX ?? draggedTop.clientX,
    clientY: draggedTop.clientY,
  };
}

export function Grid({
  currentTime,
  preview,
  projects,
  showCurrentTimeLine,
  timeEntries,
  weekdays,
}: GridProps) {
  const gridRef = useRef<HTMLDivElement | null>(null);
  const firstSlotRef = useRef<Slot | null>(null);
  const geometryRef = useRef<GridGeometry | null>(null);
  const lastSelectionKeyRef = useRef<string | null>(null);
  const lastTimeEntryDropPreviewKeyRef = useRef<string | null>(null);
  const pendingClickSlotRef = useRef<Slot | null>(null);
  const [timeEntryDropPreview, setTimeEntryDropPreview] =
    useState<CalendarTimeEntry | null>(null);
  const closeEditor = useAtomSet(closeTimeEntryEditor);
  const openUpdateEditor = useAtomSet(openUpdateTimeEntryEditor);
  const { ref: draggableRef } = useDraggable({
    id: SELECTION_DRAGGABLE_ID,
    data: { kind: "calendar-selection" },
  });
  const { ref: droppableRef } = useDroppable({
    id: GRID_DROPPABLE_ID,
  });
  const {
    cancelDragSelection,
    commitDragSelection,
    startDragSelection,
    updateDragSelection,
  } = useDragSelection();

  const setGridRef = (element: HTMLDivElement | null) => {
    gridRef.current = element;
    draggableRef(element);
    droppableRef(element);
  };

  const measureGeometry = () => {
    const grid = gridRef.current;
    const viewport = grid ? getScrollViewport(grid) : null;

    if (!grid || !viewport) {
      return null;
    }

    const gridRect = grid.getBoundingClientRect();
    const viewportRect = viewport.getBoundingClientRect();

    return {
      left: gridRect.left,
      top: viewportRect.top,
      width: gridRect.width,
      height: gridRect.height,
    };
  };

  const getSlot = (point: Point) => {
    const grid = gridRef.current;
    const viewport = grid ? getScrollViewport(grid) : null;
    const geometry = geometryRef.current ?? measureGeometry();

    if (!viewport || !geometry) {
      return null;
    }

    return getSlotFromPoint({
      point,
      gridRect: geometry,
      scrollTop: viewport.scrollTop,
      visibleDays: weekdays,
    });
  };

  const updateSelectionFromPoint = (point: Point) => {
    const firstSlot = firstSlotRef.current;
    const currentSlot = getSlot(point);

    if (!firstSlot || !currentSlot) {
      return;
    }

    const range = getSelectionRange(firstSlot, currentSlot);

    if (!range) {
      return;
    }

    const selectionKey = getRangeKey(range);

    if (selectionKey === lastSelectionKeyRef.current) {
      return;
    }

    lastSelectionKeyRef.current = selectionKey;
    updateDragSelection(range);
  };

  const getDraggedTimeEntryDropPreview = (
    event: Parameters<
      NonNullable<Parameters<typeof useDragDropMonitor>[0]["onDragMove"]>
    >[0]
  ) => {
    const draggedTimeEntry = getDraggedTimeEntry(event.operation.source);
    const point = getPointFromDraggedTopAtPointerX(event);

    if (!draggedTimeEntry || !point) {
      return null;
    }

    return getMovedTimeEntryPreview({
      slot: getSlot(point),
      timeEntryId: draggedTimeEntry.timeEntryId,
      timeRange: draggedTimeEntry.timeRange,
    });
  };

  const updateTimeEntryDropPreview = (
    event: Parameters<
      NonNullable<Parameters<typeof useDragDropMonitor>[0]["onDragMove"]>
    >[0]
  ) => {
    const dropPreview = getDraggedTimeEntryDropPreview(event);
    const dropPreviewKey = getDropPreviewKey(dropPreview);

    if (dropPreviewKey === lastTimeEntryDropPreviewKeyRef.current) {
      return;
    }

    lastTimeEntryDropPreviewKeyRef.current = dropPreviewKey;
    setTimeEntryDropPreview(dropPreview);
  };

  const resetSelectionDrag = () => {
    firstSlotRef.current = null;
    pendingClickSlotRef.current = null;
    geometryRef.current = null;
    lastSelectionKeyRef.current = null;
    lastTimeEntryDropPreviewKeyRef.current = null;
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest("[data-calendar-entry]")) {
      return;
    }

    const point = { clientX: event.clientX, clientY: event.clientY };
    geometryRef.current = measureGeometry();
    const slot = getSlot(point);

    if (slot) {
      pendingClickSlotRef.current = slot;
    }
  };

  const handlePointerUp = () => {
    if (!pendingClickSlotRef.current) {
      return;
    }

    closeEditor(undefined);
    resetSelectionDrag();
  };

  const handleDoubleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest("[data-calendar-entry]")) {
      return;
    }

    geometryRef.current = measureGeometry();
    const slot = getSlot({ clientX: event.clientX, clientY: event.clientY });

    if (!slot) {
      return;
    }

    const range = getSelectionRange(slot, slot);

    if (!range) {
      return;
    }

    startDragSelection(range);
    commitDragSelection();
    resetSelectionDrag();
  };

  const cancelSelection = () => {
    resetSelectionDrag();
    cancelDragSelection();
  };

  useDragDropMonitor({
    onDragStart(event) {
      const { source } = event.operation;

      if (source?.data.kind !== "calendar-selection") {
        return;
      }

      const point = getPointFromEvent(event.nativeEvent);
      const firstSlot = point ? getSlot(point) : pendingClickSlotRef.current;

      if (!firstSlot) {
        return;
      }

      pendingClickSlotRef.current = null;
      firstSlotRef.current = firstSlot;
      const range = getSelectionRange(firstSlot, firstSlot);

      if (!range) {
        return;
      }

      lastSelectionKeyRef.current = getRangeKey(range);
      startDragSelection(range);
    },
    onDragMove(event) {
      if (event.operation.source?.data.kind !== "calendar-selection") {
        if (event.operation.source?.data.kind === "time-entry") {
          updateTimeEntryDropPreview(event);
        }
        return;
      }

      const { current } = event.operation.position;
      updateSelectionFromPoint({ clientX: current.x, clientY: current.y });
    },
    onDragEnd(event) {
      if (event.operation.source?.data.kind === "calendar-selection") {
        if (event.canceled) {
          cancelSelection();
          return;
        }

        const { current } = event.operation.position;
        updateSelectionFromPoint({ clientX: current.x, clientY: current.y });
        commitDragSelection();
        resetSelectionDrag();
        return;
      }

      if (event.operation.source?.data.kind !== "time-entry") {
        return;
      }

      const point = getPointFromDraggedTopAtPointerX(event);
      setTimeEntryDropPreview(null);
      lastTimeEntryDropPreviewKeyRef.current = null;

      if (event.canceled || !point) {
        return;
      }

      const draggedTimeEntry = getDraggedTimeEntry(event.operation.source);
      const slot = getSlot(point);

      if (!draggedTimeEntry || !slot) {
        return;
      }

      const movedTimeEntry = getMovedTimeEntryPreview({
        slot,
        timeEntryId: draggedTimeEntry.timeEntryId,
        timeRange: draggedTimeEntry.timeRange,
      });

      if (!movedTimeEntry) {
        return;
      }

      openUpdateEditor({
        timeEntryId: draggedTimeEntry.timeEntryId,
        initialRange: movedTimeEntry,
      });
    },
  });

  return (
    <div
      className={cn("relative grid w-full touch-none select-none", styles.grid)}
      onDoubleClick={handleDoubleClick}
      onPointerCancel={cancelSelection}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      ref={setGridRef}
      style={
        {
          "--calendar-days-in-view": weekdays.length,
          gridTemplateColumns: `repeat(${weekdays.length}, 1fr)`,
        } as React.CSSProperties
      }
    >
      {weekdays.map((day) => (
        <DayColumn
          currentTime={currentTime}
          day={day}
          key={day.toString()}
          preview={preview}
          projects={projects}
          timeEntryDropPreview={timeEntryDropPreview}
          timeEntries={timeEntries}
        />
      ))}
      {showCurrentTimeLine ? <CurrentTimeLine /> : null}
      <TimeEntryDragOverlay />
    </div>
  );
}
