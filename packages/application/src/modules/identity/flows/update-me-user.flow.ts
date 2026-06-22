import { IdentityModule } from "@recount/core/modules/identity";
import type {
  UpdateMeUserCommand,
  UpdateMeUserResult,
} from "@recount/core/modules/identity/api";
import { Effect } from "effect";

import { ApplicationContext } from "#shared/application-context";

export const updateMeUserFlow = Effect.fn("flows.updateMeUser")(function* (
  params: typeof UpdateMeUserCommand.Type
) {
  const appContext = yield* ApplicationContext;
  const { user } = yield* appContext.session();

  const identityModule = yield* IdentityModule;

  const updatedUser = yield* identityModule.updateUser({
    userId: user.id,
    data: params,
  });

  return updatedUser satisfies typeof UpdateMeUserResult.Type;
});
