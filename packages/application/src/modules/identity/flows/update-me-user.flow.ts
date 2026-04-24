import type {
  UpdateMeUserCommand,
  UpdateMeUserResult,
} from "@recount/core/contracts";
import { IdentityModule } from "@recount/core/modules/identity";
import { SessionContext } from "@recount/core/shared/auth";
import { Effect } from "effect";

export const updateMeUserFlow = Effect.fn("flows.updateMeUser")(function* (
  params: typeof UpdateMeUserCommand.Type
) {
  const { user } = yield* SessionContext;

  const identityModule = yield* IdentityModule;

  const updatedUser = yield* identityModule.updateUser({
    userId: user.id,
    data: params,
  });

  return updatedUser satisfies typeof UpdateMeUserResult.Type;
});
