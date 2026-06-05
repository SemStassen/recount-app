import { Context } from "effect";
import type { Effect } from "effect";

import type { RepositoryError } from "#shared/repository/index";

import type { TimeEntry } from "../domain/tracked-time.entity";
import type {
  TargetProjectNotFoundError,
  TargetTaskNotFoundError,
  TargetTaskProjectMismatchError,
} from "../domain/tracked-time.errors";

export interface TrackedTimeTargetValidatorShape {
  readonly validate: (params: {
    readonly workspaceId: TimeEntry["workspaceId"];
    readonly projectId: TimeEntry["projectId"];
    readonly taskId: TimeEntry["taskId"];
  }) => Effect.Effect<
    void,
    | TargetProjectNotFoundError
    | TargetTaskNotFoundError
    | TargetTaskProjectMismatchError
    | RepositoryError
  >;
}

export class TrackedTimeTargetValidator extends Context.Service<
  TrackedTimeTargetValidator,
  TrackedTimeTargetValidatorShape
>()("@recount/time/TrackedTimeTargetValidator") {}
