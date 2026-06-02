import { Project, ProjectRepository } from "@recount/core/modules/project";
import { RepositoryError } from "@recount/core/shared/repository";
import { eq, inArray, queryOnce } from "@tanstack/react-db";
import { Effect, Layer, Option } from "effect";

import {
  type ClientRepositoryCollection,
  updateCollectionItem,
} from "./client-repository-collection";

type ProjectRow = typeof Project.json.Type;
type ProjectCollection = ClientRepositoryCollection<ProjectRow>;

const toRepositoryError = (cause: unknown) => new RepositoryError({ cause });

const normalizeProject = (project: ProjectRow): Project =>
  Project.make({
    id: project.id,
    workspaceId: project.workspaceId,
    name: project.name,
    color: project.color,
    isBillable: project.isBillable,
    notes: project.notes,
    archivedAt: project.archivedAt,
  });

export function createClientProjectRepositoryLayer(
  projectsCollection: ProjectCollection
) {
  return Layer.succeed(ProjectRepository, {
    insertMany: (data) =>
      Effect.try({
        try: () => {
          const projects = data.map(normalizeProject);
          projectsCollection.insert(projects);

          return projects;
        },
        catch: toRepositoryError,
      }),
    update: ({ id, update }) =>
      Effect.tryPromise({
        try: async () => {
          updateCollectionItem(projectsCollection, id, update);

          const project = await queryOnce((q) =>
            q
              .from({ project: projectsCollection })
              .where(({ project }) => eq(project.id, id))
              .findOne()
          );

          if (!project) {
            throw new Error(`Project ${id} was not found after local write`);
          }

          return normalizeProject(project);
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

          if (!project || project.workspaceId !== workspaceId) {
            return Option.none<Project>();
          }

          return Option.some(normalizeProject(project));
        },
        catch: toRepositoryError,
      }),
    findManyByIds: ({ workspaceId, ids }) =>
      Effect.tryPromise({
        try: async () => {
          const projects = await queryOnce((q) =>
            q
              .from({ project: projectsCollection })
              .where(({ project }) => inArray(project.id, [...ids]))
          );

          return projects
            .filter((project) => project.workspaceId === workspaceId)
            .map(normalizeProject);
        },
        catch: toRepositoryError,
      }),
  });
}
