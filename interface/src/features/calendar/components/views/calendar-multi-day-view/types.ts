export type CalendarTimeEntry = {
  id: string;
  startedAt: Date;
  stoppedAt: Date;
  project: null | {
    name: string;
    color: string;
  };
};
