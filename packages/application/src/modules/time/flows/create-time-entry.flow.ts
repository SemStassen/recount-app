import type {
  CreateTimeEntryCommand,
  CreateTimeEntryResult,
} from "@recount/core/contracts";
import { TimeModule } from "@recount/core/modules/time";
import { Effect } from "effect";

import { ApplicationContext } from "#shared/application-context";

export const createTimeEntryFlow = Effect.fn("flows.createTimeEntryFlow")(
  function* (request: typeof CreateTimeEntryCommand.Type) {
    const appContext = yield* ApplicationContext;
    const timeModule = yield* TimeModule;

    const { workspaceMember, workspace } =
      yield* appContext.authorizedWorkspace("time:create_time_entry");

    const [createdTimeEntry] = yield* timeModule.createTimeEntries({
      workspaceId: workspace.id,
      workspaceMemberId: workspaceMember.id,
      data: [request],
    });

    return createdTimeEntry satisfies typeof CreateTimeEntryResult.Type;
  }
);
