import { Project, ProjectRepository } from "@recount/core/modules/project";
import { RepositoryError } from "@recount/core/shared/repository";
import type { Collection } from "@tanstack/react-db";
import { Effect, Layer, Option } from "effect";

// interface ProjectCollection {
//   get: (id: Project["id"]) => Project | undefined;
//   insert: (data: Array<typeof Project.insert.Type>) => unknown;
//   update: {
//     (ids: Array<unknown>, update: (drafts: Array<unknown>) => void): unknown;
//     (id: unknown, update: (draft: unknown) => void): unknown;
//   };
//   values: () => Iterable<Project>;
// }

type ProjectCollection = Collection<Project, Project["id"]>;

const toRepositoryError = (cause: unknown) => new RepositoryError({ cause });

const normalizeProject = (project: Project): Project =>
  Project.make({
    id: project.id,
    workspaceId: project.workspaceId,
    name: project.name,
    color: project.color,
    isBillable: project.isBillable,
    notes: project.notes,
    archivedAt: project.archivedAt,
  });

const getAcceptedProject = (
  projectsCollection: ProjectCollection,
  id: Project["id"]
) => {
  const acceptedProject = projectsCollection.get(id);

  if (!acceptedProject) {
    throw new Error(`Project ${id} was not found after local write`);
  }

  return normalizeProject(acceptedProject);
};

export function createClientProjectRepositoryLayer(
  projectsCollection: ProjectCollection
) {
  return Layer.succeed(ProjectRepository, {
    insertMany: (data) =>
      Effect.try({
        try: () => {
          const projects = data.map(normalizeProject);
          projectsCollection.insert(data.map((p) => p));

          return projects.map((project) =>
            getAcceptedProject(projectsCollection, project.id)
          );
        },
        catch: toRepositoryError,
      }),
    update: ({ workspaceId, id, update }) =>
      Effect.try({
        try: () => {
          projectsCollection.update(id, (draftValue) => {
            const draft = draftValue as Project;
            Object.assign(draft, update);
          });

          const acceptedProject = getAcceptedProject(projectsCollection, id);

          if (acceptedProject.workspaceId !== workspaceId) {
            throw new Error(`Project ${id} was not found in workspace`);
          }

          return acceptedProject;
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

          return Option.some(normalizeProject(project));
        },
        catch: toRepositoryError,
      }),
    findManyByIds: ({ workspaceId, ids }) =>
      Effect.try({
        try: () => {
          const idSet = new Set(ids);

          return Array.from(projectsCollection.values())
            .filter(
              (project) =>
                project.workspaceId === workspaceId && idSet.has(project.id)
            )
            .map(normalizeProject);
        },
        catch: toRepositoryError,
      }),
  });
}
