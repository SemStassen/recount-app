import { TimeModule } from "@recount/core/modules/time";
import type {
  UpdateTimerCommand,
  UpdateTimerResult,
} from "@recount/core/modules/time/api";
import { Effect } from "effect";

import { ApplicationContext } from "#shared/application-context";

export const updateTimerFlow = Effect.fn("flows.updateTimerFlow")(function* (
  request: typeof UpdateTimerCommand.Type
) {
  const appContext = yield* ApplicationContext;
  const timeModule = yield* TimeModule;

  const { workspaceMember, workspace } = yield* appContext.authorizedWorkspace(
    "time:update_time_entry"
  );

  const timer = yield* timeModule.updateTimer({
    workspaceId: workspace.id,
    workspaceMemberId: workspaceMember.id,
    data: request,
  });

  return timer satisfies typeof UpdateTimerResult.Type;
});
