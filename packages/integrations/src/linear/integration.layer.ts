import { LinearClient } from "@linear/sdk";
import type { PlainApiKey } from "@recount/core/shared/schemas";
import { Effect, Layer, Redacted, Option } from "effect";

import { IntegrationError } from "../errors";
import { IssueTrackerIntegration } from "../issue-tracker-integration.service";

const createLinearClient = (apiKey: PlainApiKey) =>
  new LinearClient({
    apiKey: Redacted.value(apiKey),
  });

export const LinearIntegrationLayer = Layer.succeed(IssueTrackerIntegration, {
  listProjects: ({ apiKey }) =>
    Effect.gen(function* () {
      const client = createLinearClient(apiKey);

      const projects = yield* Effect.tryPromise({
        try: () => client.projects(),
        catch: () => new IntegrationError(),
      });

      return projects.nodes.map((project) => ({
        externalId: project.id,
        name: project.name,
        color: Option.fromUndefinedOr(project.color),
      }));
    }),
  listTasks: ({ apiKey, projectId }) =>
    Effect.gen(function* () {
      const client = createLinearClient(apiKey);

      const issues = yield* Effect.tryPromise({
        try: () =>
          client.issues({
            filter: {
              project: {
                id: {
                  eq: Option.getOrNull(projectId),
                },
              },
            },
          }),
        catch: () => new IntegrationError(),
      });

      return issues.nodes.map((issue) => ({
        externalId: issue.id,
        externalProjectId: Option.fromUndefinedOr(issue.projectId),
        name: issue.title,
      }));
    }),
});
