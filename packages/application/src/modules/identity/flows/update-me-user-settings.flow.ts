import type {
  UpdateMeUserSettingsCommand,
  UpdateMeUserSettingsResult,
} from "@recount/core/contracts";
import { IdentityModule } from "@recount/core/modules/identity";
import { SessionContext } from "@recount/core/shared/auth";
import { Effect } from "effect";

export const updateMeUserSettingsFlow = Effect.fn("flows.updateMeUserSettings")(
  function* (params: typeof UpdateMeUserSettingsCommand.Type) {
    const { user } = yield* SessionContext;

    const identityModule = yield* IdentityModule;

    const updatedUserSettings = yield* identityModule.updateUserSettings({
      userId: user.id,
      data: params,
    });

    return updatedUserSettings satisfies typeof UpdateMeUserSettingsResult.Type;
  }
);
