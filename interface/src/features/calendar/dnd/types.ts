export const GRID_DROPPABLE_ID = "calendar-grid";
export const SELECTION_DRAGGABLE_ID = "calendar-selection";

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
