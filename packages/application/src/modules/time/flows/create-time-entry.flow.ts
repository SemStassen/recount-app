import type { TimeEntry } from "@recount/core/modules/time";
import { TimeModule } from "@recount/core/modules/time";
import type { CreateTimeEntryResult } from "@recount/core/modules/time/api";
import { Effect } from "effect";

import { ApplicationContext } from "#shared/application-context";

export const createTimeEntryFlow = Effect.fn("flows.createTimeEntryFlow")(
  function* (request: typeof TimeEntry.jsonCreate.Type) {
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
