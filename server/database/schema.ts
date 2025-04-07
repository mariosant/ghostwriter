import { relations } from "drizzle-orm";
import {
  sqliteTable,
  text,
  integer,
  customType,
} from "drizzle-orm/sqlite-core";

const customJsonb = <TData>(name: string) =>
  customType<{ data: TData; driverData: string }>({
    dataType() {
      return "jsonb";
    },
    toDriver(value: TData): string {
      return JSON.stringify(value);
    },
    fromDriver(value: string): TData {
      return JSON.parse(value);
    },
  })(name);

export const users = sqliteTable("users", {
  id: integer("id").primaryKey(),
  name: text("name").notNull(),
  avatar: text("avatar").notNull(),
  city: text("city"),
  country: text("country"),
  sex: text("sex"),
  weight: integer("weight"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
    () => new Date()
  ),
});

export const preferences = sqliteTable("preferences", {
  id: integer("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id, {
      onDelete: "cascade",
    })
    .unique(),
  data: customJsonb("data")
    .$type<{
      enabled: boolean;
      language: string;
    }>()
    .$defaultFn(() => ({
      enabled: true,
      language: "English",
    })),
});

export const tokens = sqliteTable("tokens", {
  id: integer("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id, {
      onDelete: "cascade",
    })
    .unique(),
  refreshToken: text("refresh_token"),
  accessToken: text("access_token"),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
});

// Define relationships
export const usersRelations = relations(users, ({ one }) => ({
  tokens: one(tokens, {
    fields: [users.id],
    references: [tokens.userId],
  }),
  preferences: one(preferences, {
    fields: [users.id],
    references: [preferences.userId],
  }),
}));

export const referencesRelations = relations(preferences, ({ one }) => ({
  user: one(users, {
    fields: [preferences.userId],
    references: [users.id],
  }),
}));

export const tokensRelations = relations(tokens, ({ one }) => ({
  user: one(users, {
    fields: [tokens.userId],
    references: [users.id],
  }),
}));
