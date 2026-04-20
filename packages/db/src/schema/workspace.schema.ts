import { Workspace } from "@recount/core/modules/workspace";
import { pgEnum, pgTable, text } from "drizzle-orm/pg-core";

import { tableId, tableMetadata } from "#utils/snippets";

export const dataResidencyRegionEnum = pgEnum(
  "data_residency_region_enum",
  Workspace.fields.dataResidencyRegion.schema.literals
);

export const workspacesTable = pgTable("workspaces", {
  id: tableId,
  // General
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  logoUrl: text("logo_url"),
  dataResidencyRegion: dataResidencyRegionEnum("data_residency_region")
    .default("global")
    .notNull(),
  metadata: text("metadata"),
  // Metadata
  ...tableMetadata,
});
