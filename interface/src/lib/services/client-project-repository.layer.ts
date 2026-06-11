import { Project } from "@recount/core/modules/project";
import { ProjectRepository } from "@recount/core/modules/project/persistence";
import { RepositoryError } from "@recount/core/shared/repository";
import { Effect, Layer, Option } from "effect";

import type {
  ProjectCollectionInsert,
  ProjectCollectionRow,
} from "~/db/synced-collections";
import {
  toProjectCollectionInsert,
  toProjectCollectionPatch,
  toProjectEntity,
} from "~/db/synced-collections";

import { updateCollectionItem } from "./client-repository-collection";
import type { ClientRepositoryCollection } from "./client-repository-collection";

type ProjectCollection = ClientRepositoryCollection<
  ProjectCollectionRow,
  ProjectCollectionInsert
>;

const toRepositoryError = (cause: unknown) => new RepositoryError({ cause });

export function createClientProjectRepositoryLayer(
  projectsCollection: ProjectCollection
) {
  return Layer.succeed(ProjectRepository, {
    findById: ({ workspaceId, id }) =>
      Effect.try({
        catch: toRepositoryError,
        try: () => {
          const project = projectsCollection.get(id);

          if (!project || project.workspaceId !== workspaceId) {
            return Option.none<Project>();
          }

          return Option.some(toProjectEntity(project));
        },
      }),
    findManyByIds: ({ workspaceId, ids }) =>
      Effect.try({
        catch: toRepositoryError,
        try: () =>
          ids
            .map((id) => projectsCollection.get(id))
            .filter((project) => project !== undefined)
            .filter((project) => project.workspaceId === workspaceId)
            .map(toProjectEntity),
      }),
    insertMany: (data) =>
      Effect.try({
        catch: toRepositoryError,
        try: () => {
          const projects = data.map((project) => Project.make(project));
          projectsCollection.insert(projects.map(toProjectCollectionInsert));

          return projects;
        },
      }),
    update: ({ id, update }) =>
      Effect.try({
        catch: toRepositoryError,
        try: () => {
          updateCollectionItem<ProjectCollectionRow, ProjectCollectionInsert>(
            projectsCollection,
            id,
            toProjectCollectionPatch(update)
          );

          const project = projectsCollection.get(id);

          if (!project) {
            throw new Error(`Project ${id} was not found after local write`);
          }

          return toProjectEntity(project);
        },
      }),
  });
}
