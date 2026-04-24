import { FileVisibility } from "@recount/core-server/modules/file";
import { pgTable, varchar, bigint, uuid, pgEnum } from "drizzle-orm/pg-core";

import { tableId, tableMetadata } from "#utils/snippets";

import { dataResidencyRegionEnum, workspacesTable } from "./workspace.schema";

export const fileVisibilityEnum = pgEnum(
  "file_visibility_enum",
  FileVisibility.literals
);

export const filesTable = pgTable("files", {
  id: tableId,
  // General
  workspaceId: uuid("workspace_id")
    .references(() => workspacesTable.id, { onDelete: "cascade" })
    .notNull(),
  objectKey: varchar("object_key").notNull(),
  contentType: varchar("content_type").notNull(),
  size: bigint("size", { mode: "number" }).notNull(),
  originalFilename: varchar("original_filename").notNull(),
  visibility: fileVisibilityEnum("visibility").default("private").notNull(),
  storageRegion: dataResidencyRegionEnum("storage_region").notNull(),
  // Metadata
  ...tableMetadata,
});
