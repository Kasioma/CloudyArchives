// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { sql } from "drizzle-orm";
import * as pg from "drizzle-orm/pg-core";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pg.pgTableCreator(
  (name) => `Cloudy Archives_${name}`,
);

export const posts = createTable(
  "post",
  {
    id: pg.serial("id").primaryKey(),
    name: pg.varchar("name", { length: 256 }),
    createdAt: pg
      .timestamp("created_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: pg.timestamp("updatedAt"),
  },
  (example) => ({
    nameIndex: pg.index("name_idx").on(example.name),
  }),
);

export const roleEnum = pg.pgEnum("role", ["user", "moderator"]);

export const userTable = createTable("user", {
  id: pg.text("id").primaryKey(),
  username: pg.text("username").notNull().unique(),
  role: roleEnum("role").default("user").notNull(),
});

export const providerEnum = pg.pgEnum("providerType", ["github", "discord"]);

export const providersTable = createTable(
  "providers",
  {
    providerType: providerEnum("provider_type").notNull(),
    providerUserId: pg.text("provider_user_id").notNull(),
    userId: pg
      .text("user_id")
      .notNull()
      .references(() => userTable.id),
  },
  (table) => {
    return {
      pk: pg.primaryKey({
        columns: [table.providerType, table.providerUserId],
      }),
    };
  },
);

export const sessionTable = createTable("session", {
  id: pg.text("id").primaryKey(),
  userId: pg
    .text("user_id")
    .notNull()
    .references(() => userTable.id),
  expiresAt: pg
    .timestamp("expires_at", {
      withTimezone: true,
      mode: "date",
    })
    .notNull(),
});

export const passwordTable = createTable("passwords", {
  userId: pg
    .text("user_id")
    .notNull()
    .primaryKey()
    .references(() => userTable.id),
  password: pg.text("text").notNull(),
});
