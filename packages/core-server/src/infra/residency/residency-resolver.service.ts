import {
  WorkspaceNotFoundError,
  WorkspaceRepository,
} from "@recount/core/modules/workspace";
import type { RepositoryError } from "@recount/core/shared/repository";
import type { DataResidencyRegion } from "@recount/core/shared/residency";
import type { WorkspaceId } from "@recount/core/shared/schemas";
import { Context, Layer, Option, Effect } from "effect";

export interface ResidencyResolverShape {
  readonly resolveWorkspaceRegion: (
    workspaceId: WorkspaceId
  ) => Effect.Effect<
    DataResidencyRegion,
    WorkspaceNotFoundError | RepositoryError
  >;
}

export class ResidencyResolver extends Context.Service<
  ResidencyResolver,
  ResidencyResolverShape
>()("@recount/infra/residency/ResidencyResolver") {
  static readonly layer = Layer.effect(
    ResidencyResolver,
    Effect.gen(function* () {
      const workspaceRepository = yield* WorkspaceRepository;

      return {
        resolveWorkspaceRegion: Effect.fn("residency.resolveWorkspaceRegion")(
          function* (workspaceId: WorkspaceId) {
            const maybeWorkspace =
              yield* workspaceRepository.findById(workspaceId);

            const workspace = yield* Option.match(maybeWorkspace, {
              onNone: () =>
                Effect.fail(new WorkspaceNotFoundError({ workspaceId })),
              onSome: Effect.succeed,
            });

            return workspace.dataResidencyRegion;
          }
        ),
      };
    })
  );
}
