import { Project, ProjectRepository } from "@recount/core/modules/project";
import { RepositoryError } from "@recount/core/shared/repository";
import { eq, inArray, queryOnce, type Collection } from "@tanstack/react-db";
import { Effect, Layer, Option } from "effect";

type ProjectCollection = Collection<Project>;

const toRepositoryError = (cause: unknown) => new RepositoryError({ cause });

export function createClientProjectRepositoryLayer(
  projectsCollection: ProjectCollection
) {
  return Layer.succeed(ProjectRepository, {
    insertMany: (data) =>
      Effect.try({
        try: () => {
          projectsCollection.insert([...data]);

          return data;
        },
        catch: toRepositoryError,
      }),
    update: ({ id, update }) =>
      Effect.tryPromise({
        try: async () => {
          projectsCollection.update(id, (draftValue) => {
            Object.assign(draftValue, update);
          });

          const project = await queryOnce((q) =>
            q
              .from({ project: projectsCollection })
              .where(({ project }) => eq(project.id, id))
              .findOne()
          );

          if (!project) {
            throw new Error(`Project ${id} was not found after local write`);
          }

          return project;
        },
        catch: toRepositoryError,
      }),
    findById: ({ workspaceId, id }) =>
      Effect.tryPromise({
        try: async () => {
          const project = await queryOnce((q) =>
            q
              .from({ project: projectsCollection })
              .where(({ project }) => eq(project.id, id))
              .findOne()
          );

          if (!project) {
            return Option.none();
          }

          return Option.some(project);
        },
        catch: toRepositoryError,
      }),
    findManyByIds: ({ workspaceId, ids }) =>
      Effect.tryPromise({
        try: () =>
          queryOnce((q) =>
            q
              .from({ project: projectsCollection })
              .where(({ project }) => inArray(project.id, [...ids]))
          ),
        catch: toRepositoryError,
      }),
  });
}
