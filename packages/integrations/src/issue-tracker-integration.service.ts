import { PlainApiKey } from "@recount/core/shared/schemas";
import { Context, Effect, Option } from "effect";

import { IntegrationError } from "./errors";

export interface ExternalProject {
  readonly externalId: string;
  readonly name: string;
  readonly color: Option.Option<string>;
}

export interface ExternalTask {
  readonly externalId: string;
  readonly externalProjectId: Option.Option<string>;
  readonly name: string;
}

export interface IssueTrackerIntegrationShape {
  readonly listProjects: (params: {
    apiKey: PlainApiKey;
  }) => Effect.Effect<ReadonlyArray<ExternalProject>, IntegrationError>;
  readonly listTasks: (params: {
    apiKey: PlainApiKey;
    projectId: Option.Option<string>;
  }) => Effect.Effect<ReadonlyArray<ExternalTask>, IntegrationError>;
}

export class IssueTrackerIntegration extends Context.Service<
  IssueTrackerIntegration,
  IssueTrackerIntegrationShape
>()("@recount/integrations/IssueTrackerIntegration") {}
