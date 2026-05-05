import type { ExternalProjectReference } from "@recount/core/modules/integration";
import type { RepositoryError } from "@recount/core/shared/repository";
import type { Effect, Option } from "effect";
import { Context } from "effect";

export interface ExternalProjectReferenceRepositoryShape {
  readonly insert: (
    data: typeof ExternalProjectReference.insert.Type
  ) => Effect.Effect<ExternalProjectReference, RepositoryError>;
  readonly findByExternalId: (params: {
    workspaceId: ExternalProjectReference["workspaceId"];
    provider: ExternalProjectReference["provider"];
    externalId: string;
  }) => Effect.Effect<Option.Option<ExternalProjectReference>, RepositoryError>;
}

export class ExternalProjectReferenceRepository extends Context.Service<
  ExternalProjectReferenceRepository,
  ExternalProjectReferenceRepositoryShape
>()("@recount/integration/ExternalProjectReferenceRepository") {}
