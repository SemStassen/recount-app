import type {
  StartRunningTimeEntryCommand,
  StartRunningTimeEntryResult,
} from "@recount/core/contracts";
import { TimeModule } from "@recount/core/modules/time";
import { Effect } from "effect";

import { ApplicationContext } from "#shared/application-context";

export const startRunningTimeEntryFlow = Effect.fn(
  "flows.startRunningTimeEntryFlow"
)(function* (request: typeof StartRunningTimeEntryCommand.Type) {
  const appContext = yield* ApplicationContext;
  const timeModule = yield* TimeModule;

  const { workspaceMember, workspace } = yield* appContext.authorizedWorkspace(
    "time:create_time_entry"
  );

  const runningTimeEntry = yield* timeModule.startRunningTimeEntry({
    workspaceId: workspace.id,
    workspaceMemberId: workspaceMember.id,
    data: request,
  });

  return runningTimeEntry satisfies typeof StartRunningTimeEntryResult.Type;
});
