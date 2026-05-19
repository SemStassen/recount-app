import { DateTime, Effect, Layer, Option } from "effect";

import type { Project } from "./domain/project.entity";
import * as projectTransitions from "./domain/project.transitions";
import type { Task } from "./domain/task.entity";
import * as taskTransitions from "./domain/task.transitions";
import {
  ProjectModule,
  ProjectNotFoundError,
  TaskNotFoundError,
} from "./project-module.service";
import { ProjectRepository } from "./project-repository.service";
import { TaskRepository } from "./task-repository.service";

export const ProjectModuleLayer = Layer.effect(
  ProjectModule,
  Effect.gen(function* () {
    const projectRepo = yield* ProjectRepository;
    const taskRepo = yield* TaskRepository;

    const getProjectById = (params: {
      workspaceId: Project["workspaceId"];
      id: Project["id"];
    }) =>
      projectRepo
        .findById({ workspaceId: params.workspaceId, id: params.id })
        .pipe(
          Effect.flatMap(
            Option.match({
              onNone: () =>
                Effect.fail(new ProjectNotFoundError({ projectId: params.id })),
              onSome: Effect.succeed,
            })
          )
        );

    const getTaskById = (params: {
      workspaceId: Task["workspaceId"];
      id: Task["id"];
    }) =>
      taskRepo
        .findById({ workspaceId: params.workspaceId, id: params.id })
        .pipe(
          Effect.flatMap(
            Option.match({
              onNone: () =>
                Effect.fail(new TaskNotFoundError({ taskId: params.id })),
              onSome: Effect.succeed,
            })
          )
        );

    return {
      createProjects: Effect.fn("project.createProjects")(function* (params) {
        if (params.data.length === 0) {
          return [];
        }

        const projects = yield* Effect.forEach(params.data, (data) =>
          Effect.fromResult(
            projectTransitions.createProject({
              workspaceId: params.workspaceId,
              data,
            })
          )
        );

        const persistedProjects = yield* projectRepo.insertMany(projects);

        return persistedProjects;
      }),
      updateProject: Effect.fn("project.updateProject")(function* (params) {
        const project = yield* getProjectById({
          workspaceId: params.workspaceId,
          id: params.id,
        });

        const { entity, patch } = yield* Effect.fromResult(
          projectTransitions.updateProject({
            project,
            data: params.data,
          })
        );

        const persistedProject = yield* projectRepo.update({
          workspaceId: entity.workspaceId,
          id: entity.id,
          update: patch,
        });

        return persistedProject;
      }),
      archiveProject: Effect.fn("project.archiveProject")(function* (params) {
        const project = yield* getProjectById({
          workspaceId: params.workspaceId,
          id: params.id,
        });

        const now = yield* DateTime.now;
        const { entity, patch } = yield* Effect.fromResult(
          projectTransitions.archiveProject({
            project,
            now,
          })
        );

        yield* Option.match(patch, {
          onNone: () => Effect.void,
          onSome: (update) =>
            projectRepo.update({
              workspaceId: entity.workspaceId,
              id: entity.id,
              update,
            }),
        });
      }),
      unarchiveProject: Effect.fn("project.unarchiveProject")(
        function* (params) {
          const project = yield* getProjectById({
            workspaceId: params.workspaceId,
            id: params.id,
          });

          const { entity, patch } = yield* Effect.fromResult(
            projectTransitions.unarchiveProject({
              project,
            })
          );

          yield* Option.match(patch, {
            onNone: () => Effect.void,
            onSome: (update) =>
              projectRepo.update({
                workspaceId: entity.workspaceId,
                id: entity.id,
                update,
              }),
          });
        }
      ),
      createTasks: Effect.fn("project.createTasks")(function* (params) {
        if (params.data.length === 0) {
          return [];
        }

        const projectIds = [...new Set(params.data.map((d) => d.projectId))];
        const projects = yield* projectRepo.findManyByIds({
          workspaceId: params.workspaceId,
          ids: projectIds,
        });
        const projectsById = new Map(
          projects.map((project) => [project.id, project])
        );

        const tasks = yield* Effect.forEach(params.data, (data) =>
          Effect.gen(function* () {
            const project = projectsById.get(data.projectId);

            if (!project) {
              return yield* new ProjectNotFoundError({
                projectId: data.projectId,
              });
            }

            return yield* Effect.fromResult(
              taskTransitions.createTask({
                project,
                data,
              })
            );
          })
        );

        const persistedTasks = yield* taskRepo.insertMany(tasks);

        return persistedTasks;
      }),
      updateTask: Effect.fn("project.updateTask")(function* (params) {
        const task = yield* getTaskById({
          workspaceId: params.workspaceId,
          id: params.id,
        });

        const project = yield* getProjectById({
          workspaceId: params.workspaceId,
          id: task.projectId,
        });

        const { entity, patch } = yield* Effect.fromResult(
          taskTransitions.updateTask({ task, project, data: params.data })
        );

        const persistedTask = yield* taskRepo.update({
          id: entity.id,
          workspaceId: entity.workspaceId,
          update: patch,
        });

        return persistedTask;
      }),
      archiveTask: Effect.fn("project.archiveTask")(function* (params) {
        const task = yield* getTaskById({
          workspaceId: params.workspaceId,
          id: params.id,
        });

        const now = yield* DateTime.now;
        const { entity, patch } = yield* Effect.fromResult(
          taskTransitions.archiveTask({ task, now })
        );

        yield* Option.match(patch, {
          onNone: () => Effect.void,
          onSome: (update) =>
            taskRepo.update({
              workspaceId: entity.workspaceId,
              id: entity.id,
              update,
            }),
        });
      }),
      unarchiveTask: Effect.fn("project.unarchiveTask")(function* (params) {
        const task = yield* getTaskById({
          workspaceId: params.workspaceId,
          id: params.id,
        });

        const project = yield* getProjectById({
          workspaceId: params.workspaceId,
          id: task.projectId,
        });

        const { entity, patch } = yield* Effect.fromResult(
          taskTransitions.unarchiveTask({ task, project })
        );

        yield* Option.match(patch, {
          onNone: () => Effect.void,
          onSome: (update) =>
            taskRepo.update({
              workspaceId: entity.workspaceId,
              id: entity.id,
              update,
            }),
        });
      }),
    };
  })
);
