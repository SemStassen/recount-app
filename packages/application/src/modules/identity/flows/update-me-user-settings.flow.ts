import { IdentityModule } from "@recount/core/modules/identity";
import type {
  UpdateMeUserSettingsCommand,
  UpdateMeUserSettingsResult,
} from "@recount/core/modules/identity/api";
import { Effect } from "effect";

import { ApplicationContext } from "#shared/application-context";

export const updateMeUserSettingsFlow = Effect.fn("flows.updateMeUserSettings")(
  function* (params: typeof UpdateMeUserSettingsCommand.Type) {
    const appContext = yield* ApplicationContext;
    const { user } = yield* appContext.session();

    const identityModule = yield* IdentityModule;

    const updatedUserSettings = yield* identityModule.updateUserSettings({
      userId: user.id,
      data: params,
    });

    return updatedUserSettings satisfies typeof UpdateMeUserSettingsResult.Type;
  }
);
