import type {
  UpdateTimeEntryCommand,
  UpdateTimeEntryResult,
} from "@recount/core/contracts";
import { TimeModule } from "@recount/core/modules/time";
import { Effect } from "effect";

import { ApplicationContext } from "#shared/application-context";

export const updateTimeEntryFlow = Effect.fn("flows.updateTimeEntryFlow")(
  function* (request: typeof UpdateTimeEntryCommand.Type) {
    const appContext = yield* ApplicationContext;
    const timeModule = yield* TimeModule;

    const { workspace } = yield* appContext.authorizedWorkspace(
      "time:update_time_entry"
    );

    const updatedTimeEntry = yield* timeModule.updateTimeEntry({
      id: request.timeEntryId,
      workspaceId: workspace.id,
      data: request.data,
    });

    return updatedTimeEntry satisfies typeof UpdateTimeEntryResult.Type;
  }
);
