import { WorkspaceIntegrationConnection } from "@recount/core/modules/integration";
import { RepositoryError } from "@recount/core/shared/repository";
import { Database, schema } from "@recount/db";
import { and, eq } from "drizzle-orm";
import { Effect, Layer, Redacted, Schema } from "effect";
import { SqlSchema } from "effect/unstable/sql";

import { WorkspaceIntegrationConnectionRepository } from "./workspace-integration-connection-repository.service";

export const WorkspaceIntegrationConnectionRepositoryLayer = Layer.effect(
  WorkspaceIntegrationConnectionRepository,
  Effect.gen(function* () {
    const db = yield* Database;

    const insertWorkspaceIntegrationConnection = SqlSchema.findOne({
      Request: WorkspaceIntegrationConnection.insert,
      Result: WorkspaceIntegrationConnection,
      execute: (data) =>
        db.drizzle((drizzle) =>
          drizzle
            .insert(schema.workspaceIntegrationConnectionsTable)
            .values({
              ...data,
              encryptedApiKey: Redacted.value(data.apiKey),
            })
            .returning()
            .execute()
        ),
    });

    const updateWorkspaceIntegrationConnection = SqlSchema.findOne({
      Request: Schema.Struct({
        workspaceId: WorkspaceIntegrationConnection.fields.workspaceId,
        id: WorkspaceIntegrationConnection.fields.id,
        update: WorkspaceIntegrationConnection.update,
      }),
      Result: WorkspaceIntegrationConnection,
      execute: ({ workspaceId, id, update }) =>
        db.drizzle((drizzle) =>
          drizzle
            .update(schema.workspaceIntegrationConnectionsTable)
            .set({
              ...update,
              ...(update.apiKey
                ? { encryptedApiKey: Redacted.value(update.apiKey) }
                : {}),
            })
            .where(
              and(
                eq(
                  schema.workspaceIntegrationConnectionsTable.workspaceId,
                  workspaceId
                ),
                eq(schema.workspaceIntegrationConnectionsTable.id, id)
              )
            )
            .returning()
            .execute()
        ),
    });

    const hardDeleteWorkspaceIntegrationConnection = SqlSchema.void({
      Request: Schema.Struct({
        workspaceId: WorkspaceIntegrationConnection.fields.workspaceId,
        id: WorkspaceIntegrationConnection.fields.id,
      }),
      execute: ({ workspaceId, id }) =>
        db.drizzle((drizzle) =>
          drizzle
            .delete(schema.workspaceIntegrationConnectionsTable)
            .where(
              and(
                eq(
                  schema.workspaceIntegrationConnectionsTable.workspaceId,
                  workspaceId
                ),
                eq(schema.workspaceIntegrationConnectionsTable.id, id)
              )
            )
            .execute()
        ),
    });

    const findWorkspaceIntegrationConnectionById = SqlSchema.findOneOption({
      Request: Schema.Struct({
        workspaceId: WorkspaceIntegrationConnection.fields.workspaceId,
        id: WorkspaceIntegrationConnection.fields.id,
      }),
      Result: WorkspaceIntegrationConnection,
      execute: ({ workspaceId, id }) =>
        db.drizzle((drizzle) =>
          drizzle
            .select()
            .from(schema.workspaceIntegrationConnectionsTable)
            .where(
              and(
                eq(
                  schema.workspaceIntegrationConnectionsTable.workspaceId,
                  workspaceId
                ),
                eq(schema.workspaceIntegrationConnectionsTable.id, id)
              )
            )
            .execute()
        ),
    });

    const findWorkspaceIntegrationConnectionByProvider =
      SqlSchema.findOneOption({
        Request: Schema.Struct({
          workspaceId: WorkspaceIntegrationConnection.fields.workspaceId,
          provider: WorkspaceIntegrationConnection.fields.provider,
        }),
        Result: WorkspaceIntegrationConnection,
        execute: ({ workspaceId, provider }) =>
          db.drizzle((drizzle) =>
            drizzle
              .select()
              .from(schema.workspaceIntegrationConnectionsTable)
              .where(
                and(
                  eq(
                    schema.workspaceIntegrationConnectionsTable.workspaceId,
                    workspaceId
                  ),
                  eq(
                    schema.workspaceIntegrationConnectionsTable.provider,
                    provider
                  )
                )
              )
              .execute()
          ),
      });

    return {
      insert: (data) =>
        insertWorkspaceIntegrationConnection(data).pipe(
          Effect.mapError((e) => new RepositoryError({ cause: e }))
        ),
      update: (params) =>
        updateWorkspaceIntegrationConnection(params).pipe(
          Effect.mapError((e) => new RepositoryError({ cause: e }))
        ),
      hardDelete: (params) =>
        hardDeleteWorkspaceIntegrationConnection(params).pipe(
          Effect.mapError((e) => new RepositoryError({ cause: e }))
        ),
      findById: (params) =>
        findWorkspaceIntegrationConnectionById(params).pipe(
          Effect.mapError((e) => new RepositoryError({ cause: e }))
        ),
      findByProvider: (params) =>
        findWorkspaceIntegrationConnectionByProvider(params).pipe(
          Effect.mapError((e) => new RepositoryError({ cause: e }))
        ),
    };
  })
);
