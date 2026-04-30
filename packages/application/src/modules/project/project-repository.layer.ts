import { Project, ProjectRepository } from "@recount/core/modules/project";
import { RepositoryError } from "@recount/core/shared/repository";
import { Database, schema } from "@recount/db";
import { and, eq, inArray } from "drizzle-orm";
import { Effect, Layer, Schema } from "effect";
import { SqlSchema } from "effect/unstable/sql";

export const ProjectRepositoryLayer = Layer.effect(
  ProjectRepository,
  Effect.gen(function* () {
    const db = yield* Database;

    const insertManyProjects = SqlSchema.findAll({
      Request: Schema.Array(Project.insert),
      Result: Project,
      execute: (data) =>
        db.drizzle((drizzle) =>
          drizzle
            .insert(schema.projectsTable)
            .values([...data])
            .returning()
            .execute()
        ),
    });

    const updateProject = SqlSchema.findOne({
      Request: Schema.Struct({
        workspaceId: Project.fields.workspaceId,
        id: Project.fields.id,
        update: Project.update,
      }),
      Result: Project,
      execute: ({ workspaceId, id, update }) =>
        db.drizzle((drizzle) =>
          drizzle
            .update(schema.projectsTable)
            .set(update)
            .where(
              and(
                eq(schema.projectsTable.workspaceId, workspaceId),
                eq(schema.projectsTable.id, id)
              )
            )
            .returning()
            .execute()
        ),
    });

    const findProjectById = SqlSchema.findOneOption({
      Request: Schema.Struct({
        workspaceId: Project.fields.workspaceId,
        id: Project.fields.id,
      }),
      Result: Project,
      execute: ({ workspaceId, id }) =>
        db.drizzle((drizzle) =>
          drizzle
            .select()
            .from(schema.projectsTable)
            .where(
              and(
                eq(schema.projectsTable.workspaceId, workspaceId),
                eq(schema.projectsTable.id, id)
              )
            )
            .execute()
        ),
    });

    const findManyByIds = SqlSchema.findAll({
      Request: Schema.Struct({
        workspaceId: Project.fields.workspaceId,
        ids: Schema.Array(Project.fields.id),
      }),
      Result: Project,
      execute: ({ workspaceId, ids }) =>
        db.drizzle((drizzle) =>
          drizzle
            .select()
            .from(schema.projectsTable)
            .where(
              and(
                eq(schema.projectsTable.workspaceId, workspaceId),
                inArray(schema.projectsTable.id, ids)
              )
            )
            .execute()
        ),
    });

    return {
      insertMany: (data) =>
        insertManyProjects(data).pipe(
          Effect.mapError((e) => new RepositoryError({ cause: e }))
        ),
      update: (params) =>
        updateProject(params).pipe(
          Effect.mapError((e) => new RepositoryError({ cause: e }))
        ),
      findById: (params) =>
        findProjectById(params).pipe(
          Effect.mapError((e) => new RepositoryError({ cause: e }))
        ),
      findManyByIds: (params) =>
        findManyByIds(params).pipe(
          Effect.mapError((e) => new RepositoryError({ cause: e }))
        ),
    };
  })
);
