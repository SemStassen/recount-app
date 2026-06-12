import { TimeModule } from "@recount/core/modules/time";
import type {
  UpdateTimeEntryCommand,
  UpdateTimeEntryResult,
} from "@recount/core/modules/time/api";
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
      id: request.id,
      workspaceId: workspace.id,
      data: request.data,
    });

    return updatedTimeEntry satisfies typeof UpdateTimeEntryResult.Type;
  }
);
