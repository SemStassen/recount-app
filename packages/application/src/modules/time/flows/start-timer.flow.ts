import type {
  StartTimerCommand,
  StartTimerResult,
} from "@recount/core/contracts";
import { TimeModule } from "@recount/core/modules/time";
import { Effect } from "effect";

import { ApplicationContext } from "#shared/application-context";

export const startTimerFlow = Effect.fn("flows.startTimerFlow")(function* (
  request: typeof StartTimerCommand.Type
) {
  const appContext = yield* ApplicationContext;
  const timeModule = yield* TimeModule;

  const { workspaceMember, workspace } = yield* appContext.authorizedWorkspace(
    "time:create_time_entry"
  );

  const timer = yield* timeModule.startTimer({
    workspaceId: workspace.id,
    workspaceMemberId: workspaceMember.id,
    data: request,
  });

  return timer satisfies typeof StartTimerResult.Type;
});
