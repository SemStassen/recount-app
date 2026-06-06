import { DateTime, Option, Result } from "effect";
import { describe, expect, it } from "vitest";

import { HexColor, ProjectId, WorkspaceId } from "#shared/schemas/index";
import { generateUUID } from "#shared/utils/index";

import { Project } from "../domain/project.entity";
import {
  archiveProject,
  createProject,
  unarchiveProject,
  updateProject,
} from "../domain/project.transitions";

const makeProject = (overrides: Partial<Project> = {}) =>
  Project.make({
    id: ProjectId.make(generateUUID()),
    workspaceId: WorkspaceId.make(generateUUID()),
    name: "Project",
    color: HexColor.make("#000000"),
    isBillable: false,
    notes: Option.none(),
    archivedAt: Option.none(),
    ...overrides,
  });

const now = DateTime.makeUnsafe(new Date("2026-01-01T00:00:00.000Z"));

describe("Project transitions", () => {
  it("archives an active Project", () => {
    const project = makeProject();

    const result = Result.getOrThrow(archiveProject({ project, now }));

    expect(result.entity.archivedAt).toStrictEqual(Option.some(now));
    expect(result.patch).toStrictEqual(
      Option.some({ archivedAt: Option.some(now) })
    );
  });

  it("does not write a patch when archiving an already archived Project", () => {
    const project = makeProject({ archivedAt: Option.some(now) });

    const result = Result.getOrThrow(archiveProject({ project, now }));

    expect(result.entity).toBe(project);
    expect(result.patch).toStrictEqual(Option.none());
  });

  it("unarchives an archived Project", () => {
    const project = makeProject({ archivedAt: Option.some(now) });

    const result = Result.getOrThrow(unarchiveProject({ project }));

    expect(result.entity.archivedAt).toStrictEqual(Option.none());
    expect(result.patch).toStrictEqual(
      Option.some({ archivedAt: Option.none() })
    );
  });

  it("does not write a patch when restoring an active Project", () => {
    const project = makeProject();

    const result = Result.getOrThrow(unarchiveProject({ project }));

    expect(result.entity).toBe(project);
    expect(result.patch).toStrictEqual(Option.none());
  });

  it("preserves the accepted update patch", () => {
    const project = makeProject({ name: "Existing" });

    const result = Result.getOrThrow(
      updateProject({ project, data: { name: "Existing" } })
    );

    expect(result.entity.name).toBe("Existing");
    expect(result.patch).toStrictEqual({ name: "Existing" });
  });

  it("defaults optional create fields in the transition", () => {
    const workspaceId = WorkspaceId.make(generateUUID());

    const result = Result.getOrThrow(
      createProject({
        workspaceId,
        data: {
          id: Option.none(),
          name: "Project",
        },
      })
    );

    expect(result.color).toBe(HexColor.make("#000000"));
    expect(result.isBillable).toBe(false);
  });

  it("preserves provided create fields", () => {
    const workspaceId = WorkspaceId.make(generateUUID());

    const result = Result.getOrThrow(
      createProject({
        workspaceId,
        data: {
          id: Option.none(),
          name: "Project",
          color: HexColor.make("#ff0000"),
          isBillable: true,
        },
      })
    );

    expect(result.color).toBe(HexColor.make("#ff0000"));
    expect(result.isBillable).toBe(true);
  });
});
