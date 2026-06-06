import { Task } from "@recount/core/modules/project";
import { TaskRepository } from "@recount/core/modules/project/persistence";
import { RepositoryError } from "@recount/core/shared/repository";
import { Database, schema } from "@recount/db";
import { and, eq } from "drizzle-orm";
import { Effect, Layer, Schema } from "effect";
import { SqlSchema } from "effect/unstable/sql";

export const TaskRepositoryLayer = Layer.effect(
  TaskRepository,
  Effect.gen(function* () {
    const db = yield* Database;

    const insertManyTasks = SqlSchema.findAll({
      Request: Schema.Array(Task.insert),
      Result: Task,
      execute: (data) =>
        db.drizzle((drizzle) =>
          drizzle
            .insert(schema.tasksTable)
            .values([...data])
            .returning()
            .execute()
        ),
    });

    const updateTask = SqlSchema.findOne({
      Request: Schema.Struct({
        workspaceId: Task.fields.workspaceId,
        id: Task.fields.id,
        update: Task.update,
      }),
      Result: Task,
      execute: ({ workspaceId, id, update }) =>
        db.drizzle((drizzle) =>
          drizzle
            .update(schema.tasksTable)
            .set(update)
            .where(
              and(
                eq(schema.tasksTable.workspaceId, workspaceId),
                eq(schema.tasksTable.id, id)
              )
            )
            .returning()
            .execute()
        ),
    });

    const findTaskById = SqlSchema.findOneOption({
      Request: Schema.Struct({
        workspaceId: Task.fields.workspaceId,
        id: Task.fields.id,
      }),
      Result: Task,
      execute: ({ workspaceId, id }) =>
        db.drizzle((drizzle) =>
          drizzle
            .select()
            .from(schema.tasksTable)
            .where(
              and(
                eq(schema.tasksTable.workspaceId, workspaceId),
                eq(schema.tasksTable.id, id)
              )
            )
            .execute()
        ),
    });

    return {
      insertMany: (data) =>
        insertManyTasks(data).pipe(
          Effect.mapError((e) => new RepositoryError({ cause: e }))
        ),
      update: (params) =>
        updateTask(params).pipe(
          Effect.mapError((e) => new RepositoryError({ cause: e }))
        ),
      findById: (params) =>
        findTaskById(params).pipe(
          Effect.mapError((e) => new RepositoryError({ cause: e }))
        ),
    };
  })
);
