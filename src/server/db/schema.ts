// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { ProviderEnum, UserRole, VisibilityEnum } from "@/lib/utils";
import * as lite from "drizzle-orm/sqlite-core";
/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = lite.sqliteTableCreator(
  (name) => `Cloudy Archivess_${name}`,
);

export const userTable = createTable("user", {
  id: lite.text("id").primaryKey(),
  username: lite.text("username").notNull().unique(),
  role: lite.text("role").notNull().$type<UserRole>().default("user"),
});

export const providersTable = createTable(
  "providers",
  {
    providerType: lite.text("providerType").notNull().$type<ProviderEnum>(),
    providerUserId: lite.text("provider_user_id").notNull(),
    userId: lite
      .text("user_id")
      .notNull()
      .references(() => userTable.id),
  },
  (table) => {
    return {
      pk: lite.primaryKey({
        columns: [table.providerType, table.providerUserId],
      }),
    };
  },
);

export const sessionTable = createTable("session", {
  id: lite.text("id").notNull().primaryKey(),
  userId: lite
    .text("user_id")
    .notNull()
    .references(() => userTable.id),
  expiresAt: lite.integer("expires_at").notNull(),
});

export const passwordTable = createTable("passwords", {
  userId: lite
    .text("user_id")
    .notNull()
    .primaryKey()
    .references(() => userTable.id),
  password: lite.text("text").notNull(),
});

export const postTable = createTable("posts", {
  postId: lite.text("post_id").notNull().primaryKey(),
  userId: lite
    .text("user_id")
    .notNull()
    .references(() => userTable.id),
  title: lite.text("title").notNull(),
  extension: lite.text("extension").notNull(),
  upvotes: lite.integer("upvotes").default(0).notNull(),
  downvotes: lite.integer("downvotes").default(0).notNull(),
  visibility: lite
    .text("visibility")
    .notNull()
    .$type<VisibilityEnum>()
    .default("private")
    .notNull(),
  status: lite.integer("status", { mode: "boolean" }).default(false).notNull(),
});

export const requestTable = createTable("requests", {
  requestId: lite.text("id").notNull().primaryKey(),
  postId: lite
    .text("post_id")
    .notNull()
    .references(() => postTable.postId),
});
