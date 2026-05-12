export type TimeEntry = {
  id: string;
  startedAt: Date;
  stoppedAt: Date;
  project: {
    name: string;
    color: string;
  } | null;
};
