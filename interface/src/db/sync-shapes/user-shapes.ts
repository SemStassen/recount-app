import { UserSettings } from "@recount/core/modules/identity";
import { Schema, Struct } from "effect";

import { defineShape } from "./define-shape";

export const userShapes = {
  userSettings: defineShape({
    name: "current-user-settings",
    routePath: "/me/user-settings",
    schema: Schema.toStandardSchemaV1(UserSettings.json),
    getKey: (userSettings) => userSettings.id,
    decodeRow: (row) =>
      Schema.decodeUnknownSync(
        UserSettings.json.mapFields(Struct.map(Schema.optionalKey))
      )(row),
  }),
};
