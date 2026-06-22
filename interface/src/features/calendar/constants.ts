export const HOUR_COLUMN_WIDTH_VAR = "--calendar-hour-column-width";
export const HOUR_HEIGHT_VAR = "--calendar-hour-height";

export const FIRST_VISIBLE_HOUR = 0;
export const LAST_VISIBLE_HOUR = 24;
export const SLOT_DURATION_MINUTES = 15;
export const WEEK_STARTS_ON = 1;

if (60 % SLOT_DURATION_MINUTES !== 0) {
  throw new Error("Calendar slot duration must divide evenly into an hour.");
}
