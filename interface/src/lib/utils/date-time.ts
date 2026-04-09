import { format } from "date-fns";

import { useUserLiveQuery } from "~/db/user-collections";

const DATE_FORMATS = {
  "MM/DD/YYYY": "MM/dd/yyyy",
  "DD/MM/YYYY": "dd/MM/yyyy",
  "YYYY-MM-DD": "yyyy-MM-dd",
} as const;

const TIME_FORMATS = {
  "12h": "h:mm a",
  "24h": "HH:mm",
} as const;

const DEFAULT_TIME_ZONE: string | null = null;
const DEFAULT_DATE_FORMAT: DateFormat = "DD/MM/YYYY";
const DEFAULT_TIME_FORMAT: TimeFormat = "24h";

export type DateFormat = keyof typeof DATE_FORMATS;
export type TimeFormat = keyof typeof TIME_FORMATS;

export type DateTimeSettings = {
  dateFormat: DateFormat;
  timeFormat: TimeFormat;
  timeZone: string | null;
};

type DateTimeSettingsInput = {
  dateFormat?: string;
  timeFormat?: string;
};

function normalizeDateTimeSettings(
  userSettings?: DateTimeSettingsInput | null
): DateTimeSettings {
  const dateFormat = userSettings?.dateFormat;
  const timeFormat = userSettings?.timeFormat;

  return {
    dateFormat:
      dateFormat !== undefined && dateFormat in DATE_FORMATS
        ? (dateFormat as DateFormat)
        : DEFAULT_DATE_FORMAT,
    timeFormat:
      timeFormat !== undefined && timeFormat in TIME_FORMATS
        ? (timeFormat as TimeFormat)
        : DEFAULT_TIME_FORMAT,
    timeZone: DEFAULT_TIME_ZONE,
  };
}

export type DateTimeFormatter = ReturnType<typeof createDateTimeFormatter>;

export function createDateTimeFormatter(
  input?: DateTimeSettingsInput | null
) {
  const settings = normalizeDateTimeSettings(input);

  return {
    time: (date: Date): string => format(date, TIME_FORMATS[settings.timeFormat]),
    date: (date: Date): string => format(date, DATE_FORMATS[settings.dateFormat]),
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

export function useDateTimeFormatter(): DateTimeFormatter {
  const { data: userSettings } = useUserLiveQuery((q, collections) =>
    q.from({ userSettings: collections.userSettingsCollection }).findOne()
  );

  return createDateTimeFormatter({
    dateFormat: userSettings?.dateFormat,
    timeFormat: userSettings?.timeFormat,
  });
}
