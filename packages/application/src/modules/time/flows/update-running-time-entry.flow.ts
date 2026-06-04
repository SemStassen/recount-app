import type {
  UpdateRunningTimeEntryCommand,
  UpdateRunningTimeEntryResult,
} from "@recount/core/contracts";
import { TimeModule } from "@recount/core/modules/time";
import { Effect } from "effect";

import { ApplicationContext } from "#shared/application-context";

export const updateRunningTimeEntryFlow = Effect.fn(
  "flows.updateRunningTimeEntryFlow"
)(function* (request: typeof UpdateRunningTimeEntryCommand.Type) {
  const appContext = yield* ApplicationContext;
  const timeModule = yield* TimeModule;

  const { workspaceMember, workspace } = yield* appContext.authorizedWorkspace(
    "time:update_time_entry"
  );

  const runningTimeEntry = yield* timeModule.updateRunningTimeEntry({
    workspaceId: workspace.id,
    workspaceMemberId: workspaceMember.id,
    data: request,
  });

  return runningTimeEntry satisfies typeof UpdateRunningTimeEntryResult.Type;
});
