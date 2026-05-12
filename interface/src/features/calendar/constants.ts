export const CALENDAR_HEADER_HEIGHT_VAR = "--calendar-header-height";
export const CALENDAR_DAY_HEADER_HEIGHT_VAR = "--calendar-day-header-height";
export const CALENDAR_HOUR_COLUMN_WIDTH_VAR = "--calendar-hour-column-width";
export const CALENDAR_HOUR_HEIGHT_VAR = "--calendar-hour-height";

export const FIRST_VISIBLE_HOUR = 0;
export const LAST_VISIBLE_HOUR = 24;
export const CALENDAR_SLOT_DURATION_MINUTES = 15;
export const CALENDAR_WEEK_STARTS_ON = 1;

if (60 % CALENDAR_SLOT_DURATION_MINUTES !== 0) {
  throw new Error("Calendar slot duration must divide evenly into an hour.");
}
