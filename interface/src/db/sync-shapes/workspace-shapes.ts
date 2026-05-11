import { WorkspaceIntegrationConnection } from "@recount/core/modules/integration";
import { Project, Task } from "@recount/core/modules/project";
import { TimeEntry } from "@recount/core/modules/time";
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
  workspaceIntegrationConnections: defineShape({
    name: "workspace-integration-connections",
    routePath: "/workspace-integration-connections",
    schema: Schema.toStandardSchemaV1(WorkspaceIntegrationConnection.json),
    getKey: (workspaceIntegrationConnection) =>
      workspaceIntegrationConnection.id,
    decodeRow: (row) =>
      Schema.decodeUnknownSync(
        WorkspaceIntegrationConnection.json
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
        Project.json
          .mapFields(
            Struct.evolve({
              archivedAt: () =>
                Schema.OptionFromNullOr(Schema.DateTimeUtcFromString),
            })
          )
          .mapFields(Struct.map(Schema.optionalKey))
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
  timeEntries: defineShape({
    name: "time-entries",
    routePath: "/time-entries",
    schema: Schema.toStandardSchemaV1(TimeEntry.json),
    getKey: (timeEntry) => timeEntry.id,
    decodeRow: (row) =>
      Schema.decodeUnknownSync(
        TimeEntry.json
          .mapFields(
            Struct.evolve({
              startedAt: () => Schema.DateTimeUtcFromString,
              stoppedAt: () =>
                Schema.OptionFromNullOr(Schema.DateTimeUtcFromString),
            })
          )
          .mapFields(Struct.map(Schema.optionalKey))
      )(row),
  }),
};
