import { updateWorkspaceMemberFlow } from "@recount/application/modules/workspace-member";
import { WorkspaceMemberRpcGroup } from "@recount/core/rpc";
import { Effect } from "effect";
import { HttpApiError } from "effect/unstable/httpapi";

export const WorkspaceMemberRpcGroupLayer = WorkspaceMemberRpcGroup.toLayer(
  Effect.succeed({
    "WorkspaceMember.Update": Effect.fn("rpc.workspaceMember.update")(
      function* (payload) {
        const workspaceMember = yield* updateWorkspaceMemberFlow(payload);

        return workspaceMember;
      },
      Effect.catchTags({
        RepositoryError: () =>
          Effect.fail(new HttpApiError.InternalServerError()),
      })
    ),
  })
);
