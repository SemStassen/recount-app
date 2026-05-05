import { ExternalProjectReference } from "@recount/core/modules/integration";
import { RepositoryError } from "@recount/core/shared/repository";
import { Database, schema } from "@recount/db";
import { and, eq } from "drizzle-orm";
import { Effect, Layer, Schema } from "effect";
import { SqlSchema } from "effect/unstable/sql";

import { ExternalProjectReferenceRepository } from "./external-project-reference-repository.service";

export const ExternalProjectReferenceRepositoryLayer = Layer.effect(
  ExternalProjectReferenceRepository,
  Effect.gen(function* () {
    const db = yield* Database;

    const insertExternalProjectReference = SqlSchema.findOne({
      Request: ExternalProjectReference.insert,
      Result: ExternalProjectReference,
      execute: (data) =>
        db.drizzle((drizzle) =>
          drizzle
            .insert(schema.externalProjectReferencesTable)
            .values(data)
            .returning()
            .execute()
        ),
    });

    const findExternalProjectReferenceByExternalId = SqlSchema.findOneOption({
      Request: Schema.Struct({
        workspaceId: ExternalProjectReference.fields.workspaceId,
        provider: ExternalProjectReference.fields.provider,
        externalId: Schema.String,
      }),
      Result: ExternalProjectReference,
      execute: ({ workspaceId, provider, externalId }) =>
        db.drizzle((drizzle) =>
          drizzle
            .select()
            .from(schema.externalProjectReferencesTable)
            .where(
              and(
                eq(
                  schema.externalProjectReferencesTable.workspaceId,
                  workspaceId
                ),
                eq(schema.externalProjectReferencesTable.provider, provider),
                eq(schema.externalProjectReferencesTable.externalId, externalId)
              )
            )
            .execute()
        ),
    });

    return {
      insert: (data) =>
        insertExternalProjectReference(data).pipe(
          Effect.mapError((e) => new RepositoryError({ cause: e }))
        ),
      findByExternalId: (params) =>
        findExternalProjectReferenceByExternalId(params).pipe(
          Effect.mapError((e) => new RepositoryError({ cause: e }))
        ),
    };
  })
);
