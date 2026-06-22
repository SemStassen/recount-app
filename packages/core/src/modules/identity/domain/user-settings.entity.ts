import { Schema } from "effect";

import { SharedModel } from "#internal/effect/index";
import { UserId, UserSettingsId } from "#shared/schemas/index";

export class UserSettings extends SharedModel.Class<UserSettings>(
  "UserSettings"
)(
  {
    id: SharedModel.ImmutableReadOnly(UserSettingsId),
    userId: SharedModel.ImmutableReadOnly(UserId),
    // ⚠️ Changing will require a DB migration
    dateFormat: SharedModel.MutableCreateUpdate(
      Schema.Literals(["MM/DD/YYYY", "DD/MM/YYYY", "YYYY-MM-DD"])
    ),
    // ⚠️ Changing will require a DB migration
    timeFormat: SharedModel.MutableCreateUpdate(
      Schema.Literals(["12h", "24h"])
    ),
  },
  {
    identifier: "UserSettings",
    title: "User Settings",
    description: "A user's settings",
  }
) {}
