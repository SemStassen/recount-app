import { WorkspaceIntegration } from "@recount/core/modules/integration";
import { Project, Task } from "@recount/core/modules/project";
import { WorkspaceMember } from "@recount/core/modules/workspace-member";
import { Schema, Struct } from "effect";

import { defineShape } from "./define-shape";

export const workspaceShapes = {
  workspaceMembers: defineShape({
    name: "workspace-members",
    routePath: "/workspace-members",
    schema: Schema.toStandardSchemaV1(WorkspaceMember.json),
    getKey: (workspaceMember) => workspaceMember.id,
    decodeRow: (row) =>
      Schema.decodeUnknownSync(
        WorkspaceMember.json.mapFields(Struct.map(Schema.optionalKey))
      )(row),
  }),
  workspaceIntegrations: defineShape({
    name: "workspace-integrations",
    routePath: "/workspace-integrations",
    schema: Schema.toStandardSchemaV1(WorkspaceIntegration.json),
    getKey: (workspaceIntegration) => workspaceIntegration.id,
    decodeRow: (row) =>
      Schema.decodeUnknownSync(
        WorkspaceIntegration.json
          .mapFields(
            Struct.evolve({
              createdAt: () => Schema.DateTimeUtcFromString,
            })
          )
          .mapFields(Struct.map(Schema.optionalKey))
      )(row),
  }),
  projects: defineShape({
    name: "projects",
    routePath: "/projects",
    schema: Schema.toStandardSchemaV1(Project.json),
    getKey: (project) => project.id,
    decodeRow: (row) =>
      Schema.decodeUnknownSync(
        Project.json.mapFields(Struct.map(Schema.optionalKey))
      )(row),
  }),
  tasks: defineShape({
    name: "tasks",
    routePath: "/tasks",
    schema: Schema.toStandardSchemaV1(Task.json),
    getKey: (task) => task.id,
    decodeRow: (row) =>
      Schema.decodeUnknownSync(
        Task.json.mapFields(Struct.map(Schema.optionalKey))
      )(row),
  }),
};
