import { WorkspaceIntegrationConnection } from "@recount/core/modules/integration";
import { RepositoryError } from "@recount/core/shared/repository";
import { Database, schema } from "@recount/db";
import { and, eq } from "drizzle-orm";
import { Effect, Layer, Redacted, Schema, Context } from "effect";
import type { Option } from "effect";
import { SqlSchema } from "effect/unstable/sql";

export interface WorkspaceIntegrationConnectionRepositoryShape {
  readonly insert: (
    data: typeof WorkspaceIntegrationConnection.insert.Type
  ) => Effect.Effect<WorkspaceIntegrationConnection, RepositoryError>;
  readonly update: (params: {
    workspaceId: WorkspaceIntegrationConnection["workspaceId"];
    id: WorkspaceIntegrationConnection["id"];
    update: typeof WorkspaceIntegrationConnection.update.Type;
  }) => Effect.Effect<WorkspaceIntegrationConnection, RepositoryError>;
  readonly hardDelete: (params: {
    workspaceId: WorkspaceIntegrationConnection["workspaceId"];
    id: WorkspaceIntegrationConnection["id"];
  }) => Effect.Effect<void, RepositoryError>;
  readonly findById: (params: {
    workspaceId: WorkspaceIntegrationConnection["workspaceId"];
    id: WorkspaceIntegrationConnection["id"];
  }) => Effect.Effect<
    Option.Option<WorkspaceIntegrationConnection>,
    RepositoryError
  >;
  readonly findByProvider: (params: {
    workspaceId: WorkspaceIntegrationConnection["workspaceId"];
    provider: WorkspaceIntegrationConnection["provider"];
  }) => Effect.Effect<
    Option.Option<WorkspaceIntegrationConnection>,
    RepositoryError
  >;
}

export class WorkspaceIntegrationConnectionRepository extends Context.Service<
  WorkspaceIntegrationConnectionRepository,
  WorkspaceIntegrationConnectionRepositoryShape
>()("@recount/integration/WorkspaceIntegrationConnectionRepository") {
  static readonly layer = Layer.effect(
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
}

// export const WorkspaceIntegrationConnectionRepositoryLayer = Layer.effect(
//   WorkspaceIntegrationConnectionRepository,
//   Effect.gen(function* () {
//     const drizzle = yield* Drizzle;

//     const insertWorkspaceIntegrationConnection = SqlSchema.findOne({
//       Request: WorkspaceIntegrationConnection.insert,
//       Result: WorkspaceIntegrationConnection,
//       execute: (data) =>
//         drizzle
//           .insert(schema.workspaceIntegrationConnectionsTable)
//           .values({
//             ...data,
//             encryptedApiKey: Redacted.value(data.apiKey),
//           })
//           .returning(),
//     });

//     const updateWorkspaceIntegrationConnection = SqlSchema.findOne({
//       Request: Schema.Struct({
//         workspaceId: WorkspaceIntegrationConnection.fields.workspaceId,
//         id: WorkspaceIntegrationConnection.fields.id,
//         update: WorkspaceIntegrationConnection.update,
//       }),
//       Result: WorkspaceIntegrationConnection,
//       execute: ({ workspaceId, id, update }) =>
//         drizzle
//           .update(schema.workspaceIntegrationConnectionsTable)
//           .set({
//             ...update,
//             ...(update.apiKey
//               ? { encryptedApiKey: Redacted.value(update.apiKey) }
//               : {}),
//           })
//           .where(
//             and(
//               eq(schema.workspaceIntegrationConnectionsTable.workspaceId, workspaceId),
//               eq(schema.workspaceIntegrationConnectionsTable.id, id)
//             )
//           )
//           .returning(),
//     });

//     const hardDeleteWorkspaceIntegrationConnection = SqlSchema.findOneOption({
//       Request: Schema.Struct({
//         workspaceId: WorkspaceIntegrationConnection.fields.workspaceId,
//         id: WorkspaceIntegrationConnection.fields.id,
//       }),
//       Result: Schema.Void,
//       execute: ({ workspaceId, id }) =>
//         drizzle
//           .delete(schema.workspaceIntegrationConnectionsTable)
//           .where(
//             and(
//               eq(schema.workspaceIntegrationConnectionsTable.workspaceId, workspaceId),
//               eq(schema.workspaceIntegrationConnectionsTable.id, id)
//             )
//           ),
//     });

//     const findWorkspaceIntegrationConnectionById = SqlSchema.findOneOption({
//       Request: Schema.Struct({
//         workspaceId: WorkspaceIntegrationConnection.fields.workspaceId,
//         id: WorkspaceIntegrationConnection.fields.id,
//       }),
//       Result: WorkspaceIntegrationConnection,
//       execute: ({ workspaceId, id }) =>
//         drizzle
//           .select()
//           .from(schema.workspaceIntegrationConnectionsTable)
//           .where(
//             and(
//               eq(schema.workspaceIntegrationConnectionsTable.workspaceId, workspaceId),
//               eq(schema.workspaceIntegrationConnectionsTable.id, id)
//             )
//           ),
//     });

//     const findWorkspaceIntegrationConnectionByProvider = SqlSchema.findOneOption({
//       Request: Schema.Struct({
//         workspaceId: WorkspaceIntegrationConnection.fields.workspaceId,
//         provider: WorkspaceIntegrationConnection.fields.provider,
//       }),
//       Result: WorkspaceIntegrationConnection,
//       execute: ({ workspaceId, provider }) =>
//         drizzle
//           .select()
//           .from(schema.workspaceIntegrationConnectionsTable)
//           .where(
//             and(
//               eq(schema.workspaceIntegrationConnectionsTable.workspaceId, workspaceId),
//               eq(schema.workspaceIntegrationConnectionsTable.provider, provider)
//             )
//           ),
//     });

//     return {
//       insert: (data) =>
//         insertWorkspaceIntegrationConnection(data).pipe(
//           Effect.mapError((e) => new RepositoryError({ cause: e }))
//         ),
//       update: (params) =>
//         updateWorkspaceIntegrationConnection(params).pipe(
//           Effect.mapError((e) => new RepositoryError({ cause: e }))
//         ),
//       hardDelete: (params) =>
//         hardDeleteWorkspaceIntegrationConnection(params).pipe(
//           Effect.mapError((e) => new RepositoryError({ cause: e }))
//         ),
//       findById: (params) =>
//         findWorkspaceIntegrationConnectionById(params).pipe(
//           Effect.mapError((e) => new RepositoryError({ cause: e }))
//         ),
//       findByProvider: (params) =>
//         findWorkspaceIntegrationConnectionByProvider(params).pipe(
//           Effect.mapError((e) => new RepositoryError({ cause: e }))
//         ),
//     };
//   })
// );
