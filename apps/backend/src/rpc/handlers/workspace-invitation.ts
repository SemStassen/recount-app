import {
  acceptWorkspaceInvitationFlow,
  cancelWorkspaceInvitationFlow,
  createWorkspaceInvitationFlow,
  rejectWorkspaceInvitationFlow,
} from "@recount/application/modules/workspace-invitation";
import { WorkspaceInvitationRpcGroup } from "@recount/core/rpc";
import { Effect } from "effect";
import { HttpApiError } from "effect/unstable/httpapi";

export const WorkspaceInvitationRpcGroupLayer =
  WorkspaceInvitationRpcGroup.toLayer(
    Effect.succeed({
      "WorkspaceInvitation.Create": Effect.fn(
        "rpc.workspace-invitation.create"
      )(
        function* (payload) {
          const workspaceInvitation =
            yield* createWorkspaceInvitationFlow(payload);

          return workspaceInvitation;
        },
        Effect.catchTags({
          RepositoryError: () =>
            Effect.fail(new HttpApiError.InternalServerError()),
        })
      ),
      "WorkspaceInvitation.Cancel": (payload) =>
        Effect.gen(function* () {
          const workspaceInvitation =
            yield* cancelWorkspaceInvitationFlow(payload);

          return workspaceInvitation;
        }).pipe(
          Effect.catchTags({
            RepositoryError: () =>
              Effect.fail(new HttpApiError.InternalServerError()),
          })
        ),
      "WorkspaceInvitation.Accept": (payload) =>
        Effect.gen(function* () {
          const workspaceInvitation =
            yield* acceptWorkspaceInvitationFlow(payload);

          return workspaceInvitation;
        }).pipe(
          Effect.catchTags({
            RepositoryError: () =>
              Effect.fail(new HttpApiError.InternalServerError()),
            "db/DatabaseError": () =>
              Effect.fail(new HttpApiError.InternalServerError()),
          })
        ),

      "WorkspaceInvitation.Reject": (payload) =>
        Effect.gen(function* () {
          const workspaceInvitation =
            yield* rejectWorkspaceInvitationFlow(payload);

          return workspaceInvitation;
        }).pipe(
          Effect.catchTags({
            RepositoryError: () =>
              Effect.fail(new HttpApiError.InternalServerError()),
          })
        ),
    })
  );
