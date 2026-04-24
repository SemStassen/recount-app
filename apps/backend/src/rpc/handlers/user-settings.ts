import { updateMeUserSettingsFlow } from "@recount/application/modules/identity";
import { UserSettingsRpcGroup } from "@recount/core/rpc";
import { Effect } from "effect";
import { HttpApiError } from "effect/unstable/httpapi";

export const UserSettingsRpcGroupLayer = UserSettingsRpcGroup.toLayer(
  Effect.succeed({
    "UserSettings.UpdateMe": Effect.fn("rpc.userSettings.updateMe")(
      function* (payload) {
        const userSettings = yield* updateMeUserSettingsFlow(payload);

        return userSettings;
      },
      Effect.catchTags({
        RepositoryError: () =>
          Effect.fail(new HttpApiError.InternalServerError()),
      })
    ),
  })
);
