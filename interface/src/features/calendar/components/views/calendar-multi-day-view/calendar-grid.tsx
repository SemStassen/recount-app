import { useDraggable, useDroppable, useDragDropMonitor } from "@dnd-kit/react";
import { useAtomSet } from "@effect/atom-react";
import type { TimeEntryId } from "@recount/core/shared/schemas";
import { cn } from "@recount/ui/utils";
import { useRef, useState } from "react";

import {
  closeTimeEntryEditor,
  type CalendarEditingPreview,
  openUpdateTimeEntryEditor,
} from "../../../atoms";
import { useCalendarDragSelection } from "../../../use-calendar-drag-selection";
import {
  CALENDAR_GRID_DROPPABLE_ID,
  CALENDAR_SELECTION_DRAGGABLE_ID,
  isTimeEntryDragData,
} from "../../dnd/types";
import { CurrentTimeLine } from "../current-time-line";
import { CalendarDragOverlay } from "./calendar-drag-overlay";
import { DayColumn } from "./day-column";
import {
  getCalendarRangeFromSlots,
  getCalendarSlotFromPoint,
  moveTimeRangeToSlot,
  type CalendarSlot,
} from "./layout";
import type { CalendarTimeEntry } from "./types";

import styles from "./calendar-grid.module.css";

type Point = { clientX: number; clientY: number };
type GridGeometry = {
  left: number;
  top: number;
  width: number;
  height: number;
};

type CalendarGridProps = {
  currentTime: Date;
  preview: CalendarEditingPreview;
  projects: Array<{ id: string; name: string; color: string }>;
  showCurrentTimeLine: boolean;
  timeEntries: Array<CalendarTimeEntry>;
  weekdays: Array<Date>;
};

function getScrollViewport(element: HTMLElement) {
  return element.closest<HTMLElement>("[data-slot='scroll-area-viewport']");
}

function getPointFromEvent(event: Event | undefined): Point | null {
  return event && "clientX" in event && "clientY" in event
    ? { clientX: Number(event.clientX), clientY: Number(event.clientY) }
    : null;
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

export function CalendarGrid({
  currentTime,
  preview,
  projects,
  showCurrentTimeLine,
  timeEntries,
  weekdays,
}: CalendarGridProps) {
  const gridRef = useRef<HTMLDivElement | null>(null);
  const firstSlotRef = useRef<CalendarSlot | null>(null);
  const geometryRef = useRef<GridGeometry | null>(null);
  const lastSelectionKeyRef = useRef<string | null>(null);
  const lastTimeEntryDropPreviewKeyRef = useRef<string | null>(null);
  const pendingClickSlotRef = useRef<CalendarSlot | null>(null);
  const [timeEntryDropPreview, setTimeEntryDropPreview] =
    useState<CalendarTimeEntry | null>(null);
  const closeEditor = useAtomSet(closeTimeEntryEditor);
  const openUpdateEditor = useAtomSet(openUpdateTimeEntryEditor);
  const { ref: draggableRef } = useDraggable({
    id: CALENDAR_SELECTION_DRAGGABLE_ID,
    data: { kind: "calendar-selection" },
  });
  const { ref: droppableRef } = useDroppable({
    id: CALENDAR_GRID_DROPPABLE_ID,
  });
  const {
    cancelDragSelection,
    commitDragSelection,
    startDragSelection,
    updateDragSelection,
  } = useCalendarDragSelection();

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

    return getCalendarSlotFromPoint({
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

    const range = getCalendarRangeFromSlots(firstSlot, currentSlot);
    const selectionKey = `${range.startedAt.getTime()}-${range.stoppedAt.getTime()}`;

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
    const source = event.operation.source;
    const point = getPointFromDraggedTopAtPointerX(event);

    if (!source?.id || !point || !isTimeEntryDragData(source.data)) {
      return null;
    }

    const slot = getSlot(point);

    if (!slot) {
      return null;
    }

    return {
      id: String(source.id),
      project: source.data.timeRange.project,
      ...moveTimeRangeToSlot(source.data.timeRange, slot),
    } satisfies CalendarTimeEntry;
  };

  const updateTimeEntryDropPreview = (
    event: Parameters<
      NonNullable<Parameters<typeof useDragDropMonitor>[0]["onDragMove"]>
    >[0]
  ) => {
    const dropPreview = getDraggedTimeEntryDropPreview(event);
    const dropPreviewKey = dropPreview
      ? `${dropPreview.id}-${dropPreview.startedAt.getTime()}-${dropPreview.stoppedAt.getTime()}`
      : null;

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

    closeEditor();
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

    const range = getCalendarRangeFromSlots(slot, slot);
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
      const source = event.operation.source;

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
      const range = getCalendarRangeFromSlots(firstSlot, firstSlot);
      lastSelectionKeyRef.current = `${range.startedAt.getTime()}-${range.stoppedAt.getTime()}`;
      startDragSelection(range);
    },
    onDragMove(event) {
      if (event.operation.source?.data.kind !== "calendar-selection") {
        if (event.operation.source?.data.kind === "time-entry") {
          updateTimeEntryDropPreview(event);
        }
        return;
      }

      const current = event.operation.position.current;
      updateSelectionFromPoint({ clientX: current.x, clientY: current.y });
    },
    onDragEnd(event) {
      if (event.operation.source?.data.kind === "calendar-selection") {
        if (event.canceled) {
          cancelSelection();
          return;
        }

        const current = event.operation.position.current;
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

      const source = event.operation.source;
      const slot = getSlot(point);

      if (!source?.id || !isTimeEntryDragData(source.data) || !slot) {
        return;
      }

      openUpdateEditor({
        timeEntryId: source.id as TimeEntryId,
        initialRange: moveTimeRangeToSlot(source.data.timeRange, slot),
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
      <CalendarDragOverlay />
    </div>
  );
}
