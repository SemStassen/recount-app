import {
  boolean,
  jsonb,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { tableArchive, tableId, tableMetadata } from "#utils/snippets";

import { workspacesTable } from "./workspace.schema";

export const projectsTable = pgTable("projects", {
  id: tableId,
  // References
  workspaceId: uuid("workspace_id")
    .references(() => workspacesTable.id, { onDelete: "cascade" })
    .notNull(),
  // General
  name: varchar("name").notNull(),
  hexColor: varchar("color").notNull(),
  isBillable: boolean("is_billable").default(true).notNull(),
  notes: jsonb("notes"),
  // Metadata
  ...tableArchive,
  ...tableMetadata,
});

export const tasksTable = pgTable("tasks", {
  id: tableId,
  // References
  workspaceId: uuid("workspace_id")
    .references(() => workspacesTable.id, { onDelete: "cascade" })
    .notNull(),
  projectId: uuid("project_id")
    .references(() => projectsTable.id, { onDelete: "cascade" })
    .notNull(),
  // General
  name: varchar("name").notNull(),
  ...tableArchive,
  ...tableMetadata,
});
