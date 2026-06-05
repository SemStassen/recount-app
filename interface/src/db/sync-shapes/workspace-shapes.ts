import { WorkspaceIntegrationConnection } from "@recount/core/modules/integration";
import { WorkspaceMember } from "@recount/core/modules/workspace-member";
import { Schema, Struct } from "effect";

import {
  decodeWorkspaceProjectRow,
  decodeWorkspaceTaskRow,
  decodeWorkspaceTrackedTimeRow,
  projectCollectionSchema,
  taskCollectionSchema,
  trackedTimeCollectionSchema,
} from "../workspace/workspace-collection-codecs";
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
    schema: projectCollectionSchema,
    getKey: (project) => project.id,
    decodeRow: decodeWorkspaceProjectRow,
  }),
  tasks: defineShape({
    name: "tasks",
    routePath: "/tasks",
    schema: taskCollectionSchema,
    getKey: (task) => task.id,
    decodeRow: decodeWorkspaceTaskRow,
  }),
  timeEntries: defineShape({
    name: "time-entries",
    routePath: "/time-entries",
    schema: trackedTimeCollectionSchema,
    getKey: (timeEntry) => timeEntry.id,
    decodeRow: decodeWorkspaceTrackedTimeRow,
  }),
};
