import { Result } from "effect";

import { UserSettingsId } from "#shared/schemas/ids";
import { generateUUID } from "#shared/utils/uuid";

import { UserSettings } from "./user-settings.entity";

export const createUserSettings = (
  userId: UserSettings["userId"]
): Result.Result<UserSettings, never> =>
  Result.succeed(
    UserSettings.makeUnsafe({
      id: UserSettingsId.makeUnsafe(generateUUID()),
      userId: userId,
      dateFormat: "DD/MM/YYYY",
      timeFormat: "24h",
    })
  );

export const updateUserSettings = (params: {
  userSettings: UserSettings;
  data: typeof UserSettings.jsonUpdate.Type;
}): Result.Result<
  { entity: UserSettings; changes: typeof UserSettings.update.Type },
  never
> =>
  Result.succeed({
    entity: UserSettings.makeUnsafe({ ...params.userSettings, ...params.data }),
    changes: params.data,
  });
