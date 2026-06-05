import { Project, ProjectRepository } from "@recount/core/modules/project";
import { RepositoryError } from "@recount/core/shared/repository";
import { eq, inArray, queryOnce } from "@tanstack/react-db";
import { Effect, Layer, Option } from "effect";

import {
  type ProjectCollectionInsert,
  type ProjectCollectionRow,
  toProjectEntity,
} from "~/db/workspace/workspace-collection-codecs";

import {
  type ClientRepositoryCollection,
  toQueryableCollection,
  updateCollectionItem,
} from "./client-repository-collection";

type ProjectCollection = ClientRepositoryCollection<
  ProjectCollectionRow,
  ProjectCollectionInsert
>;

const toRepositoryError = (cause: unknown) => new RepositoryError({ cause });

export function createClientProjectRepositoryLayer(
  projectsCollection: ProjectCollection
) {
  const queryableProjectsCollection = toQueryableCollection<
    ProjectCollectionRow,
    ProjectCollectionInsert
  >(projectsCollection);

  return Layer.succeed(ProjectRepository, {
    insertMany: (data) =>
      Effect.try({
        try: () => {
          const projects = data.map(toProjectEntity);
          projectsCollection.insert(projects);

          return projects;
        },
        catch: toRepositoryError,
      }),
    update: ({ id, update }) =>
      Effect.tryPromise({
        try: async () => {
          updateCollectionItem<ProjectCollectionRow, ProjectCollectionInsert>(
            projectsCollection,
            id,
            update
          );

          const project = await queryOnce((q) =>
            q
              .from({ project: queryableProjectsCollection })
              .where(({ project }) => eq(project.id, id))
              .findOne()
          );

          if (!project) {
            throw new Error(`Project ${id} was not found after local write`);
          }

          return toProjectEntity(project);
        },
        catch: toRepositoryError,
      }),
    findById: ({ workspaceId, id }) =>
      Effect.tryPromise({
        try: async () => {
          const project = await queryOnce((q) =>
            q
              .from({ project: queryableProjectsCollection })
              .where(({ project }) => eq(project.id, id))
              .findOne()
          );

          if (!project || project.workspaceId !== workspaceId) {
            return Option.none<Project>();
          }

          return Option.some(toProjectEntity(project));
        },
        catch: toRepositoryError,
      }),
    findManyByIds: ({ workspaceId, ids }) =>
      Effect.tryPromise({
        try: async () => {
          const projects = await queryOnce((q) =>
            q
              .from({ project: queryableProjectsCollection })
              .where(({ project }) => inArray(project.id, [...ids]))
          );

          return projects
            .filter((project) => project.workspaceId === workspaceId)
            .map(toProjectEntity);
        },
        catch: toRepositoryError,
      }),
  });
}
