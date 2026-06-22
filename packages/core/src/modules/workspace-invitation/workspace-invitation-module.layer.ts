import { DateTime, Effect, Layer, Option } from "effect";

import type { WorkspaceInvitation } from "./domain/workspace-invitation.entity";
import * as workspaceInvitationTransitions from "./domain/workspace-invitation.transitions";
import { WorkspaceInvitationRepository } from "./persistence";
import {
  WorkspaceInvitationModule,
  WorkspaceInvitationNotFoundError,
} from "./workspace-invitation-module.service";

export const WorkspaceInvitationModuleLayer = Layer.effect(
  WorkspaceInvitationModule,
  Effect.gen(function* () {
    const workspaceInvitationRepo = yield* WorkspaceInvitationRepository;

    const findWorkspaceInvitationByInvitationId = (
      id: WorkspaceInvitation["id"]
    ) =>
      workspaceInvitationRepo.findByInvitationId(id).pipe(
        Effect.flatMap(
          Option.match({
            onNone: () =>
              Effect.fail(
                new WorkspaceInvitationNotFoundError({
                  workspaceInvitationId: id,
                })
              ),
            onSome: Effect.succeed,
          })
        )
      );

    return {
      createOrRenewPendingWorkspaceInvitation: Effect.fn(
        "workspace-invitation.createOrRenewPendingWorkspaceInvitation"
      )(function* (params) {
        const now = yield* DateTime.now;

        const maybeActivePendingWorkspaceInvitation =
          yield* workspaceInvitationRepo.findActivePendingByEmail({
            workspaceId: params.workspaceId,
            email: params.data.email,
          });

        if (Option.isSome(maybeActivePendingWorkspaceInvitation)) {
          const { changes, entity } = yield* Effect.fromResult(
            workspaceInvitationTransitions.renewWorkspaceInvitation({
              workspaceInvitation: maybeActivePendingWorkspaceInvitation.value,
              now,
            })
          ).pipe(
            Effect.catch(() =>
              Effect.die(
                "invariant violated: findActivePendingByEmail returned a non-pending or expired invitation"
              )
            )
          );

          const persistedWorkspaceInvitation =
            yield* workspaceInvitationRepo.update({
              id: entity.id,
              workspaceId: entity.workspaceId,
              update: changes,
            });

          return persistedWorkspaceInvitation;
        }

        const workspaceInvitation = yield* Effect.fromResult(
          workspaceInvitationTransitions.createWorkspaceInvitation({
            data: params.data,
            inviterId: params.inviterId,
            workspaceId: params.workspaceId,
            now,
          })
        );

        const persistedWorkspaceInvitation =
          yield* workspaceInvitationRepo.insert(workspaceInvitation);

        return persistedWorkspaceInvitation;
      }),
      cancelWorkspaceInvitation: Effect.fn(
        "workspace-invitation.cancelWorkspaceInvitation"
      )(function* (params) {
        const workspaceInvitation = yield* workspaceInvitationRepo
          .findById({
            workspaceId: params.workspaceId,
            id: params.id,
          })
          .pipe(
            Effect.flatMap(
              Option.match({
                onNone: () =>
                  Effect.fail(
                    new WorkspaceInvitationNotFoundError({
                      workspaceInvitationId: params.id,
                    })
                  ),
                onSome: Effect.succeed,
              })
            )
          );

        const now = yield* DateTime.now;
        const { changes, entity } = yield* Effect.fromResult(
          workspaceInvitationTransitions.cancelWorkspaceInvitation({
            workspaceInvitation,
            now,
          })
        );

        const persistedWorkspaceInvitation =
          yield* workspaceInvitationRepo.update({
            id: entity.id,
            workspaceId: entity.workspaceId,
            update: changes,
          });

        return persistedWorkspaceInvitation;
      }),
      acceptWorkspaceInvitation: Effect.fn(
        "workspace-invitation.acceptWorkspaceInvitation"
      )(function* (params) {
        const now = yield* DateTime.now;

        const workspaceInvitation =
          yield* findWorkspaceInvitationByInvitationId(params.id);

        const { changes, entity } = yield* Effect.fromResult(
          workspaceInvitationTransitions.acceptWorkspaceInvitation({
            workspaceInvitation,
            email: params.email,
            now,
          })
        );

        const persistedWorkspaceInvitation =
          yield* workspaceInvitationRepo.update({
            id: entity.id,
            workspaceId: entity.workspaceId,
            update: changes,
          });

        return persistedWorkspaceInvitation;
      }),
      rejectWorkspaceInvitation: Effect.fn(
        "workspace-invitation.rejectWorkspaceInvitation"
      )(function* (params) {
        const now = yield* DateTime.now;

        const workspaceInvitation =
          yield* findWorkspaceInvitationByInvitationId(params.id);

        const { changes, entity } = yield* Effect.fromResult(
          workspaceInvitationTransitions.rejectWorkspaceInvitation({
            workspaceInvitation,
            email: params.email,
            now,
          })
        );

        const persistedWorkspaceInvitation =
          yield* workspaceInvitationRepo.update({
            id: entity.id,
            workspaceId: entity.workspaceId,
            update: changes,
          });

        return persistedWorkspaceInvitation;
      }),
    };
  })
);
