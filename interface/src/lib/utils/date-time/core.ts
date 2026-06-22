import { format } from "date-fns";

const DATE_FORMATS = {
  "MM/DD/YYYY": "MM/dd/yyyy",
  "DD/MM/YYYY": "dd/MM/yyyy",
  "YYYY-MM-DD": "yyyy-MM-dd",
} as const;

const TIME_FORMATS = {
  "12h": "h:mm a",
  "24h": "HH:mm",
} as const;

const DEFAULT_DATE_FORMAT: DateFormat = "DD/MM/YYYY";
const DEFAULT_TIME_FORMAT: TimeFormat = "24h";
const DEFAULT_TIME_ZONE = "UTC";

export type DateFormat = keyof typeof DATE_FORMATS;
export type TimeFormat = keyof typeof TIME_FORMATS;
export type TimeZone = string;

export interface DateTimeSettings {
  dateFormat: DateFormat;
  timeFormat: TimeFormat;
  timeZone: TimeZone;
}

export interface DateTimeSettingsInput {
  dateFormat?: string;
  timeFormat?: string;
  timeZone?: string | null;
}

export function parseTimeZone(value: string): TimeZone | null {
  try {
    Intl.DateTimeFormat("en", { timeZone: value }).resolvedOptions();
    return value;
  } catch {
    return null;
  }
}

export function getDefaultTimeZone(): TimeZone {
  const utc = parseTimeZone(DEFAULT_TIME_ZONE);

  if (utc) {
    return utc;
  }

  throw new Error("Intl runtime does not support UTC time zone");
}

export function normalizeDateTimeSettings(
  userSettings?: DateTimeSettingsInput | null
): DateTimeSettings {
  const dateFormat = userSettings?.dateFormat;
  const timeFormat = userSettings?.timeFormat;
  const timeZone = userSettings?.timeZone;

  return {
    dateFormat:
      dateFormat !== undefined && dateFormat in DATE_FORMATS
        ? (dateFormat as DateFormat)
        : DEFAULT_DATE_FORMAT,
    timeFormat:
      timeFormat !== undefined && timeFormat in TIME_FORMATS
        ? (timeFormat as TimeFormat)
        : DEFAULT_TIME_FORMAT,
    timeZone:
      typeof timeZone === "string"
        ? (parseTimeZone(timeZone) ?? getDefaultTimeZone())
        : getDefaultTimeZone(),
  };
}

export type DateTimeFormatter = ReturnType<typeof createDateTimeFormatter>;

export function createDateTimeFormatter(input?: DateTimeSettingsInput | null) {
  const settings = normalizeDateTimeSettings(input);

  return {
    settings,
    time: (date: Date): string =>
      format(date, TIME_FORMATS[settings.timeFormat]),
    date: (date: Date): string =>
      format(date, DATE_FORMATS[settings.dateFormat]),
    dateTime: (date: Date): string =>
      format(
        date,
        `${DATE_FORMATS[settings.dateFormat]}, ${TIME_FORMATS[settings.timeFormat]}`
      ),
    monthYear: (date: Date): string => format(date, "MMM yyyy"),
    day: (date: Date): string => format(date, "d"),
    weekday: (date: Date): string => format(date, "EEEE"),
    weekdayShort: (date: Date): string => format(date, "EEE"),
  };
}
