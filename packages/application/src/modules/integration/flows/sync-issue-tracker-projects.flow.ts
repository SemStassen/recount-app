import { WorkspaceIntegrationConnectionNotFoundError } from "@recount/core/modules/integration";
import { ProjectModule } from "@recount/core/modules/project";
import {
  HexColor,
  ExternalProjectReferenceId,
} from "@recount/core/shared/schemas";
import type { WorkspaceIntegrationConnectionId } from "@recount/core/shared/schemas";
import { generateUUID } from "@recount/core/shared/utils";
import { IssueTrackerIntegration } from "@recount/integrations";
import { DateTime, Effect, Option } from "effect";

import { ApplicationContext } from "#shared/application-context";

import { ExternalProjectReferenceRepository } from "../external-project-reference-repository.service";
import { IntegrationModule } from "../integration-module.service";
import { WorkspaceIntegrationConnectionRepository } from "../workspace-integration-connection-repository.service";

export const syncIssueTrackerProjectsFlow = Effect.fn(
  "flows.syncIssueTrackerProjectsFlow"
)(function* (request: { integrationId: WorkspaceIntegrationConnectionId }) {
  const appContext = yield* ApplicationContext;
  const integrationModule = yield* IntegrationModule;
  const issueTrackerIntegration = yield* IssueTrackerIntegration;
  const projectModule = yield* ProjectModule;
  const externalProjectReferenceRepo =
    yield* ExternalProjectReferenceRepository;
  const workspaceIntegrationConnectionRepo =
    yield* WorkspaceIntegrationConnectionRepository;

  const { workspace } = yield* appContext.authorizedWorkspace(
    "workspace:create_integration_connection"
  );

  const workspaceIntegrationConnection =
    yield* workspaceIntegrationConnectionRepo
      .findById({
        workspaceId: workspace.id,
        id: request.integrationId,
      })
      .pipe(
        Effect.flatMap(
          Option.match({
            onNone: () =>
              Effect.fail(
                new WorkspaceIntegrationConnectionNotFoundError({
                  workspaceIntegrationConnectionId: request.integrationId,
                })
              ),
            onSome: Effect.succeed,
          })
        )
      );

  const apiKey =
    yield* integrationModule.revealWorkspaceIntegrationConnectionApiKey({
      workspaceId: workspace.id,
      id: workspaceIntegrationConnection.id,
    });

  const externalProjects = yield* issueTrackerIntegration.listProjects({
    apiKey,
  });

  return yield* Effect.forEach(externalProjects, (externalProject) =>
    Effect.gen(function* () {
      const existingMapping =
        yield* externalProjectReferenceRepo.findByExternalId({
          workspaceId: workspace.id,
          provider: workspaceIntegrationConnection.provider,
          externalId: externalProject.externalId,
        });

      if (Option.isSome(existingMapping)) {
        return yield* projectModule.updateProject({
          workspaceId: workspace.id,
          id: existingMapping.value.projectId,
          data: {
            name: externalProject.name,
          },
        });
      }

      const [project] = yield* projectModule.createProjects({
        workspaceId: workspace.id,
        data: [
          {
            id: Option.none(),
            name: externalProject.name,
            color: externalProject.color.pipe(
              Option.map((color) => HexColor.make(color)),
              Option.getOrElse(() => HexColor.make("#000000"))
            ),
            isBillable: false,
            notes: Option.none(),
          },
        ],
      });
      const now = yield* DateTime.now;

      yield* externalProjectReferenceRepo.insert({
        id: ExternalProjectReferenceId.make(generateUUID()),
        workspaceId: workspace.id,
        workspaceIntegrationConnectionId: workspaceIntegrationConnection.id,
        projectId: project.id,
        provider: workspaceIntegrationConnection.provider,
        externalId: externalProject.externalId,
        createdAt: now,
      });

      return project;
    })
  );
});
