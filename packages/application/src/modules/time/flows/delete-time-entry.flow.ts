import { TimeModule } from "@recount/core/modules/time";
import type {
  DeleteTimeEntryCommand,
  DeleteTimeEntryResult,
} from "@recount/core/modules/time/api";
import { Effect } from "effect";

import { ApplicationContext } from "#shared/application-context";

export const deleteTimeEntryFlow = Effect.fn("flows.deleteTimeEntryFlow")(
  function* (request: typeof DeleteTimeEntryCommand.Type) {
    const appContext = yield* ApplicationContext;
    const timeModule = yield* TimeModule;

    const { workspace } = yield* appContext.authorizedWorkspace(
      "time:delete_time_entry"
    );

    yield* timeModule.hardDeleteTimeEntries({
      workspaceId: workspace.id,
      ids: [request.id],
    });

    return undefined satisfies typeof DeleteTimeEntryResult.Type;
  }
);
