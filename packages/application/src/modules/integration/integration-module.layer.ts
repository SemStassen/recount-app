import {
  WorkspaceIntegrationConnectionNotFoundError,
  WorkspaceIntegrationConnectionProviderAlreadyExistsError,
} from "@recount/core/modules/integration";
import { EncryptedApiKey, PlainApiKey } from "@recount/core/shared/schemas";
import { DateTime, Effect, Layer, Option, Redacted } from "effect";

import { Crypto } from "#shared/crypto";

import * as workspaceIntegrationConnectionTransitions from "./domain/workspace-integration-connection.transitions";
import { IntegrationModule } from "./integration-module.service";
import { WorkspaceIntegrationConnectionRepository } from "./workspace-integration-connection-repository.service";

export const IntegrationModuleLayer = Layer.effect(
  IntegrationModule,
  Effect.gen(function* () {
    const crypto = yield* Crypto;
    const workspaceIntegrationConnectionRepo =
      yield* WorkspaceIntegrationConnectionRepository;

    const encryptApiKey = Effect.fn("integration.encryptApiKey")(function* (
      apiKey: Redacted.Redacted<string>
    ) {
      const encrypted = yield* crypto.encrypt(Redacted.value(apiKey));

      return EncryptedApiKey.make(Redacted.make(encrypted));
    });

    const decryptApiKey = Effect.fn("integration.decryptApiKey")(function* (
      encryptedApiKey: EncryptedApiKey
    ) {
      const decrypted = yield* crypto.decrypt(Redacted.value(encryptedApiKey));

      return PlainApiKey.make(Redacted.make(decrypted));
    });

    return {
      createWorkspaceIntegrationConnection: Effect.fn(
        "integration.createWorkspaceIntegrationConnection"
      )(function* (params) {
        const now = yield* DateTime.now;

        yield* workspaceIntegrationConnectionRepo
          .findByProvider({
            workspaceId: params.workspaceId,
            provider: params.data.provider,
          })
          .pipe(
            Effect.flatMap(
              Option.match({
                onSome: () =>
                  Effect.fail(
                    new WorkspaceIntegrationConnectionProviderAlreadyExistsError()
                  ),
                onNone: () => Effect.void,
              })
            )
          );

        const encryptedApiKey = yield* encryptApiKey(params.data.apiKey);

        const workspaceIntegrationConnection = yield* Effect.fromResult(
          workspaceIntegrationConnectionTransitions.createWorkspaceIntegrationConnection(
            {
              createdByWorkspaceMemberId: params.createdByWorkspaceMemberId,
              workspaceId: params.workspaceId,
              data: params.data,
              apiKey: encryptedApiKey,
              now,
            }
          )
        );

        const persistedWorkspaceIntegrationConnection =
          yield* workspaceIntegrationConnectionRepo.insert(
            workspaceIntegrationConnection
          );

        return persistedWorkspaceIntegrationConnection;
      }),
      updateWorkspaceIntegrationConnection: Effect.fn(
        "integration.updateWorkspaceIntegrationConnection"
      )(function* (params) {
        const workspaceIntegrationConnection =
          yield* workspaceIntegrationConnectionRepo
            .findById({
              workspaceId: params.workspaceId,
              id: params.id,
            })
            .pipe(
              Effect.flatMap(
                Option.match({
                  onNone: () =>
                    Effect.fail(
                      new WorkspaceIntegrationConnectionNotFoundError({
                        workspaceIntegrationConnectionId: params.id,
                      })
                    ),
                  onSome: Effect.succeed,
                })
              )
            );

        const encryptedApiKey = params.data.apiKey
          ? yield* encryptApiKey(params.data.apiKey)
          : undefined;

        const { entity, changes } = yield* Effect.fromResult(
          workspaceIntegrationConnectionTransitions.updateWorkspaceIntegrationConnection(
            {
              workspaceIntegrationConnection,
              data: params.data,
              apiKey: encryptedApiKey,
            }
          )
        );

        const persistedWorkspaceIntegrationConnection =
          yield* workspaceIntegrationConnectionRepo.update({
            workspaceId: params.workspaceId,
            id: entity.id,
            update: changes,
          });

        return persistedWorkspaceIntegrationConnection;
      }),
      hardDeleteWorkspaceIntegrationConnection: Effect.fn(
        "integration.hardDeleteWorkspaceIntegrationConnection"
      )(function* (params) {
        const workspaceIntegrationConnection =
          yield* workspaceIntegrationConnectionRepo
            .findById({
              workspaceId: params.workspaceId,
              id: params.id,
            })
            .pipe(
              Effect.flatMap(
                Option.match({
                  onNone: () =>
                    Effect.fail(
                      new WorkspaceIntegrationConnectionNotFoundError({
                        workspaceIntegrationConnectionId: params.id,
                      })
                    ),
                  onSome: Effect.succeed,
                })
              )
            );

        yield* workspaceIntegrationConnectionRepo.hardDelete({
          workspaceId: params.workspaceId,
          id: workspaceIntegrationConnection.id,
        });
      }),
      revealWorkspaceIntegrationConnectionApiKey: Effect.fn(
        "integration.revealWorkspaceIntegrationConnectionApiKey"
      )(function* (params) {
        const workspaceIntegrationConnection =
          yield* workspaceIntegrationConnectionRepo
            .findById({
              workspaceId: params.workspaceId,
              id: params.id,
            })
            .pipe(
              Effect.flatMap(
                Option.match({
                  onNone: () =>
                    Effect.fail(
                      new WorkspaceIntegrationConnectionNotFoundError({
                        workspaceIntegrationConnectionId: params.id,
                      })
                    ),
                  onSome: Effect.succeed,
                })
              )
            );

        return yield* decryptApiKey(workspaceIntegrationConnection.apiKey);
      }),
    };
  })
);
