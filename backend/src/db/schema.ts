import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const lists = sqliteTable("lists", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
});

export const rows = sqliteTable(
  "rows",
  {
    id: text("id").primaryKey(),
    listId: text("list_id")
      .notNull()
      .references(() => lists.id, { onDelete: "cascade" }),
    text: text("text").notNull(),
    checked: integer("checked", { mode: "boolean" }).notNull().default(false),
    position: integer("position").notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
  },
  (table) => ({
    listPositionIdx: index("rows_list_position_idx").on(table.listId, table.position),
  }),
);

export type ListRecord = typeof lists.$inferSelect;
export type RowRecord = typeof rows.$inferSelect;
