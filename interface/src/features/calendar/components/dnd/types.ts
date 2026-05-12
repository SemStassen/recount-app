export const CALENDAR_GRID_DROPPABLE_ID = "calendar-grid";
export const CALENDAR_SELECTION_DRAGGABLE_ID = "calendar-selection";

export type TimeEntryDragData = {
  kind: "time-entry";
  timeRange: {
    startedAt: Date;
    stoppedAt: Date;
    project: null | {
      name: string;
      color: string;
    };
  };
};

export function isTimeEntryDragData(data: unknown): data is TimeEntryDragData {
  return (
    typeof data === "object" &&
    data !== null &&
    "kind" in data &&
    data.kind === "time-entry" &&
    "timeRange" in data
  );
}
