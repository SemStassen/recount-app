import { pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

import { tableId, tableMetadata } from "#utils/snippets";

import { usersTable } from "./identity.schema";
import { workspacesTable } from "./workspace.schema";

export const workspaceMembersTable = pgTable("workspace_members", {
  id: tableId,
  // References
  userId: uuid("user_id")
    .references(() => usersTable.id, { onDelete: "cascade" })
    .notNull(),
  workspaceId: uuid("workspace_id")
    .references(() => workspacesTable.id, { onDelete: "cascade" })
    .notNull(),
  // General
  displayName: varchar("display_name").notNull(),
  role: varchar("role").notNull(),
  avatarUrl: varchar("avatar_url"),
  // Metadata
  removedAt: timestamp("removed_at", {
    withTimezone: true,
    precision: 0,
  }),
  ...tableMetadata,
});
