import { DateTime, Option, Result } from "effect";
import { describe, expect, it } from "vitest";

import {
  HexColor,
  ProjectId,
  TaskId,
  WorkspaceId,
} from "#shared/schemas/index";
import { generateUUID } from "#shared/utils/index";

import { Project } from "./project.entity";
import { ProjectArchivedError } from "./project.errors";
import { Task } from "./task.entity";
import {
  archiveTask,
  createTask,
  restoreTask,
  updateTask,
} from "./task.transitions";

const workspaceId = () => WorkspaceId.make(generateUUID());
const projectId = () => ProjectId.make(generateUUID());
const taskId = () => TaskId.make(generateUUID());
const now = DateTime.makeUnsafe(new Date("2026-01-01T00:00:00.000Z"));

const makeProject = (overrides: Partial<Project> = {}) =>
  Project.make({
    id: projectId(),
    workspaceId: workspaceId(),
    name: "Project",
    color: HexColor.make("#000000"),
    isBillable: false,
    notes: Option.none(),
    archivedAt: Option.none(),
    ...overrides,
  });

const makeTask = (overrides: Partial<Task> = {}) =>
  Task.make({
    id: taskId(),
    workspaceId: workspaceId(),
    projectId: projectId(),
    name: "Task",
    archivedAt: Option.none(),
    ...overrides,
  });

describe("Task transitions", () => {
  it("creates a Task under the loaded Project", () => {
    const project = makeProject();
    const submittedProjectId = projectId();

    const result = Result.getOrThrow(
      createTask({
        project,
        data: {
          id: Option.none(),
          projectId: submittedProjectId,
          name: "New Task",
        },
      })
    );

    expect(result.projectId).toBe(project.id);
    expect(result.workspaceId).toBe(project.workspaceId);
    expect(result.name).toBe("New Task");
  });

  it("rejects creating a Task under an archived Project", () => {
    const project = makeProject({ archivedAt: Option.some(now) });

    const result = createTask({
      project,
      data: {
        id: Option.none(),
        projectId: project.id,
        name: "New Task",
      },
    });

    expect(Option.getOrThrow(Result.getFailure(result))).toBeInstanceOf(
      ProjectArchivedError
    );
  });

  it("rejects updating a Task under an archived Project", () => {
    const project = makeProject({ archivedAt: Option.some(now) });
    const task = makeTask({
      workspaceId: project.workspaceId,
      projectId: project.id,
    });

    const result = updateTask({
      task,
      project,
      data: { name: "Renamed" },
    });

    expect(Option.getOrThrow(Result.getFailure(result))).toBeInstanceOf(
      ProjectArchivedError
    );
  });

  it("archives a Task without checking the parent Project", () => {
    const task = makeTask();

    const result = Result.getOrThrow(archiveTask({ task, now }));

    expect(result.entity.archivedAt).toStrictEqual(Option.some(now));
    expect(result.patch).toStrictEqual(
      Option.some({ archivedAt: Option.some(now) })
    );
  });

  it("does not write a patch when archiving an already archived Task", () => {
    const task = makeTask({ archivedAt: Option.some(now) });

    const result = Result.getOrThrow(archiveTask({ task, now }));

    expect(result.entity).toBe(task);
    expect(result.patch).toStrictEqual(Option.none());
  });

  it("rejects restoring a Task under an archived Project", () => {
    const project = makeProject({ archivedAt: Option.some(now) });
    const task = makeTask({
      workspaceId: project.workspaceId,
      projectId: project.id,
      archivedAt: Option.some(now),
    });

    const result = restoreTask({ task, project });

    expect(Option.getOrThrow(Result.getFailure(result))).toBeInstanceOf(
      ProjectArchivedError
    );
  });
});
