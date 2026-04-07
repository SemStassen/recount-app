import { Schema } from "effect";

import { Model } from "#internal/effect/index";
import { UserId, UserSettingsId } from "#shared/schemas/index";

export class UserSettings extends Model.Class<UserSettings>("UserSettings")(
  {
    id: Model.ServerImmutable(UserSettingsId),
    userId: Model.ServerImmutable(UserId),
    // ⚠️ Changing will require a DB migration
    dateFormat: Model.ServerMutableClientMutable(
      Schema.Literals(["MM/DD/YYYY", "DD/MM/YYYY", "YYYY-MM-DD"])
    ),
    // ⚠️ Changing will require a DB migration
    timeFormat: Model.ServerMutableClientMutable(
      Schema.Literals(["12h", "24h"])
    ),
  },
  {
    identifier: "UserSettings",
    title: "User Settings",
    description: "A user's settings",
  }
) {}
