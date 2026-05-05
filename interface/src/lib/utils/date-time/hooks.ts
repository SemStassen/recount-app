import { useLiveQuery } from "@tanstack/react-db";

import { useUserDb } from "~/db/user/context";

import { createDateTimeFormatter } from "./core";
import type { DateTimeFormatter } from "./core";

export function useDateTimeFormatter(): DateTimeFormatter {
  const userDb = useUserDb();
  const { data: userSettings } = useLiveQuery((q) =>
    q.from({ us: userDb.collections.userSettingsCollection }).findOne()
  );

  return createDateTimeFormatter({
    dateFormat: userSettings?.dateFormat,
    timeFormat: userSettings?.timeFormat,
  });
}
