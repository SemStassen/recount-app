import { jsonb, pgTable, unique, uuid, varchar } from "drizzle-orm/pg-core";

import { tableId, tableMetadata } from "#utils/snippets";

import { projectsTable, tasksTable } from "./project.schema";
import { workspaceMembersTable } from "./workspace-member.schema";
import { workspacesTable } from "./workspace.schema";

export const workspaceIntegrationConnectionsTable = pgTable(
  "workspace_integration_connections",
  {
    id: tableId,
    // References
    workspaceId: uuid("workspace_id")
      .references(() => workspacesTable.id, { onDelete: "cascade" })
      .notNull(),
    createdByWorkspaceMemberId: uuid(
      "created_by_workspace_member_id"
    ).references(() => workspaceMembersTable.id, { onDelete: "set null" }),
    // General
    provider: varchar().notNull(),
    encryptedApiKey: varchar("encrypted_api_key").notNull(),
    // Metadata
    _metadata: jsonb("metadata").$type<Record<string, unknown>>(),
    ...tableMetadata,
  },
  (table) => [
    unique("unique_workspace_id_provider").on(
      table.workspaceId,
      table.provider
    ),
  ]
);

export const externalProjectReferencesTable = pgTable(
  "external_project_references",
  {
    id: tableId,
    // References
    workspaceId: uuid("workspace_id")
      .references(() => workspacesTable.id, { onDelete: "cascade" })
      .notNull(),
    projectId: uuid("project_id")
      .references(() => projectsTable.id)
      .notNull(),
    workspaceIntegrationConnectionId: uuid(
      "workspace_integration_connection_id"
    )
      .references(() => workspaceIntegrationConnectionsTable.id, {
        onDelete: "set null",
      })
    // General
    provider: varchar().notNull(),
    externalId: varchar("external_id").notNull(),
    ...tableMetadata,
  }
);

export const externalTaskReferencesTable = pgTable("external_task_references", {
  id: tableId,
  // References
  workspaceId: uuid("workspace_id")
    .references(() => workspacesTable.id, { onDelete: "cascade" })
    .notNull(),
  taskId: uuid("task_id")
    .references(() => tasksTable.id)
    .notNull(),
  workspaceIntegrationConnectionId: uuid("workspace_integration_connection_id")
    .references(() => workspaceIntegrationConnectionsTable.id, {
      onDelete: "set null",
    })
  // General
  provider: varchar().notNull(),
  externalId: varchar("external_id").notNull(),
  ...tableMetadata,
});
