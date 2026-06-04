import type { StopRunningTimeEntryResult } from "@recount/core/contracts";
import { TimeModule } from "@recount/core/modules/time";
import { Effect } from "effect";

import { ApplicationContext } from "#shared/application-context";

export const stopRunningTimeEntryFlow = Effect.fn(
  "flows.stopRunningTimeEntryFlow"
)(function* () {
  const appContext = yield* ApplicationContext;
  const timeModule = yield* TimeModule;

  const { workspaceMember, workspace } = yield* appContext.authorizedWorkspace(
    "time:update_time_entry"
  );

  const stoppedTimeEntry = yield* timeModule.stopRunningTimeEntry({
    workspaceId: workspace.id,
    workspaceMemberId: workspaceMember.id,
  });

  return stoppedTimeEntry satisfies typeof StopRunningTimeEntryResult.Type;
});
