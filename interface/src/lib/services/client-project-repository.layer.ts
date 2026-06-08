import { Project } from "@recount/core/modules/project";
import { ProjectRepository } from "@recount/core/modules/project/persistence";
import { RepositoryError } from "@recount/core/shared/repository";
import { Effect, Layer, Option } from "effect";

import {
  type ProjectCollectionInsert,
  type ProjectCollectionRow,
  toProjectEntity,
} from "~/db/workspace/workspace-collection-codecs";

import {
  type ClientRepositoryCollection,
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
      Effect.try({
        try: () => {
          updateCollectionItem<ProjectCollectionRow, ProjectCollectionInsert>(
            projectsCollection,
            id,
            update
          );

          const project = projectsCollection.get(id);

          if (!project) {
            throw new Error(`Project ${id} was not found after local write`);
          }

          return toProjectEntity(project);
        },
        catch: toRepositoryError,
      }),
    findById: ({ workspaceId, id }) =>
      Effect.try({
        try: () => {
          const project = projectsCollection.get(id);

          if (!project || project.workspaceId !== workspaceId) {
            return Option.none<Project>();
          }

          return Option.some(toProjectEntity(project));
        },
        catch: toRepositoryError,
      }),
    findManyByIds: ({ workspaceId, ids }) =>
      Effect.try({
        try: () => {
          return ids
            .map((id) => projectsCollection.get(id))
            .filter((project) => project !== undefined)
            .filter((project) => project.workspaceId === workspaceId)
            .map(toProjectEntity);
        },
        catch: toRepositoryError,
      }),
  });
}
