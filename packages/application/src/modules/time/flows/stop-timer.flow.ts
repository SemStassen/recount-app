import type {
  StopTimerCommand,
  StopTimerResult,
} from "@recount/core/contracts";
import { TimeModule } from "@recount/core/modules/time";
import { Effect } from "effect";

import { ApplicationContext } from "#shared/application-context";

export const stopTimerFlow = Effect.fn("flows.stopTimerFlow")(function* (
  request: typeof StopTimerCommand.Type
) {
  const appContext = yield* ApplicationContext;
  const timeModule = yield* TimeModule;

  const { workspaceMember, workspace } = yield* appContext.authorizedWorkspace(
    "time:update_time_entry"
  );

  const timeEntry = yield* timeModule.stopTimer({
    workspaceId: workspace.id,
    workspaceMemberId: workspaceMember.id,
    data: request,
  });

  return timeEntry satisfies typeof StopTimerResult.Type;
});
