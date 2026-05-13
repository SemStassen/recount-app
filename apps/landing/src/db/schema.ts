import {
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

export const waitlistTable = sqliteTable(
  "waitlist",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    email: text("email").notNull(),

    confirmationCode: text("confirmation_code").notNull(),
    confirmationExpiresAt: text("confirmation_expires_at").notNull(),
    confirmedAt: text("confirmed_at"),

    source: text("source").notNull(),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [uniqueIndex("waitlist_signups_email_idx").on(table.email)]
);
