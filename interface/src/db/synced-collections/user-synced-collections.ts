import { UserSettings } from "@recount/core/modules/identity";
import { Schema, Struct } from "effect";

import { defineSyncedCollection } from "./define-synced-collection";

const optionalFields = Struct.map(Schema.optionalKey);

export const userSyncedCollections = {
  userSettings: defineSyncedCollection({
    decodeElectricRow: Schema.decodeUnknownSync(
      UserSettings.json.mapFields(optionalFields)
    ),
    getKey: (userSettings) => userSettings.id,
    name: "current-user-settings",
    routePath: "/me/user-settings",
    schema: Schema.toStandardSchemaV1(UserSettings.json),
  }),
};
